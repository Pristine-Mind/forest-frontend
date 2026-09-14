import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";
import {
  CommitteeMember,
  CommitteeMemberInput,
  CommitteeMemberUpdate,
} from "./generated/api.schemas";
import type { MemberSearchResult } from "@/types/committee";

export interface CommitteeMemberWithPhoto extends CommitteeMember {
  photo?: string | null;
}

export interface CommitteeMemberInputWithPhoto
  extends Omit<CommitteeMemberInput, "subcommittees"> {
  photo?: File;
  subcommittees?: number[];
}

export interface CommitteeMemberUpdateWithPhoto
  extends CommitteeMemberUpdate {
  photo?: File;
}

function buildUrl(path: string): string {
  return `/api/v1/governance${path}`;
}

function appendFormData(
  formData: FormData,
  key: string,
  value: unknown
): void {
  if (value === undefined || value === null) return;
  if (value instanceof File) {
    formData.append(key, value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => formData.append(key, String(item)));
    return;
  }
  formData.append(key, String(value));
}

export async function createCommitteeMemberWithPhoto(
  data: CommitteeMemberInputWithPhoto,
  options?: RequestInit
): Promise<CommitteeMemberWithPhoto> {
  const formData = new FormData();
  appendFormData(formData, "member", data.member);
  appendFormData(formData, "position", data.position);
  appendFormData(formData, "gender", data.gender);
  appendFormData(formData, "caste_ethnicity", data.caste_ethnicity);
  appendFormData(formData, "term_start", data.term_start);
  appendFormData(formData, "term_end", data.term_end);
  appendFormData(formData, "status", data.status);
  appendFormData(formData, "photo", data.photo);
  if (data.subcommittees) {
    data.subcommittees.forEach((id) => formData.append("subcommittees", String(id)));
  }

  return customFetch<CommitteeMemberWithPhoto>(buildUrl("/committee-members/"), {
    ...options,
    method: "POST",
    body: formData,
  });
}

export async function updateCommitteeMemberWithPhoto(
  id: number,
  data: CommitteeMemberUpdateWithPhoto,
  options?: RequestInit
): Promise<CommitteeMemberWithPhoto> {
  const formData = new FormData();
  if (data.position !== undefined) {
    appendFormData(formData, "position", data.position);
  }
  if (data.status !== undefined) {
    appendFormData(formData, "status", data.status);
  }
  appendFormData(formData, "photo", data.photo);

  return customFetch<CommitteeMemberWithPhoto>(
    buildUrl(`/committee-members/${id}/`),
    {
      ...options,
      method: "PATCH",
      body: formData,
    }
  );
}

export function useCreateCommitteeMemberWithPhoto(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof createCommitteeMemberWithPhoto>>,
    Error,
    CommitteeMemberInputWithPhoto
  >
): UseMutationResult<
  Awaited<ReturnType<typeof createCommitteeMemberWithPhoto>>,
  Error,
  CommitteeMemberInputWithPhoto
> {
  return useMutation({
    mutationFn: createCommitteeMemberWithPhoto,
    ...options,
  });
}

export function useUpdateCommitteeMemberWithPhoto(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof updateCommitteeMemberWithPhoto>>,
    Error,
    { id: number; data: CommitteeMemberUpdateWithPhoto }
  >
): UseMutationResult<
  Awaited<ReturnType<typeof updateCommitteeMemberWithPhoto>>,
  Error,
  { id: number; data: CommitteeMemberUpdateWithPhoto }
> {
  return useMutation({
    mutationFn: ({ id, data }) => updateCommitteeMemberWithPhoto(id, data),
    ...options,
  });
}

/**
 * Hook to search for households and members
 * 
 * @param query - Search query (minimum 2 characters)
 * @param type - Filter by type: 'all', 'household', or 'member'
 * @returns Query result with data and loading states
 */
export function useSearchMembers(
  query: string,
  type: 'all' | 'household' | 'member' = 'all'
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
    enabled: query.length > 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 1,
  });
}
