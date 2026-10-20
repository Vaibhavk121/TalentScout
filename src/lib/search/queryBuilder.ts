import { RecruiterProfile, SearchFilters, VerificationStatus } from '@/types';


export function buildSearchQuery(filters: SearchFilters): string {
  const parts: string[] = [];

  // Free Serper accounts only allow plain keyword queries —
  // no site:, no OR, no parentheses, no advanced operators.
  // We rely on Google's natural ranking to surface LinkedIn profiles.

  // 1. Company name
  const cleanCompany = filters.company.trim();
  if (cleanCompany) {
    parts.push(cleanCompany);
  }

  // 2. Recruiter role / Title — single plain term
  if (filters.recruiterRole && filters.recruiterRole !== 'all') {
    parts.push(filters.recruiterRole);
  } else {
    parts.push('recruiter');
  }

  // 3. LinkedIn anchor — plain keyword so Google surfaces /in/ profiles
  parts.push('linkedin');

  // 4. Department / Specialty
  if (filters.department && filters.department !== 'all') {
    parts.push(filters.department);
  }

  // 5. Location
  if (filters.location && filters.location !== 'all') {
    parts.push(filters.location);
  }

  // 6. Additional keywords
  if (filters.keywords?.trim()) {
    parts.push(filters.keywords.trim());
  }

  return parts.join(' ');
}

export interface RawSerperItem {
  title: string;
  link: string;
  snippet?: string;
  imageUrl?: string;
  thumbnail?: string;
  attributes?: Record<string, string>;
  sitelinks?: Array<{ title: string; link: string }>;
}

export function parseLinkedInSearchResult(
  item: RawSerperItem,
  targetCompany: string
): RecruiterProfile | null {
  const rawUrl = item.link || '';

  // Validate that it is a LinkedIn personal profile URL
  const isLinkedInProfile =
    /linkedin\.com\/in\/[\w\-]+/i.test(rawUrl) ||
    /^[a-z]{2}\.linkedin\.com\/in\/[\w\-]+/i.test(rawUrl);

  if (!isLinkedInProfile && !rawUrl.includes('linkedin.com/in/')) {
    return null;
  }

  // Clean URL to canonical format
  let cleanUrl = rawUrl.split('?')[0].split('#')[0];
  if (!cleanUrl.startsWith('http')) {
    cleanUrl = `https://${cleanUrl}`;
  }

  // Extract from title
  // Example title: "Jane Doe - Senior Technical Recruiter - Stripe | LinkedIn"
  let cleanTitle = item.title
    .replace(/\s*[-–—|]\s*LinkedIn.*$/i, '')
    .replace(/\s*\|\s*LinkedIn$/i, '')
    .trim();

  let name = '';
  let title = 'Recruiter';
  let company = targetCompany;
  let location = '';

  // Extract avatar URL from Serper's imageUrl or thumbnail
  const avatarUrl = item.imageUrl || item.thumbnail || undefined;

  // Split title parts by standard delimiters (-, –, —, |)
  const segments = cleanTitle
    .split(/\s*[-–—|]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (segments.length >= 2) {
    name = segments[0];
    title = segments[1];

    if (segments.length >= 3) {
      const seg2 = segments[2];
      if (seg2.toLowerCase().includes(targetCompany.toLowerCase())) {
        company = seg2;
      } else {
        location = seg2;
      }
    }
  } else if (segments.length === 1) {
    // "Jane Doe at Stripe"
    const atMatch = segments[0].match(/^(.*?)\s+(?:at|@)\s+(.*?)$/i);
    if (atMatch) {
      name = atMatch[1].trim();
      company = atMatch[2].trim();
    } else {
      name = segments[0];
    }
  }

  // Clean title if it contains "at Company"
  if (title.toLowerCase().includes(' at ')) {
    const atParts = title.split(/\s+at\s+/i);
    title = atParts[0].trim();
    if (!company || company.toLowerCase() === targetCompany.toLowerCase()) {
      company = atParts[1]?.trim() || targetCompany;
    }
  }

  // Fallback name extraction from URL slug if name couldn't be parsed
  if (!name || name.length > 40 || name.includes('...')) {
    const slugMatch = cleanUrl.match(/\/in\/([^/?#]+)/i);
    if (slugMatch && slugMatch[1]) {
      const slug = slugMatch[1].replace(/[-_0-9]+/g, ' ').trim();
      if (slug.length > 2) {
        name = slug
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
      }
    }
  }

  // Extract location from snippet if available
  const snippet = item.snippet || '';
  if (!location && snippet) {
    const locMatch = snippet.match(
      /(?:Location:\s*|Greater\s+|Area\s*·?\s*)([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}|[A-Z][a-zA-Z\s]+Area|[A-Z][a-zA-Z\s]+,\s*[A-Za-z]+)/
    );
    if (locMatch) {
      location = locMatch[1].trim();
    }
  }

  // Calculate verification score
  let confidenceScore = 60;
  const lowerSnippet = snippet.toLowerCase();
  const lowerTitle = title.toLowerCase();
  const lowerTargetCompany = targetCompany.toLowerCase();

  const companyMatches =
    cleanTitle.toLowerCase().includes(lowerTargetCompany) ||
    lowerSnippet.includes(lowerTargetCompany);

  if (companyMatches) {
    confidenceScore += 25;
  }

  const recruiterKeywords = [
    'recruiter',
    'talent acquisition',
    'sourcer',
    'people partner',
    'talent partner',
    'staffing',
    'recruiting',
    'head of talent',
    'talent lead',
  ];
  const hasRecruiterKeyword = recruiterKeywords.some(
    (kw) => lowerTitle.includes(kw) || lowerSnippet.includes(kw)
  );

  if (hasRecruiterKeyword) {
    confidenceScore += 15;
  }

  let verificationStatus: VerificationStatus = 'unverified';
  if (confidenceScore >= 90) {
    verificationStatus = 'verified';
  } else if (confidenceScore >= 75) {
    verificationStatus = 'pattern_matched';
  }

  // Use a simple djb2-style hash over the full URL for a collision-resistant ID.
  // Slicing base64 to 16 chars caused collisions when URLs shared a long common prefix.
  let hash = 5381;
  for (let i = 0; i < cleanUrl.length; i++) {
    hash = ((hash << 5) + hash) ^ cleanUrl.charCodeAt(i);
    hash = hash >>> 0; // keep 32-bit unsigned
  }
  const id = `rec_${hash.toString(36).padStart(7, '0')}`;

  return {
    id,
    name: name || 'Talent Professional',
    title: title || 'Recruiter',
    company: company || targetCompany,
    location: location || undefined,
    linkedinUrl: cleanUrl,
    sourceUrl: cleanUrl,
    snippet,
    avatarUrl,
    verificationStatus,
    confidenceScore: Math.min(confidenceScore, 99),
  };
}

export function deduplicateProfiles(profiles: RecruiterProfile[]): RecruiterProfile[] {
  const seenUrls = new Set<string>();
  const seenNames = new Set<string>();
  const result: RecruiterProfile[] = [];

  for (const profile of profiles) {
    const urlKey = profile.linkedinUrl.toLowerCase();
    const nameKey = `${profile.name.toLowerCase()}-${profile.company.toLowerCase()}`;

    if (seenUrls.has(urlKey) || (profile.name !== 'Talent Professional' && seenNames.has(nameKey))) {
      continue;
    }

    seenUrls.add(urlKey);
    seenNames.add(nameKey);
    result.push(profile);
  }

  return result;
}
