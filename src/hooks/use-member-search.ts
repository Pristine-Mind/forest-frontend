'use client';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { customFetch } from '@/lib/api/custom-fetch';
import type { MemberSearchResult } from '@/types/committee';

interface UseMemberSearchOptions {
  enabled?: boolean;
  staleTime?: number;
}

/**
 * Hook to search for households and members
 * 
 * @param query - Search query (minimum 2 characters)
 * @param type - Filter by type: 'all', 'household', or 'member'
 * @param options - React Query options
 * @returns Query result with data and loading states
 */
export function useMemberSearch(
  query: string,
  type: 'all' | 'household' | 'member' = 'all',
  options?: UseMemberSearchOptions
): UseQueryResult<MemberSearchResult[], Error> {
  return useQuery({
    queryKey: ['member-search', query, type],
    queryFn: async () => {
      if (!query.trim() || query.length < 2) {
        return [];
      }

      try {
        const params = new URLSearchParams({
          q: query,
          type,
          limit: '20',
        });
        
        const response = await customFetch<MemberSearchResult[] | { data: MemberSearchResult[] }>(
          `/api/v1/governance/committee-members/search_members/?${params.toString()}`,
          {
            method: 'GET',
            responseType: 'json',
          }
        );
        
        // Handle both array and {data: array} response formats
        if (Array.isArray(response)) {
          return response;
        }
        return response.data || [];
      } catch (error) {
        console.error('Failed to search members:', error);
        return [];
      }
    },
    enabled: (query.length > 1) && (options?.enabled !== false),
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 1,
  });
}

/**
 * Hook to fetch a single member search result
 */
export function useMemberDetail(
  memberId: number | null,
  memberType: 'household' | 'member' | null
) {
  return useQuery({
    queryKey: ['member-detail', memberId, memberType],
    queryFn: async () => {
      if (!memberId || !memberType) return null;

      try {
        const endpoint =
          memberType === 'household'
            ? `/api/v1/members/households/${memberId}/`
            : `/api/v1/members/members/${memberId}/`;

        const response = await customFetch(endpoint, {
          method: 'GET',
          responseType: 'json',
        });
        return response;
      } catch (error) {
        console.error('Failed to fetch member detail:', error);
        return null;
      }
    },
    enabled: memberId !== null && memberType !== null,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
