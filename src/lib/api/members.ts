import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseQueryResult,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";

// ============================================================================
// Types & Interfaces
// ============================================================================

// Enums
export type WealthClass = "rich" | "medium" | "poor";
export type MembershipType = "general" | "lifetime" | "institutional" | "special" | "other";
export type MembershipStatus = "active" | "inactive" | "cancelled";
export type HouseholdStatus = "active" | "inactive";
export type EducationLevel = "illiterate" | "basic" | "secondary_plus";
export type EntryFeeType = "new_household" | "split_household";
export type FeeTier = "on_time" | "overdue_3yr" | "overdue_5yr" | "overdue_5yr_plus";

// ============================================================================
// Household Model
// ============================================================================

export interface Household {
  id: number;
  household_head_name: string;
  tole: string;
  citizenship_no: string;
  wealth_class: WealthClass;
  membership_type: MembershipType;
  membership_status: MembershipStatus;
  date_joined: string;
  status: HouseholdStatus;
  population_male: number;
  population_female: number;
  livestock_cattle: number;
  livestock_buffalo: number;
  livestock_goat: number;
  education_level: EducationLevel;
  occupation: string;
  caste_ethnicity: string;
  registration_date: string;
  entry_fee_type: EntryFeeType;
  entry_fee_due: string;
  photo?: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdInput {
  household_head_name: string;
  tole?: string;
  citizenship_no: string;
  wealth_class: WealthClass;
  membership_type: MembershipType;
  membership_status: MembershipStatus;
  date_joined: string;
  status: HouseholdStatus;
  population_male: number;
  population_female: number;
  livestock_cattle: number;
  livestock_buffalo: number;
  livestock_goat: number;
  education_level?: EducationLevel;
  occupation?: string;
  caste_ethnicity?: string;
  registration_date: string;
  entry_fee_type: EntryFeeType;
  photo?: File;
}

export interface HouseholdUpdate extends Partial<HouseholdInput> {}

// ============================================================================
// Member Model
// ============================================================================

export interface Member {
  id: number;
  household: number;
  household_name: string;
  user?: number;
  user_email?: string;
  full_name: string;
  photo?: string;
  created_at: string;
  updated_at: string;
}

export interface MemberInput {
  household: number;
  user?: number;
  full_name: string;
  member_photo?: File;
}

export interface MemberUpdate extends Partial<MemberInput> {}

// ============================================================================
// Membership Renewal Model
// ============================================================================

export interface MembershipRenewal {
  id: number;
  member: number;
  member_name: string;
  fiscal_year: string;
  fee_tier: FeeTier;
  fee_charged: string;
  paid_date: string;
  created_at: string;
  updated_at: string;
}

export interface MembershipRenewalInput {
  member: number;
  fiscal_year: string;
  fee_charged: string;
  paid_date: string;
}

export interface MembershipRenewalUpdate extends Partial<MembershipRenewalInput> {}

// ============================================================================
// Member Statistics Models
// ============================================================================

export interface MemberStats {
  id: number;
  full_name: string;
  citizenship_no?: string;
  membership_type?: string;
  membership_status?: string;
  date_joined?: string;
  household_details: Household;
  user_email?: string;
  user_role?: string;
  renewals_count: number;
  total_renewal_fees_paid: string;
  last_renewal?: {
    fiscal_year: string;
    fee_tier: FeeTier;
    fee_charged: string;
    paid_date: string;
  };
  current_fee_tier: FeeTier;
  committee_roles_count: number;
  candidacies_count: number;
  fee_collections_count: number;
  total_fees_collected: string;
  harvest_requests_count: number;
  harvest_requests_approved: number;
  harvest_requests_pending: number;
  sales_count: number;
  total_sales_amount: string;
  offense_reports_filed: number;
  informant_rewards_received: string;
  patrol_logs_count: number;
  revolving_loans_count: number;
  revolving_loans_amount: string;
  livelihood_programs_count: number;
  created_at: string;
  updated_at: string;
}

export interface AggregateStats {
  total_members: number;
  active_members: number;
  inactive_members: number;
  cancelled_members: number;
  general_members: number;
  lifetime_members: number;
  institutional_members: number;
  special_members: number;
  rich_households: number;
  medium_households: number;
  poor_households: number;
  total_renewals: number;
  total_renewal_fees: string;
  total_committee_roles: number;
  total_candidacies: number;
  total_fee_collections: number;
  total_collected_amount: string;
  total_harvest_requests: number;
  approved_requests: number;
  pending_requests: number;
  total_sales: number;
  total_sales_amount: string;
  total_offense_reports: number;
  total_informant_rewards: string;
  total_patrol_logs: number;
  total_revolving_loans: number;
  total_loan_amount: string;
  total_livelihood_programs: number;
}

export interface StatsByWealthClass {
  label: string;
  count: number;
  active: number;
  inactive: number;
  cancelled: number;
}

export interface StatsByMembershipType {
  label: string;
  count: number;
  active: number;
  inactive: number;
  cancelled: number;
}

export interface StatsByMembershipStatus {
  label: string;
  count: number;
  by_type: {
    general: number;
    lifetime: number;
    institutional: number;
    special: number;
  };
}

export interface UserMemberStats {
  total_member_users: number;
  active_member_users: number;
  inactive_member_users: number;
  member_users_with_profile: number;
  member_users_without_profile: number;
  member_users_in_households: number;
  member_users_on_committees: number;
}

// ============================================================================
// Paginated Response Types
// ============================================================================

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface ListHouseholdsParams {
  wealth_class?: WealthClass;
  tole?: string;
  status?: HouseholdStatus;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface ListMembersParams {
  household?: number;
  household__wealth_class?: WealthClass;
  household__membership_type?: MembershipType;
  household__membership_status?: MembershipStatus;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface ListMembershipRenewalsParams {
  fiscal_year?: string;
  fee_tier?: FeeTier;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface StatsByWealthClassParams {
  status?: MembershipStatus;
  wealth_class?: WealthClass;
}

export interface StatsByMembershipTypeParams {
  status?: MembershipStatus;
  membership_type?: MembershipType;
}

export interface StatsByMembershipStatusParams {
  membership_status?: MembershipStatus;
}

export interface AggregateStatsParams {
  status?: MembershipStatus;
  wealth_class?: WealthClass;
  membership_type?: MembershipType;
}

// ============================================================================
// API URL Builders
// ============================================================================

function buildUrl(path: string, params?: Record<string, any>): string {
  let url = `/api/v1/members${path}`;
  if (!params) return url;

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}

// ============================================================================
// Household APIs
// ============================================================================

export async function listHouseholds(
  params?: ListHouseholdsParams,
  options?: RequestInit
): Promise<PaginatedResponse<Household>> {
  return customFetch<PaginatedResponse<Household>>(buildUrl("/households/", params), {
    ...options,
  });
}

export async function getHousehold(id: number, options?: RequestInit): Promise<Household> {
  return customFetch<Household>(buildUrl(`/households/${id}/`), { ...options });
}

export async function createHousehold(
  data: HouseholdInput,
  options?: RequestInit
): Promise<Household> {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  return customFetch<Household>(buildUrl("/households/"), {
    ...options,
    method: "POST",
    body: formData,
  });
}

export async function updateHousehold(
  id: number,
  data: HouseholdUpdate,
  options?: RequestInit
): Promise<Household> {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  return customFetch<Household>(buildUrl(`/households/${id}/`), {
    ...options,
    method: "PATCH",
    body: formData,
  });
}

export async function deleteHousehold(id: number, options?: RequestInit): Promise<void> {
  return customFetch<void>(buildUrl(`/households/${id}/`), {
    ...options,
    method: "DELETE",
  });
}

// ============================================================================
// Member APIs
// ============================================================================

export async function listMembers(
  params?: ListMembersParams,
  options?: RequestInit
): Promise<PaginatedResponse<Member>> {
  return customFetch<PaginatedResponse<Member>>(buildUrl("/members/", params), {
    ...options,
  });
}

export async function getMember(id: number, options?: RequestInit): Promise<Member> {
  return customFetch<Member>(buildUrl(`/members/${id}/`), { ...options });
}

export async function createMember(
  data: MemberInput,
  options?: RequestInit
): Promise<Member> {
  const formData = new FormData();
  formData.append("household", data.household.toString());
  if (data.user) formData.append("user", data.user.toString());
  formData.append("full_name", data.full_name);
  if (data.member_photo) formData.append("member_photo", data.member_photo);

  return customFetch<Member>(buildUrl("/members/"), {
    ...options,
    method: "POST",
    body: formData,
  });
}

export async function updateMember(
  id: number,
  data: MemberUpdate,
  options?: RequestInit
): Promise<Member> {
  return customFetch<Member>(buildUrl(`/members/${id}/`), {
    ...options,
    method: "PATCH",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
}

export async function deleteMember(id: number, options?: RequestInit): Promise<void> {
  return customFetch<void>(buildUrl(`/members/${id}/`), {
    ...options,
    method: "DELETE",
  });
}

// ============================================================================
// Membership Renewal APIs
// ============================================================================

export async function listMembershipRenewals(
  params?: ListMembershipRenewalsParams,
  options?: RequestInit
): Promise<PaginatedResponse<MembershipRenewal>> {
  return customFetch<PaginatedResponse<MembershipRenewal>>(
    buildUrl("/membership-renewals/", params),
    { ...options }
  );
}

export async function getMembershipRenewal(
  id: number,
  options?: RequestInit
): Promise<MembershipRenewal> {
  return customFetch<MembershipRenewal>(buildUrl(`/membership-renewals/${id}/`), {
    ...options,
  });
}

export async function createMembershipRenewal(
  data: MembershipRenewalInput,
  options?: RequestInit
): Promise<MembershipRenewal> {
  return customFetch<MembershipRenewal>(buildUrl("/membership-renewals/"), {
    ...options,
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
}

export async function updateMembershipRenewal(
  id: number,
  data: MembershipRenewalUpdate,
  options?: RequestInit
): Promise<MembershipRenewal> {
  return customFetch<MembershipRenewal>(buildUrl(`/membership-renewals/${id}/`), {
    ...options,
    method: "PATCH",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
}

export async function deleteMembershipRenewal(
  id: number,
  options?: RequestInit
): Promise<void> {
  return customFetch<void>(buildUrl(`/membership-renewals/${id}/`), {
    ...options,
    method: "DELETE",
  });
}

// ============================================================================
// Member Statistics APIs
// ============================================================================

export async function getMemberStats(id: number, options?: RequestInit): Promise<MemberStats> {
  return customFetch<MemberStats>(buildUrl(`/member-stats/${id}/`), { ...options });
}

export async function getAggregateStats(
  params?: AggregateStatsParams,
  options?: RequestInit
): Promise<AggregateStats> {
  return customFetch<AggregateStats>(buildUrl("/stats/aggregate/", params), {
    ...options,
  });
}

export async function getStatsByWealthClass(
  params?: StatsByWealthClassParams,
  options?: RequestInit
): Promise<Record<WealthClass, StatsByWealthClass>> {
  return customFetch<Record<WealthClass, StatsByWealthClass>>(
    buildUrl("/stats/by_wealth_class/", params),
    { ...options }
  );
}

export async function getStatsByMembershipType(
  params?: StatsByMembershipTypeParams,
  options?: RequestInit
): Promise<Record<MembershipType, StatsByMembershipType>> {
  return customFetch<Record<MembershipType, StatsByMembershipType>>(
    buildUrl("/stats/by_membership_type/", params),
    { ...options }
  );
}

export async function getStatsByMembershipStatus(
  params?: StatsByMembershipStatusParams,
  options?: RequestInit
): Promise<Record<MembershipStatus, StatsByMembershipStatus>> {
  return customFetch<Record<MembershipStatus, StatsByMembershipStatus>>(
    buildUrl("/stats/by_status/", params),
    { ...options }
  );
}

export async function getUserMemberStats(
  options?: RequestInit
): Promise<UserMemberStats> {
  return customFetch<UserMemberStats>(buildUrl("/user-stats/aggregate/"), {
    ...options,
  });
}

// ============================================================================
// React Query Hooks - Households
// ============================================================================

export function useListHouseholds<TData = Awaited<ReturnType<typeof listHouseholds>>>(
  params?: ListHouseholdsParams,
  options?: UseQueryOptions<
    Awaited<ReturnType<typeof listHouseholds>>,
    Error,
    TData
  >
) {
  return useQuery({
    queryKey: ["/api/v1/members/households/", params],
    queryFn: () => listHouseholds(params),
    ...options,
  });
}

export function useGetHousehold<TData = Awaited<ReturnType<typeof getHousehold>>>(
  id: number,
  options?: UseQueryOptions<
    Awaited<ReturnType<typeof getHousehold>>,
    Error,
    TData
  >
) {
  return useQuery({
    queryKey: [`/api/v1/members/households/${id}/`],
    queryFn: () => getHousehold(id),
    ...options,
  });
}

export function useCreateHousehold(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof createHousehold>>,
    Error,
    HouseholdInput
  >
) {
  return useMutation({
    mutationFn: createHousehold,
    ...options,
  });
}

export function useUpdateHousehold(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof updateHousehold>>,
    Error,
    { id: number; data: HouseholdUpdate }
  >
) {
  return useMutation({
    mutationFn: ({ id, data }) => updateHousehold(id, data),
    ...options,
  });
}

export function useDeleteHousehold(
  options?: UseMutationOptions<void, Error, number>
) {
  return useMutation({
    mutationFn: deleteHousehold,
    ...options,
  });
}

// ============================================================================
// React Query Hooks - Members
// ============================================================================

export function useListMembers<TData = Awaited<ReturnType<typeof listMembers>>>(
  params?: ListMembersParams,
  options?: UseQueryOptions<
    Awaited<ReturnType<typeof listMembers>>,
    Error,
    TData
  >
) {
  return useQuery({
    queryKey: ["/api/v1/members/members/", params],
    queryFn: () => listMembers(params),
    ...options,
  });
}

export function useGetMember<TData = Awaited<ReturnType<typeof getMember>>>(
  id: number,
  options?: UseQueryOptions<
    Awaited<ReturnType<typeof getMember>>,
    Error,
    TData
  >
) {
  return useQuery({
    queryKey: [`/api/v1/members/members/${id}/`],
    queryFn: () => getMember(id),
    ...options,
  });
}

export function useCreateMember(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof createMember>>,
    Error,
    MemberInput
  >
) {
  return useMutation({
    mutationFn: createMember,
    ...options,
  });
}

export function useUpdateMember(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof updateMember>>,
    Error,
    { id: number; data: MemberUpdate }
  >
) {
  return useMutation({
    mutationFn: ({ id, data }) => updateMember(id, data),
    ...options,
  });
}

export function useDeleteMember(
  options?: UseMutationOptions<void, Error, number>
) {
  return useMutation({
    mutationFn: deleteMember,
    ...options,
  });
}

// ============================================================================
// React Query Hooks - Membership Renewals
// ============================================================================

export function useListMembershipRenewals<
  TData = Awaited<ReturnType<typeof listMembershipRenewals>>
>(
  params?: ListMembershipRenewalsParams,
  options?: UseQueryOptions<
    Awaited<ReturnType<typeof listMembershipRenewals>>,
    Error,
    TData
  >
) {
  return useQuery({
    queryKey: ["/api/v1/members/membership-renewals/", params],
    queryFn: () => listMembershipRenewals(params),
    ...options,
  });
}

export function useGetMembershipRenewal<
  TData = Awaited<ReturnType<typeof getMembershipRenewal>>
>(
  id: number,
  options?: UseQueryOptions<
    Awaited<ReturnType<typeof getMembershipRenewal>>,
    Error,
    TData
  >
) {
  return useQuery({
    queryKey: [`/api/v1/members/membership-renewals/${id}/`],
    queryFn: () => getMembershipRenewal(id),
    ...options,
  });
}

export function useCreateMembershipRenewal(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof createMembershipRenewal>>,
    Error,
    MembershipRenewalInput
  >
) {
  return useMutation({
    mutationFn: createMembershipRenewal,
    ...options,
  });
}

export function useUpdateMembershipRenewal(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof updateMembershipRenewal>>,
    Error,
    { id: number; data: MembershipRenewalUpdate }
  >
) {
  return useMutation({
    mutationFn: ({ id, data }) => updateMembershipRenewal(id, data),
    ...options,
  });
}

export function useDeleteMembershipRenewal(
  options?: UseMutationOptions<void, Error, number>
) {
  return useMutation({
    mutationFn: deleteMembershipRenewal,
    ...options,
  });
}

// ============================================================================
// React Query Hooks - Statistics
// ============================================================================

export function useGetMemberStats<TData = Awaited<ReturnType<typeof getMemberStats>>>(
  id: number,
  options?: UseQueryOptions<
    Awaited<ReturnType<typeof getMemberStats>>,
    Error,
    TData
  >
) {
  return useQuery({
    queryKey: [`/api/v1/members/members-stats/${id}/`],
    queryFn: () => getMemberStats(id),
    ...options,
  });
}

export function useGetAggregateStats<
  TData = Awaited<ReturnType<typeof getAggregateStats>>
>(
  params?: AggregateStatsParams,
  options?: UseQueryOptions<
    Awaited<ReturnType<typeof getAggregateStats>>,
    Error,
    TData
  >
) {
  return useQuery({
    queryKey: ["/api/v1/members/stats/aggregate/", params],
    queryFn: () => getAggregateStats(params),
    ...options,
  });
}

export function useGetStatsByWealthClass<
  TData = Awaited<ReturnType<typeof getStatsByWealthClass>>
>(
  params?: StatsByWealthClassParams,
  options?: UseQueryOptions<
    Awaited<ReturnType<typeof getStatsByWealthClass>>,
    Error,
    TData
  >
) {
  return useQuery({
    queryKey: ["/api/v1/members/stats/by_wealth_class/", params],
    queryFn: () => getStatsByWealthClass(params),
    ...options,
  });
}

export function useGetStatsByMembershipType<
  TData = Awaited<ReturnType<typeof getStatsByMembershipType>>
>(
  params?: StatsByMembershipTypeParams,
  options?: UseQueryOptions<
    Awaited<ReturnType<typeof getStatsByMembershipType>>,
    Error,
    TData
  >
) {
  return useQuery({
    queryKey: ["/api/v1/members/stats/by_membership_type/", params],
    queryFn: () => getStatsByMembershipType(params),
    ...options,
  });
}

export function useGetStatsByMembershipStatus<
  TData = Awaited<ReturnType<typeof getStatsByMembershipStatus>>
>(
  params?: StatsByMembershipStatusParams,
  options?: UseQueryOptions<
    Awaited<ReturnType<typeof getStatsByMembershipStatus>>,
    Error,
    TData
  >
) {
  return useQuery({
    queryKey: ["/api/v1/members/stats/by_status/", params],
    queryFn: () => getStatsByMembershipStatus(params),
    ...options,
  });
}

export function useGetUserMemberStats<TData = Awaited<ReturnType<typeof getUserMemberStats>>>(
  options?: UseQueryOptions<
    Awaited<ReturnType<typeof getUserMemberStats>>,
    Error,
    TData
  >
) {
  return useQuery({
    queryKey: ["/api/v1/members/user-stats/aggregate/"],
    queryFn: () => getUserMemberStats(),
    ...options,
  });
}
