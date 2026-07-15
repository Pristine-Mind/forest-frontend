import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseQueryResult,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { customFetch } from "./api/custom-fetch";

export interface SurveyFormPayload {
  form_number: string;
  survey_date: string;
  block: number;
  district: string;
  municipality: string;
  ward_number: number;
  plot_number: number;
  forest_category: string;
  community_representative: string;
  forest_officer: string;
  notes?: string;
  tree_items_data: Array<{
    serial_number: number;
    species: number;
    girth_cm: number;
    height_m: number;
    volume_cubic_m: number;
    fuelwood_volume_cubic_m: number;
    wood_type: "timber" | "fuelwood";
    remarks?: string;
  }>;
}

export interface CuttingRegisterPayload {
  form_number: string;
  register_date: string;
  block: number;
  zone: string;
  district: string;
  municipality: string;
  ward_number: number;
  forest_classification: string;
  block_plot_name: string;
  block_plot_type: string;
  cutting_location: string;
  community_representative_name: string;
  forest_officer_name: string;
  notes?: string;
  cutting_items_data: Array<{
    serial_number: number;
    entry_time: string;
    plot_number: string;
    quota_number: string;
    species: number;
    size_measurement: string;
    volume_cubic_m: number;
    comments?: string;
    remarks?: string;
  }>;
}

export interface SurveyFormResponse {
  id: number;
  form_number: string;
  survey_date: string;
  block: number;
  block_name: string;
  district: string;
  municipality: string;
  ward_number: number;
  plot_number: number;
  forest_category: string;
  community_representative: string;
  community_representative_sign_date?: string;
  forest_officer: string;
  forest_officer_sign_date?: string;
  tree_items: Array<{
    id: number;
    serial_number: number;
    species: number;
    species_name: string;
    girth_cm: string;
    height_m: string;
    volume_cubic_m: string;
    fuelwood_volume_cubic_m: string;
    wood_type: string;
    remarks: string;
    created_at: string;
    updated_at: string;
  }>;
  total_volume: number;
  total_fuelwood: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CuttingRegisterResponse {
  id: number;
  form_number: string;
  register_date: string;
  block: number;
  block_name: string;
  zone: string;
  district: string;
  municipality: string;
  ward_number: number;
  forest_classification: string;
  block_plot_name: string;
  block_plot_type: string;
  cutting_location: string;
  community_representative_name: string;
  community_representative_position?: string;
  community_representative_sign_date?: string;
  forest_officer_name: string;
  forest_officer_position?: string;
  forest_officer_sign_date?: string;
  cutting_items: Array<{
    id: number;
    serial_number: number;
    entry_time: string;
    plot_number: string;
    quota_number: string;
    species: number;
    species_name: string;
    size_measurement: string;
    volume_cubic_m: string;
    comments: string;
    remarks: string;
    created_at: string;
    updated_at: string;
  }>;
  total_volume: number;
  item_count: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface BankTransactionPayload {
  transaction_date: string;
  transaction_type: "deposit" | "withdrawal";
  amount: number;
  description: string;
  reference_number?: string;
  bank_name: string;
  account_number: string;
  payment_type: "cash" | "cheque" | "digital_wallet";

}
  
export async function createSurveyForm(data: SurveyFormPayload): Promise<SurveyFormResponse> {
  return customFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/forms/survey-forms/`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: JSON.stringify(data),
  });
}

export async function getSurveyForm(id: number): Promise<SurveyFormResponse> {
  return customFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/forms/survey-forms/${id}/`, {
    method: "GET",
    headers: { ...authHeaders() },

  });
}

export async function listSurveyForms(params?: {
  block?: number;
  survey_date?: string;
  search?: string;
}): Promise<{ results: SurveyFormResponse[]; count: number }> {
  const query = new URLSearchParams();
  if (params?.block) query.append("block", params.block.toString());
  if (params?.survey_date) query.append("survey_date", params.survey_date);
  if (params?.search) query.append("search", params.search);

  return customFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/forms/survey-forms/?${query.toString()}`, {
    method: "GET",
    headers: { ...authHeaders() },

  });
}

export async function updateSurveyForm(id: number, data: Partial<SurveyFormPayload>): Promise<SurveyFormResponse> {
  return customFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/forms/survey-forms/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: { ...authHeaders() },

  });
}

export async function deleteSurveyForm(id: number): Promise<void> {
  return customFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/forms/survey-forms/${id}/`, {
    method: "DELETE",
    headers: { ...authHeaders() },

  });
}

