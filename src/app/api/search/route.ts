import { NextRequest, NextResponse } from 'next/server';
import { serperProvider, isSearchConfigured } from '@/lib/search/providers';
import { SearchFilters } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const company = searchParams.get('company');

  if (!company) {
    return NextResponse.json({
      configured: isSearchConfigured(),
      provider: 'serper',
    });
  }

  const filters: SearchFilters = {
    company: company.trim(),
    location: searchParams.get('location') || undefined,
    department: searchParams.get('department') || undefined,
    recruiterRole: searchParams.get('recruiterRole') || undefined,
    keywords: searchParams.get('keywords') || undefined,
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
  };

  const response = await serperProvider.search(filters);
  return NextResponse.json(response);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company, location, department, recruiterRole, keywords, page } = body;

    if (!company || typeof company !== 'string' || !company.trim()) {
      return NextResponse.json(
        { error: 'A target company name is required to search for recruiters.' },
        { status: 400 }
      );
    }

    const filters: SearchFilters = {
      company: company.trim(),
      location: location || undefined,
      department: department || undefined,
      recruiterRole: recruiterRole || undefined,
      keywords: keywords || undefined,
      page: typeof page === 'number' ? page : 1,
    };

    const response = await serperProvider.search(filters);

    if (response.rateLimited) {
      return NextResponse.json(response, { status: 429 });
    }

    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request payload';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
