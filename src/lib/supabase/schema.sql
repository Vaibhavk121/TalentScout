-- TalentScout Database Schema
-- Run this script in the Supabase SQL Editor to enable persistent cloud storage for contacts.

-- 1. Create table for saved contacts
CREATE TABLE IF NOT EXISTS public.saved_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id TEXT NOT NULL,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    linkedin_url TEXT NOT NULL,
    source_url TEXT,
    snippet TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pattern_matched',
    confidence_score INTEGER NOT NULL DEFAULT 85,
    department TEXT,
    status TEXT NOT NULL DEFAULT 'not_contacted',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_linkedin UNIQUE (user_id, linkedin_url)
);

-- 2. Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_saved_contacts_user_id ON public.saved_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_contacts_company ON public.saved_contacts(company);
CREATE INDEX IF NOT EXISTS idx_saved_contacts_status ON public.saved_contacts(status);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.saved_contacts ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (Users can only see and manage their own saved contacts)
CREATE POLICY "Users can view their own saved contacts"
    ON public.saved_contacts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved contacts"
    ON public.saved_contacts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved contacts"
    ON public.saved_contacts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved contacts"
    ON public.saved_contacts FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_updated_at ON public.saved_contacts;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.saved_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