export async function exportSurveyFormPDF(id: number): Promise<Blob> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/forms/survey-forms/${id}/pdf/`,
    {
      method: "GET",
      headers: { ...authHeaders() },

    }
  );

  if (!response.ok) {
    throw new Error(`Failed to export PDF: ${response.statusText}`);
  }

  return response.blob();
}

// Cutting Registers API
export async function createCuttingRegister(data: CuttingRegisterPayload): Promise<CuttingRegisterResponse> {
  return customFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/forms/cutting-registers/`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { ...authHeaders() },

  });
}

export async function getCuttingRegister(id: number): Promise<CuttingRegisterResponse> {
  return customFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/forms/cutting-registers/${id}/`, {
    method: "GET",
    headers: { ...authHeaders() },

  });
}

export async function listCuttingRegisters(params?: {
  block?: number;
  register_date?: string;
  search?: string;
}): Promise<{ results: CuttingRegisterResponse[]; count: number }> {
  const query = new URLSearchParams();
  if (params?.block) query.append("block", params.block.toString());
  if (params?.register_date) query.append("register_date", params.register_date);
  if (params?.search) query.append("search", params.search);

  return customFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/forms/cutting-registers/?${query.toString()}`, {
    method: "GET",
    headers: { ...authHeaders() },

  });
}

export async function updateCuttingRegister(id: number, data: Partial<CuttingRegisterPayload>): Promise<CuttingRegisterResponse> {
  return customFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/forms/cutting-registers/${id}/`, {
    method: "PATCH",
    headers: { ...authHeaders() },
    body: JSON.stringify(data),
  });
}

export async function deleteCuttingRegister(id: number): Promise<void> {
  return customFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/forms/cutting-registers/${id}/`, {
    method: "DELETE",
    headers: { ...authHeaders() },

  });
}

