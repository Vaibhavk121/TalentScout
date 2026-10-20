'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { RecruiterProfile } from '@/types';
import { generateOutreachNotes } from '@/lib/outreach/generator';

interface OutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProfile?: RecruiterProfile | null;
}

const TONE_OPTIONS = [
  { id: 'concise', label: 'Concise' },
  { id: 'warm', label: 'Warm' },
  { id: 'role_focused', label: 'Role-Focused' },
  { id: 'inmail', label: 'Full InMail' },
];

export function OutreachModal({ isOpen, onClose, targetProfile }: OutreachModalProps) {
  const [recruiterName, setRecruiterName] = useState('');
  const [company, setCompany] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Software Engineer');
  const [personalHook, setPersonalHook] = useState('5+ years scaling distributed systems');
  const [selectedTone, setSelectedTone] = useState('concise');
  const [editedText, setEditedText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (targetProfile) {
      setRecruiterName(targetProfile.name);
      setCompany(targetProfile.company);
    }
  }, [targetProfile]);

  const generatedNotes = generateOutreachNotes({
    recruiterName: recruiterName || 'Recruiter',
    company: company || 'Company',
    targetRole,
    personalHook,
    tone: selectedTone as 'concise' | 'warm' | 'role_focused' | 'inmail',
    format: selectedTone === 'inmail' ? 'inmail' : 'connection_note',
  });

  const activeTemplate =
    generatedNotes.find((n) => n.id === selectedTone) || generatedNotes[0];

  useEffect(() => {
    if (activeTemplate) setEditedText(activeTemplate.text);
  }, [selectedTone, recruiterName, company, targetRole, personalHook]);

  const handleCopy = () => {
    if (!editedText) return;
    navigator.clipboard.writeText(editedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const charLimit = activeTemplate?.type === 'connection_note' ? 300 : 2000;
  const charCount = editedText.length;
  const isOverLimit = charCount > charLimit;
  const charPct = Math.min((charCount / charLimit) * 100, 100);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Outreach Assistant"
      description="Craft a personalized LinkedIn note for this recruiter."
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Recruiter + Company row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#505870] mb-1.5">
              Recruiter Name
            </label>
            <input
              type="text"
              value={recruiterName}
              onChange={(e) => setRecruiterName(e.target.value)}
              placeholder="e.g. Sarah Chen"
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#505870] mb-1.5">
              Target Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe"
              className="input-base"
            />
          </div>
        </div>

        {/* Role + Hook row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#505870] mb-1.5">
              Target Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Staff Backend Engineer"
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#505870] mb-1.5">
              Personal Hook
            </label>
            <input
              type="text"
              value={personalHook}
              onChange={(e) => setPersonalHook(e.target.value)}
              placeholder="e.g. 6+ yrs distributed systems, ex-Amazon"
              className="input-base"
            />
          </div>
        </div>

        {/* Tone picker */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#505870] mb-2">
            Tone
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {TONE_OPTIONS.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTone(t.id)}
                className={
                  selectedTone === t.id
                    ? 'py-2 px-3 rounded-xl text-xs font-semibold bg-blue-500 text-white transition-all cursor-pointer'
                    : 'py-2 px-3 rounded-xl text-xs font-semibold text-[#505870] hover:text-[#8892aa] transition-all cursor-pointer'
                }
                style={
                  selectedTone !== t.id
                    ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }
                    : undefined
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Editable draft */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#505870]">
              Draft (editable)
            </label>
            <div className="flex items-center gap-2">
              {/* Progress bar */}
              <div className="w-20 h-1 rounded-full overflow-hidden bg-white/8">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${charPct}%`,
                    background: isOverLimit
                      ? '#f87171'
                      : charPct > 85
                      ? '#fbbf24'
                      : '#4f8ef7',
                  }}
                />
              </div>
              <span
                className={`text-[11px] font-mono tabular-nums ${
                  isOverLimit
                    ? 'text-red-400'
                    : charPct > 85
                    ? 'text-amber-400'
                    : 'text-[#505870]'
                }`}
              >
                {charCount}/{charLimit}
              </span>
            </div>
          </div>

          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={selectedTone === 'inmail' ? 8 : 4}
            className="w-full p-4 rounded-xl text-[0.8125rem] text-[#f0f4ff] leading-relaxed resize-none focus:outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${isOverLimit ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.07)'}`,
              outline: 'none',
            }}
            onFocus={(e) => {
              if (!isOverLimit) e.currentTarget.style.borderColor = 'rgba(79,142,247,0.4)';
              e.currentTarget.style.boxShadow = isOverLimit
                ? '0 0 0 3px rgba(248,113,113,0.08)'
                : '0 0 0 3px rgba(79,142,247,0.08)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = isOverLimit
                ? 'rgba(248,113,113,0.4)'
                : 'rgba(255,255,255,0.07)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />

          {isOverLimit && (
            <p className="mt-2 text-[11px] text-red-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Connection notes are capped at 300 characters on LinkedIn — trim before sending.
            </p>
          )}
        </div>

        {/* Compliance note */}
        <div
          className="flex items-start gap-2.5 p-3.5 rounded-xl text-[11px] text-[#505870]"
          style={{ background: 'rgba(79,142,247,0.05)', border: '1px solid rgba(79,142,247,0.1)' }}
        >
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-[#8892aa]">Manual only.</strong> TalentScout never
            auto-sends messages or accesses your LinkedIn account. Copy this note, open their
            profile, and paste it into the connection request.
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
          {targetProfile?.linkedinUrl ? (
            <a
              href={targetProfile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[0.8125rem] font-medium text-[#8892aa] hover:text-[#f0f4ff] transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Open on LinkedIn
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCopy}
              className="min-w-[130px]"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Note</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
