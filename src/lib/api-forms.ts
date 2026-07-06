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

// Survey Forms API
export async function createSurveyForm(data: SurveyFormPayload): Promise<SurveyFormResponse> {
  return customFetch("/api/v1/survey-forms/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getSurveyForm(id: number): Promise<SurveyFormResponse> {
  return customFetch(`/api/v1/survey-forms/${id}/`, {
    method: "GET",
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

  return customFetch(`/api/v1/survey-forms/?${query.toString()}`, {
    method: "GET",
  });
}

export async function updateSurveyForm(id: number, data: Partial<SurveyFormPayload>): Promise<SurveyFormResponse> {
  return customFetch(`/api/v1/survey-forms/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteSurveyForm(id: number): Promise<void> {
  return customFetch(`/api/v1/survey-forms/${id}/`, {
    method: "DELETE",
  });
}

export async function exportSurveyFormPDF(id: number): Promise<Blob> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/survey-forms/${id}/pdf/`,
    {
      method: "GET",
      headers: {
        Authorization: `Token ${localStorage.getItem("auth_token") || ""}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to export PDF: ${response.statusText}`);
  }

  return response.blob();
}

// Cutting Registers API
export async function createCuttingRegister(data: CuttingRegisterPayload): Promise<CuttingRegisterResponse> {
  return customFetch("/api/v1/cutting-registers/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getCuttingRegister(id: number): Promise<CuttingRegisterResponse> {
  return customFetch(`/api/v1/cutting-registers/${id}/`, {
    method: "GET",
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

  return customFetch(`/api/v1/cutting-registers/?${query.toString()}`, {
    method: "GET",
  });
}

export async function updateCuttingRegister(id: number, data: Partial<CuttingRegisterPayload>): Promise<CuttingRegisterResponse> {
  return customFetch(`/api/v1/cutting-registers/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteCuttingRegister(id: number): Promise<void> {
  return customFetch(`/api/v1/cutting-registers/${id}/`, {
    method: "DELETE",
  });
}

export async function exportCuttingRegisterPDF(id: number): Promise<Blob> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/cutting-registers/${id}/pdf/`,
    {
      method: "GET",
      headers: {
        Authorization: `Token ${localStorage.getItem("auth_token") || ""}`,
      },
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

function authHeaders(): HeadersInit {
  // Adjust to match however your app stores its auth token
  // (cookie-based session, a Zustand auth-store, etc).
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
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
  const res = await fetch(`${API_BASE}/api/v1/forest/felling-registers/`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`Failed to load felling registers: ${await parseErrorBody(res)}`);
  return res.json();
}

export async function getFellingRegister(id: number): Promise<FellingRegisterResponse> {
  const res = await fetch(`${API_BASE}/api/v1/forest/felling-registers/${id}/`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`Failed to load felling register ${id}: ${await parseErrorBody(res)}`);
  return res.json();
}

export async function createFellingRegister(
  data: FellingRegisterPayload,
): Promise<FellingRegisterResponse> {
  const res = await fetch(`${API_BASE}/api/v1/forest/felling-registers/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create felling register: ${await parseErrorBody(res)}`);
  return res.json();
}

export async function updateFellingRegister(
  id: number,
  data: Partial<FellingRegisterPayload>,
): Promise<FellingRegisterResponse> {
  const res = await fetch(`${API_BASE}/api/v1/forest/felling-registers/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update felling register ${id}: ${await parseErrorBody(res)}`);
  return res.json();
}

export async function deleteFellingRegister(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/forest/felling-registers/${id}/`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`Failed to delete felling register ${id}: ${await parseErrorBody(res)}`);
}

export async function exportFellingRegisterPDF(id: number): Promise<Blob> {
  const res = await fetch(
    `${API_BASE}/api/v1/forest/felling-registers/${id}/export-pdf/`,
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
    method: "GET",
  });
}

export async function listForestProductReceipts(): Promise<{
  results: ForestProductReceiptResponse[];
  count: number;
}> {
  return customFetch("/api/v1/forms/forest-product-receipts/", {
    method: "GET",
  });
}

export async function createForestProductReceipt(
  data: ForestProductReceiptPayload,
): Promise<ForestProductReceiptResponse> {
  return customFetch("/api/v1/forms/forest-product-receipts/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateForestProductReceipt(
  id: number,
  data: Partial<ForestProductReceiptPayload>,
): Promise<ForestProductReceiptResponse> {
  return customFetch(`/api/v1/forms/forest-product-receipts/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteForestProductReceipt(id: number): Promise<void> {
  return customFetch(`/api/v1/forms/forest-product-receipts/${id}/`, {
    method: "DELETE",
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