export async function exportCuttingRegisterPDF(id: number): Promise<Blob> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/forms/cutting-registers/${id}/pdf/`,
    {
      method: "GET",
      headers: { ...authHeaders() },

    }
  );

  if (!response.ok) {
    throw new Error(`Failed to export PDF: ${response.statusText}`);
  }

  return response.blob();
}

// Helper function to download PDF
export function downloadPDF(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}


export interface FellingRegisterEntryPayload {
  entry_date: string; // YYYY-MM-DD
  entry_time?: string; // HH:MM
  rawana_number?: string;
  golia_number?: string;
  species: number; // Species id
  measurement_size?: string;
  volume_cubic_feet?: string;
  firewood_chatta?: string;
  remarks?: string;
}

export interface FellingRegisterPayload {
  area?: string;
  district: string;
  sub_division?: string;
  block_name_and_type?: string;
  felling_location?: string;
  cutting_agency_name?: string;
  tree_count?: number;
  felling_sawing_deadline?: string;
  dispatch_deadline?: string;
  cfug_rep_name?: string;
  cfug_rep_position?: string;
  cfug_rep_signed_date?: string;
  forest_rep_name?: string;
  forest_rep_position?: string;
  forest_rep_signed_date?: string;
  entries: FellingRegisterEntryPayload[];
}

export interface FellingRegisterEntryResponse extends FellingRegisterEntryPayload {
  id: number;
  register: number;
  species_name: string;
  created_at: string;
  updated_at: string;
}

export interface FellingRegisterResponse
  extends Omit<FellingRegisterPayload, "entries"> {
  id: number;
  entries: FellingRegisterEntryResponse[];
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface FellingRegisterListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FellingRegisterResponse[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function getAuthToken(): string | null {
  try {
    const authData = localStorage.getItem('forest-auth');
    if (!authData) return null;
    
    const parsed = JSON.parse(authData);
    console.log('🔑 Parsed auth data:', parsed);
    
    // Extract token from the nested structure
    const token = parsed?.state?.token;
    console.log('🔑 Extracted token:', token);
    
    return token || null;
  } catch (error) {
    console.error('Error parsing auth data:', error);
    return null;
  }
}

function authHeaders(): HeadersInit {
  // Adjust to match however your app stores its auth token
  // (cookie-based session, a Zustand auth-store, etc).
  const token = getAuthToken();
  console.log("Auth token:", token); // Debugging line
  return token ? { authorization: `Token ${token}` } : {};
}

async function parseErrorBody(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return JSON.stringify(body);
  } catch {
    return `HTTP ${res.status}`;
  }
}

export async function listFellingRegisters(): Promise<FellingRegisterListResponse> {
  const res = await fetch(`${API_BASE}/api/v1/forms/felling-registers/`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`Failed to load felling registers: ${await parseErrorBody(res)}`);
  return res.json();
}

export async function getFellingRegister(id: number): Promise<FellingRegisterResponse> {
  const res = await fetch(`${API_BASE}/api/v1/forms/felling-registers/${id}/`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`Failed to load felling register ${id}: ${await parseErrorBody(res)}`);
  return res.json();
}

export async function createFellingRegister(
  data: FellingRegisterPayload,
): Promise<FellingRegisterResponse> {
  const res = await fetch(`${API_BASE}/api/v1/forms/felling-registers/`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create felling register: ${await parseErrorBody(res)}`);
  return res.json();
}

export async function updateFellingRegister(
  id: number,
  data: Partial<FellingRegisterPayload>,
): Promise<FellingRegisterResponse> {
  const res = await fetch(`${API_BASE}/api/v1/forms/felling-registers/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update felling register ${id}: ${await parseErrorBody(res)}`);
  return res.json();
}

export async function deleteFellingRegister(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/forms/felling-registers/${id}/`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`Failed to delete felling register ${id}: ${await parseErrorBody(res)}`);
}

export async function exportFellingRegisterPDF(id: number): Promise<Blob> {
  const res = await fetch(
    `${API_BASE}/api/v1/forms/felling-registers/${id}/export-pdf/`,
    { headers: { ...authHeaders() } },
  );
  if (!res.ok) throw new Error(`Failed to export PDF for register ${id}: ${await parseErrorBody(res)}`);
  return res.blob();
}

// Forest Product Receipts API
export interface ForestProductReceiptItem {
  id: number;
  product_name: string;
  grade?: string;
  unit: string;
  quantity: number;
  rate_per_unit: number;
  total_amount: number;
  remarks?: string;
}

export interface ForestProductReceiptPayload {
  cfug_registration_no?: string;
  receipt_no: string;
  buyer_name: string;
  buyer_address?: string;
  issue_date: string;
  receiver_name?: string;
  receiver_date?: string;
  issuer_name?: string;
  issuer_position?: string;
  issuer_date?: string;
  grand_total: number;
  items: Array<{
    product_name: string;
    grade?: string;
    unit: string;
    quantity: number;
    rate_per_unit: number;
    total_amount: number;
    remarks?: string;
  }>;
}

export interface ForestProductReceiptResponse extends ForestProductReceiptPayload {
  id: number;
  items: ForestProductReceiptItem[];
  created_at: string;
  updated_at: string;
}

export async function getForestProductReceipt(id: number): Promise<ForestProductReceiptResponse> {
  return customFetch(`/api/v1/forms/forest-product-receipts/${id}/`, {
    headers: { ...authHeaders() },
    method: "GET",
  });
}

export async function listForestProductReceipts(): Promise<{
  results: ForestProductReceiptResponse[];
  count: number;
}> {
  return customFetch("/api/v1/forms/forest-product-receipts/", {
    method: "GET",
    headers: { ...authHeaders() },
  });
}

export async function createForestProductReceipt(
  data: ForestProductReceiptPayload,
): Promise<ForestProductReceiptResponse> {
  return customFetch("/api/v1/forms/forest-product-receipts/", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { ...authHeaders() },
  });
}

export async function updateForestProductReceipt(
  id: number,
  data: Partial<ForestProductReceiptPayload>,
): Promise<ForestProductReceiptResponse> {
  return customFetch(`/api/v1/forms/forest-product-receipts/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: { ...authHeaders() },
  });
}

