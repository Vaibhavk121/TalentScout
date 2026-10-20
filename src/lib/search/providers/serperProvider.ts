import { RecruiterProfile, SearchFilters, SearchResponse } from '@/types';
import { buildSearchQuery, deduplicateProfiles, parseLinkedInSearchResult, RawSerperItem } from '../queryBuilder';

export class SerperSearchProvider {
  public id = 'serper' as const;
  public name = 'Serper.dev';

  public isConfigured(): boolean {
    const key = process.env.SERPER_API_KEY;
    return Boolean(key && key.trim().length > 0);
  }

  public async search(filters: SearchFilters): Promise<SearchResponse> {
    const startTime = Date.now();
    const apiKey = process.env.SERPER_API_KEY?.trim();

    if (!apiKey) {
      return {
        query: filters.company,
        generatedSearchQuery: buildSearchQuery(filters),
        results: [],
        totalResults: 0,
        executionTimeMs: Date.now() - startTime,
        hasMore: false,
        error:
          'SERPER_API_KEY is not configured on the server. Please set your Serper.dev API key in your environment variables (or Vercel project settings).',
      };
    }

    const query = buildSearchQuery(filters);
    const page = filters.page || 1;

    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          num: 15,
          page: page,
        }),
        cache: 'no-store',
      });

      if (response.status === 429) {
        return {
          query: filters.company,
          generatedSearchQuery: query,
          results: [],
          totalResults: 0,
          executionTimeMs: Date.now() - startTime,
          hasMore: false,
          rateLimited: true,
          error: 'Serper.dev API rate limit exceeded or credit quota exhausted.',
        };
      }

      if (response.status === 401 || response.status === 403) {
        return {
          query: filters.company,
          generatedSearchQuery: query,
          results: [],
          totalResults: 0,
          executionTimeMs: Date.now() - startTime,
          hasMore: false,
          error: 'Invalid SERPER_API_KEY. Please verify your API key at serper.dev.',
        };
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Serper API responded with HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const organic: RawSerperItem[] = data.organic || [];

      const parsedProfiles: RecruiterProfile[] = [];
      for (const item of organic) {
        const parsed = parseLinkedInSearchResult(item, filters.company);
        if (parsed) {
          parsedProfiles.push(parsed);
        }
      }

      const deduped = deduplicateProfiles(parsedProfiles);
      // Sort verified first, then by confidence score
      deduped.sort((a, b) => {
        if (a.verificationStatus === 'verified' && b.verificationStatus !== 'verified') return -1;
        if (b.verificationStatus === 'verified' && a.verificationStatus !== 'verified') return 1;
        return b.confidenceScore - a.confidenceScore;
      });

      return {
        query: filters.company,
        generatedSearchQuery: query,
        results: deduped,
        totalResults: deduped.length,
        executionTimeMs: Date.now() - startTime,
        hasMore: organic.length >= 10,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected search error occurred.';
      return {
        query: filters.company,
        generatedSearchQuery: query,
        results: [],
        totalResults: 0,
        executionTimeMs: Date.now() - startTime,
        hasMore: false,
        error: errorMsg,
      };
    }
  }
}

export const serperProvider = new SerperSearchProvider();
