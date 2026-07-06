/**
 * Member Statistics API Hook
 */

import { customFetch } from "@/lib/api";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import type { MemberStats } from "@/types/member-stats";

export const getMemberStatsUrl = (memberId: number) => {
  return `/api/v1/members/members-stats/${memberId}/`;
};

export const getMemberStats = async (
  memberId: number,
  options?: RequestInit
): Promise<MemberStats> => {
  return customFetch<MemberStats>(getMemberStatsUrl(memberId), {
    ...options,
  });
};

export const useGetMemberStats = (
  memberId: number,
  queryOptions?: {
    query?: UseQueryOptions<MemberStats, unknown, MemberStats>;
    request?: RequestInit;
  }
) => {
  return useQuery({
    queryKey: ["memberStats", memberId],
    queryFn: () => getMemberStats(memberId, queryOptions?.request),
    enabled: !!memberId,
    ...queryOptions?.query,
  });
};
