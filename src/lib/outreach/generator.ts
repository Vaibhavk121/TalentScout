import { OutreachDraftOptions } from '@/types';

export interface GeneratedMessage {
  id: string;
  tone: string;
  toneLabel: string;
  text: string;
  charCount: number;
  exceedsLimit: boolean;
  type: 'connection_note' | 'inmail';
}

export function generateOutreachNotes(options: OutreachDraftOptions): GeneratedMessage[] {
  const {
    recruiterName,
    company,
    targetRole,
    personalHook,
    tone,
  } = options;

  const firstName = recruiterName.split(' ')[0] || recruiterName;
  const cleanRole = targetRole.trim() || 'Engineering';
  const cleanHook = personalHook.trim();

  const results: GeneratedMessage[] = [];

  // 1. Direct & Concise (< 300 chars)
  const conciseText = cleanHook
    ? `Hi ${firstName}, saw you recruit for ${company}. I'm a ${cleanRole} with a background in ${cleanHook}. Would love to connect and keep in touch as new roles open!`
    : `Hi ${firstName}, noticed your recruiting work at ${company}. I'm exploring ${cleanRole} opportunities and would love to connect to follow relevant openings!`;

  results.push({
    id: 'concise',
    tone: 'concise',
    toneLabel: 'Concise & Direct (Recommended)',
    text: conciseText,
    charCount: conciseText.length,
    exceedsLimit: conciseText.length > 300,
    type: 'connection_note',
  });

  // 2. Warm & Value-Driven (< 300 chars)
  const warmText = cleanHook
    ? `Hi ${firstName}, hope your week is going well! I'm following ${company}'s growth closely and saw your focus on talent. As a ${cleanRole} with experience in ${cleanHook}, I'd love to connect!`
    : `Hi ${firstName}, hope you're having a great week! Really admire what ${company} is building. I'm a ${cleanRole} and would appreciate the chance to connect with your team!`;

  results.push({
    id: 'warm',
    tone: 'warm',
    toneLabel: 'Warm & Conversational',
    text: warmText,
    charCount: warmText.length,
    exceedsLimit: warmText.length > 300,
    type: 'connection_note',
  });

  // 3. Role-Focused & High-Impact (< 300 chars)
  const roleText = cleanHook
    ? `Hi ${firstName}, reaching out as I'm targeting ${cleanRole} roles at ${company}. Recently ${cleanHook}. Would welcome the chance to connect and share my resume if there is a match.`
    : `Hi ${firstName}, reaching out regarding ${cleanRole} openings at ${company}. I'd love to connect to learn more about team hiring priorities this quarter.`;

  results.push({
    id: 'role_focused',
    tone: 'role_focused',
    toneLabel: 'Role & Skills Focused',
    text: roleText,
    charCount: roleText.length,
    exceedsLimit: roleText.length > 300,
    type: 'connection_note',
  });

  // 4. InMail / Detailed Message (Longer format for InMail or direct email)
  const inmailText = `Hi ${firstName},

I hope you're having a productive week!

I came across your profile while researching the talent team at ${company}. I'm currently exploring opportunities as a ${cleanRole} and wanted to reach out directly.

${cleanHook ? `A bit about my background: ${cleanHook}.\n\n` : ''}I've been following ${company}'s recent work and would love to learn if your team is actively recruiting for ${cleanRole} roles, or if you can point me to the hiring manager.

I would be thrilled to connect or share a brief portfolio/resume if helpful. Thank you for your time!

Best regards,
${options.candidateName || '[Your Name]'}`;

  results.push({
    id: 'inmail',
    tone: 'inmail',
    toneLabel: 'Full InMail / Email Pitch',
    text: inmailText,
    charCount: inmailText.length,
    exceedsLimit: false, // InMail limit is ~2000 chars
    type: 'inmail',
  });

  return results;
}