export async function deleteForestProductReceipt(id: number): Promise<void> {
  return customFetch(`/api/v1/forms/forest-product-receipts/${id}/`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
}

// Forest Product Receipts React Query Hooks
export function useGetForestProductReceipt<
  TData = ForestProductReceiptResponse,
  TError = Error
>(
  id: number,
  options?: UseQueryOptions<ForestProductReceiptResponse, TError, TData>,
): UseQueryResult<TData, TError> {
  return useQuery<ForestProductReceiptResponse, TError, TData>({
    queryKey: ["forestProductReceipt", id],
    queryFn: () => getForestProductReceipt(id),
    ...options,
  });
}

export function useListForestProductReceipts<
  TData = { results: ForestProductReceiptResponse[]; count: number },
  TError = Error
>(
  options?: UseQueryOptions<
    { results: ForestProductReceiptResponse[]; count: number },
    TError,
    TData
  >,
): UseQueryResult<TData, TError> {
  return useQuery<
    { results: ForestProductReceiptResponse[]; count: number },
    TError,
    TData
  >({
    queryKey: ["forestProductReceipts"],
    queryFn: () => listForestProductReceipts(),
    ...options,
  });
}

// Forest Product Receipts Mutations
export function useCreateForestProductReceipt<
  TError = Error,
  TContext = unknown
>(
  options?: UseMutationOptions<
    ForestProductReceiptResponse,
    TError,
    { data: ForestProductReceiptPayload },
    TContext
  >,
): UseMutationResult<
  ForestProductReceiptResponse,
  TError,
  { data: ForestProductReceiptPayload },
  TContext
> {
  return useMutation<
    ForestProductReceiptResponse,
    TError,
    { data: ForestProductReceiptPayload },
    TContext
  >({
    mutationFn: ({ data }) => createForestProductReceipt(data),
    ...options,
  });
}

export function useUpdateForestProductReceipt<
  TError = Error,
  TContext = unknown
>(
  id: number,
  options?: UseMutationOptions<
    ForestProductReceiptResponse,
    TError,
    { data: Partial<ForestProductReceiptPayload> },
    TContext
  >,
): UseMutationResult<
  ForestProductReceiptResponse,
  TError,
  { data: Partial<ForestProductReceiptPayload> },
  TContext
> {
  return useMutation<
    ForestProductReceiptResponse,
    TError,
    { data: Partial<ForestProductReceiptPayload> },
    TContext
  >({
    mutationFn: ({ data }) => updateForestProductReceipt(id, data),
    ...options,
  });
}

export function useDeleteForestProductReceipt<
  TError = Error,
  TContext = unknown
>(
  options?: UseMutationOptions<void, TError, { id: number }, TContext>,
): UseMutationResult<void, TError, { id: number }, TContext> {
  return useMutation<void, TError, { id: number }, TContext>({
    mutationFn: ({ id }) => deleteForestProductReceipt(id),
    ...options,
  });
}


export interface BankTransaction{
  id: number;
  account: number;
  transaction_type: "deposit" | "withdrawal";
  amount: number;
  transaction_date: string;
  description: string;
  created_at: string;
  updated_at: string;
  requires_committee_approval?: boolean;
}

export interface BankTransactionPayload {
    account: number;
    transaction_date: string;
    transaction_type: "deposit" | "withdrawal";
    amount: number;
    description: string;
    requires_committee_approval?: boolean;
}

export interface BankTransactionResponse {
  id: number;
  account: number;
  transaction_type: "deposit" | "withdrawal";
  amount: number;
  transaction_date: string;
  description: string;
  created_at: string;
  updated_at: string;
  requires_committee_approval?: boolean;
}

export interface BankTransactionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BankTransactionResponse[];
}

// ─── Bank Accounts Types ────────────────────────────────────────────────────

export interface BankAccount {
  id: number;
  bank_name: string;
  account_number: string;
  account_holder_name?: string;
  bank_branch?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankAccountListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BankAccount[];
}

// ─── Bank Transactions API Functions ────────────────────────────────────────

export async function listBankTransactions(params?: {
  transaction_date?: string;
  account?: number;
  transaction_type?: "deposit" | "withdrawal";
  page?: number;
  page_size?: number;
}): Promise<BankTransactionListResponse> {
  const query = new URLSearchParams();
  if (params?.transaction_date) query.append("transaction_date", params.transaction_date);
  if (params?.account) query.append("account", params.account.toString());
  if (params?.transaction_type) query.append("transaction_type", params.transaction_type);
  if (params?.page) query.append("page", params.page.toString());
  if (params?.page_size) query.append("page_size", params.page_size.toString());

  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/fund/bank-transactions/?${query.toString()}`;
  
  return customFetch(url, {
    method: "GET",
    headers: { ...authHeaders() },
  });
}

export async function createBankTransaction(
  data: BankTransactionPayload
): Promise<BankTransactionResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/fund/bank-transactions/`;
  
  return customFetch(url, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function getBankTransaction(id: number): Promise<BankTransactionResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/fund/bank-transactions/${id}/`;
  
  return customFetch(url, {
    method: "GET",
    headers: { ...authHeaders() },
  });
}

export async function updateBankTransaction(
  id: number,
  data: Partial<BankTransactionPayload>
): Promise<BankTransactionResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/fund/bank-transactions/${id}/`;
  
  return customFetch(url, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteBankTransaction(id: number): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/fund/bank-transactions/${id}/`;
  
  return customFetch(url, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
}

// ─── Bank Accounts API Functions ───────────────────────────────────────────

export async function listBankAccounts(params?: {
  is_active?: boolean;
  page?: number;
  page_size?: number;
}): Promise<BankAccountListResponse> {
  const query = new URLSearchParams();
  if (params?.is_active !== undefined) query.append("is_active", params.is_active.toString());
  if (params?.page) query.append("page", params.page.toString());
  if (params?.page_size) query.append("page_size", params.page_size.toString());

  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bank-accounts/?${query.toString()}`;
  
  return customFetch(url, {
    method: "GET",
    headers: { ...authHeaders() },
  });
}

export async function createBankAccount(
  data: Omit<BankAccount, "id" | "created_at" | "updated_at">
): Promise<BankAccount> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bank-accounts/`;
  
  return customFetch(url, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function getBankAccount(id: number): Promise<BankAccount> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bank-accounts/${id}/`;
  
  return customFetch(url, {
    method: "GET",
    headers: { ...authHeaders() },
  });
}

export async function updateBankAccount(
  id: number,
  data: Partial<Omit<BankAccount, "id" | "created_at" | "updated_at">>
): Promise<BankAccount> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bank-accounts/${id}/`;
  
  return customFetch(url, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteBankAccount(id: number): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bank-accounts/${id}/`;
  
  return customFetch(url, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
}

// ─── React Query Keys ──────────────────────────────────────────────────────

export const bankTransactionKeys = {
  all: ["bankTransactions"] as const,
  lists: () => [...bankTransactionKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...bankTransactionKeys.lists(), { ...filters }] as const,
  details: () => [...bankTransactionKeys.all, "detail"] as const,
  detail: (id: number) => [...bankTransactionKeys.details(), id] as const,
};

export const bankAccountKeys = {
  all: ["bankAccounts"] as const,
  lists: () => [...bankAccountKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...bankAccountKeys.lists(), { ...filters }] as const,
  details: () => [...bankAccountKeys.all, "detail"] as const,
  detail: (id: number) => [...bankAccountKeys.details(), id] as const,
};

// ─── React Query Hooks - Bank Transactions ─────────────────────────────────

export function useListBankTransactions<TData = BankTransactionListResponse>(
  params?: {
    transaction_date?: string;
    account?: number;
    transaction_type?: "deposit" | "withdrawal";
    page?: number;
    page_size?: number;
  },
  options?: UseQueryOptions<BankTransactionListResponse, Error, TData>
): UseQueryResult<TData, Error> {
  return useQuery<BankTransactionListResponse, Error, TData>({
    queryKey: bankTransactionKeys.list(params),
    queryFn: () => listBankTransactions(params),
    ...options,
  });
}

export function useGetBankTransaction<TData = BankTransactionResponse>(
  id: number,
  options?: UseQueryOptions<BankTransactionResponse, Error, TData>
): UseQueryResult<TData, Error> {
  return useQuery<BankTransactionResponse, Error, TData>({
    queryKey: bankTransactionKeys.detail(id),
    queryFn: () => getBankTransaction(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateBankTransaction(
  options?: UseMutationOptions<
    BankTransactionResponse,
    Error,
    { data: BankTransactionPayload }
  >
): UseMutationResult<BankTransactionResponse, Error, { data: BankTransactionPayload }> {
  return useMutation({
    mutationFn: ({ data }) => createBankTransaction(data),
    ...options,
  });
}

export function useUpdateBankTransaction(
  options?: UseMutationOptions<
    BankTransactionResponse,
    Error,
    { id: number; data: Partial<BankTransactionPayload> }
  >
): UseMutationResult<BankTransactionResponse, Error, { id: number; data: Partial<BankTransactionPayload> }> {
  return useMutation({
    mutationFn: ({ id, data }) => updateBankTransaction(id, data),
    ...options,
  });
}

export function useDeleteBankTransaction(
  options?: UseMutationOptions<void, Error, { id: number }>
): UseMutationResult<void, Error, { id: number }> {
  return useMutation({
    mutationFn: ({ id }) => deleteBankTransaction(id),
    ...options,
  });
}

// ─── React Query Hooks - Bank Accounts ─────────────────────────────────────

export function useListBankAccounts<TData = BankAccountListResponse>(
  params?: {
    is_active?: boolean;
    page?: number;
    page_size?: number;
  },
  options?: UseQueryOptions<BankAccountListResponse, Error, TData>
): UseQueryResult<TData, Error> {
  return useQuery<BankAccountListResponse, Error, TData>({
    queryKey: bankAccountKeys.list(params),
    queryFn: () => listBankAccounts(params),
    ...options,
  });
}

export function useGetBankAccount<TData = BankAccount>(
  id: number,
  options?: UseQueryOptions<BankAccount, Error, TData>
): UseQueryResult<TData, Error> {
  return useQuery<BankAccount, Error, TData>({
    queryKey: bankAccountKeys.detail(id),
    queryFn: () => getBankAccount(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateBankAccount(
  options?: UseMutationOptions<
    BankAccount,
    Error,
    { data: Omit<BankAccount, "id" | "created_at" | "updated_at"> }
  >
): UseMutationResult<BankAccount, Error, { data: Omit<BankAccount, "id" | "created_at" | "updated_at"> }> {
  return useMutation({
    mutationFn: ({ data }) => createBankAccount(data),
    ...options,
  });
}

export function useUpdateBankAccount(
  options?: UseMutationOptions<
    BankAccount,
    Error,
    { id: number; data: Partial<Omit<BankAccount, "id" | "created_at" | "updated_at">> }
  >
): UseMutationResult<BankAccount, Error, { id: number; data: Partial<Omit<BankAccount, "id" | "created_at" | "updated_at">> }> {
  return useMutation({
    mutationFn: ({ id, data }) => updateBankAccount(id, data),
    ...options,
  });
}

export function useDeleteBankAccount(
  options?: UseMutationOptions<void, Error, { id: number }>
): UseMutationResult<void, Error, { id: number }> {
  return useMutation({
    mutationFn: ({ id }) => deleteBankAccount(id),
    ...options,
  });
}

// ─── Query Key Helpers ─────────────────────────────────────────────────────

export function getListBankTransactionsQueryKey(params?: {
  transaction_date?: string;
  account?: number;
  transaction_type?: "deposit" | "withdrawal";
  page?: number;
  page_size?: number;
}): readonly unknown[] {
  return bankTransactionKeys.list(params);
}

export function getListBankAccountsQueryKey(params?: {
  is_active?: boolean;
  page?: number;
  page_size?: number;
}): readonly unknown[] {
  return bankAccountKeys.list(params);
}

export interface TimberLogEntryPayload {
  species: number;
  tree_no: string;
  tree_golia_no?: string;
  golia_no: string;
  girth_inch: number;
  length_feet: number;
  volume_cubic_feet: number;
  total_pieces: number;
  timber1_pieces: number;
  timber1_diameter_1_inch: number;
  timber1_diameter_2_inch: number;
  timber2_pieces: number;
  timber2_diameter_1_inch: number;
  timber2_diameter_2_inch: number;
  avg_diameter_length_1_feet?: number;
  avg_diameter_length_2_feet?: number;
  sawn_volume_cft?: number;
  wastage_percent: number;
  net_volume_cft?: number;
  grade: "A" | "B" | "C";
}

export interface TimberLogEntryResponse extends TimberLogEntryPayload {
  id: number;
  species_name?: string;
  created_at: string;
  updated_at: string;
}

export interface TimberLogEntryListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TimberLogEntryResponse[];
}

// ─── Species Types ──────────────────────────────────────────────────────────

export interface Species {
  id: number;
  local_name: string;
  scientific_name?: string;
  created_at: string;
  updated_at: string;
}

export interface SpeciesListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Species[];
}

// ─── API Functions ──────────────────────────────────────────────────────────

export async function listTimberLogEntries(params?: {
  species?: number;
  grade?: string;
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<TimberLogEntryListResponse> {
  const query = new URLSearchParams();
  if (params?.species) query.append("species", params.species.toString());
  if (params?.grade) query.append("grade", params.grade);
  if (params?.search) query.append("search", params.search);
  if (params?.page) query.append("page", params.page.toString());
  if (params?.page_size) query.append("page_size", params.page_size.toString());

  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/inventory/timber-log-entries/?${query.toString()}`;
  
  return customFetch(url, {
    method: "GET",
    headers: { ...authHeaders() },
  });
}

export async function createTimberLogEntry(
  data: TimberLogEntryPayload
): Promise<TimberLogEntryResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/inventory/timber-log-entries/`;
  
  return customFetch(url, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function getTimberLogEntry(id: number): Promise<TimberLogEntryResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/inventory/timber-log-entries/${id}/`;
  
  return customFetch(url, {
    method: "GET",
    headers: { ...authHeaders() },
  });
}

export async function updateTimberLogEntry(
  id: number,
  data: Partial<TimberLogEntryPayload>
): Promise<TimberLogEntryResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/inventory/timber-log-entries/${id}/`;
  
  return customFetch(url, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteTimberLogEntry(id: number): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/inventory/timber-log-entries/${id}/`;
  
  return customFetch(url, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
}

// ─── Species API Functions ──────────────────────────────────────────────────

export async function listSpecies(params?: {
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<SpeciesListResponse> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.page) query.append("page", params.page.toString());
  if (params?.page_size) query.append("page_size", params.page_size.toString());

  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/species/?${query.toString()}`;
  
  return customFetch(url, {
    method: "GET",
    headers: { ...authHeaders() },
  });
}

// ─── React Query Keys ──────────────────────────────────────────────────────

export const timberLogEntryKeys = {
  all: ["timberLogEntries"] as const,
  lists: () => [...timberLogEntryKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...timberLogEntryKeys.lists(), { ...filters }] as const,
  details: () => [...timberLogEntryKeys.all, "detail"] as const,
  detail: (id: number) => [...timberLogEntryKeys.details(), id] as const,
};

export const speciesKeys = {
  all: ["species"] as const,
  lists: () => [...speciesKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...speciesKeys.lists(), { ...filters }] as const,
  details: () => [...speciesKeys.all, "detail"] as const,
  detail: (id: number) => [...speciesKeys.details(), id] as const,
};

// ─── React Query Hooks - Timber Log Entries ────────────────────────────────

export function useListTimberLogEntries<TData = TimberLogEntryListResponse>(
  params?: {
    species?: number;
    grade?: string;
    search?: string;
    page?: number;
    page_size?: number;
  },
  options?: UseQueryOptions<TimberLogEntryListResponse, Error, TData>
): UseQueryResult<TData, Error> {
  return useQuery<TimberLogEntryListResponse, Error, TData>({
    queryKey: timberLogEntryKeys.list(params),
    queryFn: () => listTimberLogEntries(params),
    ...options,
  });
}

export function useGetTimberLogEntry<TData = TimberLogEntryResponse>(
  id: number,
  options?: UseQueryOptions<TimberLogEntryResponse, Error, TData>
): UseQueryResult<TData, Error> {
  return useQuery<TimberLogEntryResponse, Error, TData>({
    queryKey: timberLogEntryKeys.detail(id),
    queryFn: () => getTimberLogEntry(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateTimberLogEntry(
  options?: UseMutationOptions<
    TimberLogEntryResponse,
    Error,
    { data: TimberLogEntryPayload }
  >
): UseMutationResult<TimberLogEntryResponse, Error, { data: TimberLogEntryPayload }> {
  return useMutation({
    mutationFn: ({ data }) => createTimberLogEntry(data),
    ...options,
  });
}

export function useUpdateTimberLogEntry(
  options?: UseMutationOptions<
    TimberLogEntryResponse,
    Error,
    { id: number; data: Partial<TimberLogEntryPayload> }
  >
): UseMutationResult<TimberLogEntryResponse, Error, { id: number; data: Partial<TimberLogEntryPayload> }> {
  return useMutation({
    mutationFn: ({ id, data }) => updateTimberLogEntry(id, data),
    ...options,
  });
}

export function useDeleteTimberLogEntry(
  options?: UseMutationOptions<void, Error, { id: number }>
): UseMutationResult<void, Error, { id: number }> {
  return useMutation({
    mutationFn: ({ id }) => deleteTimberLogEntry(id),
    ...options,
  });
}

// ─── React Query Hooks - Species ───────────────────────────────────────────

export function useListSpecies<TData = SpeciesListResponse>(
  params?: {
    search?: string;
    page?: number;
    page_size?: number;
  },
  options?: UseQueryOptions<SpeciesListResponse, Error, TData>
): UseQueryResult<TData, Error> {
  return useQuery<SpeciesListResponse, Error, TData>({
    queryKey: speciesKeys.list(params),
    queryFn: () => listSpecies(params),
    ...options,
  });
}

// ─── Query Key Helpers ─────────────────────────────────────────────────────

export function getListTimberLogEntriesQueryKey(params?: {
  species?: number;
  grade?: string;
  search?: string;
  page?: number;
  page_size?: number;
}): readonly unknown[] {
  return timberLogEntryKeys.list(params);
}