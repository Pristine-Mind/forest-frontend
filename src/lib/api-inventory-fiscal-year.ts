import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { customFetch } from "./api/custom-fetch";

// Types for Fiscal Year Stock APIs
export interface FiscalYearStockRecord {
  stock_id: number;
  species: number;
  species_name: string;
  grade: string;
  stock_in: string;
  stock_out: string;
  stock_left: string;
  carryover_from_previous_year: string;
  fiscal_year: string;
}

export interface FiscalYearAnalysisResponse {
  results: FiscalYearStockRecord[];
}

export interface FiscalYearSummaryResponse {
  fiscal_year: string;
  total_stock_in: string;
  total_stock_out: string;
  total_stock_left: string;
  total_carryover_from_previous_year: string;
  by_species: FiscalYearStockRecord[];
}

export interface StockInResponse {
  fiscal_year: string;
  total_stock_in: string;
  by_species: Array<{
    species: number;
    species_name: string;
    grade: string;
    stock_in: string;
  }>;
}

export interface StockLeftResponse {
  fiscal_year: string;
  total_stock_left: string;
  by_species: Array<{
    species: number;
    species_name: string;
    grade: string;
    stock_left: string;
  }>;
}

export interface CarryoverResponse {
  fiscal_year: string;
  total_carryover_from_previous_year: string;
  by_species: Array<{
    species: number;
    species_name: string;
    grade: string;
    carryover_from_previous_year: string;
  }>;
}

// Query parameters
export interface FiscalYearQueryParams {
  fiscal_year?: string;
  species?: number;
  grade?: string;
}

// API Endpoints
const BASE_URL = "/api/v1/inventory/ledgers";

// Fiscal Year Analysis
export const getFiscalYearAnalysisUrl = (params?: FiscalYearQueryParams) => {
  const searchParams = new URLSearchParams();
  if (params?.fiscal_year) searchParams.append("fiscal_year", params.fiscal_year);
  if (params?.species) searchParams.append("species", params.species.toString());
  if (params?.grade) searchParams.append("grade", params.grade);
  return `${BASE_URL}/fiscal_year_analysis/${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
};

export const fiscalYearAnalysis = async (
  params?: FiscalYearQueryParams,
  options?: RequestInit
): Promise<FiscalYearAnalysisResponse> => {
  return customFetch<FiscalYearAnalysisResponse>(
    getFiscalYearAnalysisUrl(params),
    options
  );
};

export function useFiscalYearAnalysis<
  TData = Awaited<ReturnType<typeof fiscalYearAnalysis>>,
  TError = Error
>(
  params?: FiscalYearQueryParams,
  options?: UseQueryOptions<
    Awaited<ReturnType<typeof fiscalYearAnalysis>>,
    TError,
    TData
  >
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey: ["fiscal_year_analysis", params],
    queryFn: () => fiscalYearAnalysis(params),
    ...options,
  });
}

// Fiscal Year Summary
export const getFiscalYearSummaryUrl = (params?: FiscalYearQueryParams) => {
  const searchParams = new URLSearchParams();
  if (params?.fiscal_year) searchParams.append("fiscal_year", params.fiscal_year);
  if (params?.species) searchParams.append("species", params.species.toString());
  if (params?.grade) searchParams.append("grade", params.grade);
  return `${BASE_URL}/fiscal_year_summary/${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
};

export const fiscalYearSummary = async (
  params?: FiscalYearQueryParams,
  options?: RequestInit
): Promise<FiscalYearSummaryResponse> => {
  return customFetch<FiscalYearSummaryResponse>(
    getFiscalYearSummaryUrl(params),
    options
  );
};

export function useFiscalYearSummary<
  TData = Awaited<ReturnType<typeof fiscalYearSummary>>,
  TError = Error
>(
  params?: FiscalYearQueryParams,
  options?: UseQueryOptions<
    Awaited<ReturnType<typeof fiscalYearSummary>>,
    TError,
    TData
  >
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey: ["fiscal_year_summary", params],
    queryFn: () => fiscalYearSummary(params),
    ...options,
  });
}

// Stock In
export const getStockInUrl = (params?: FiscalYearQueryParams) => {
  const searchParams = new URLSearchParams();
  if (params?.fiscal_year) searchParams.append("fiscal_year", params.fiscal_year);
  if (params?.species) searchParams.append("species", params.species.toString());
  if (params?.grade) searchParams.append("grade", params.grade);
  return `${BASE_URL}/stock_in/${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
};

export const stockIn = async (
  params?: FiscalYearQueryParams,
  options?: RequestInit
): Promise<StockInResponse> => {
  return customFetch<StockInResponse>(getStockInUrl(params), options);
};

export function useStockIn<
  TData = Awaited<ReturnType<typeof stockIn>>,
  TError = Error
>(
  params?: FiscalYearQueryParams,
  options?: UseQueryOptions<Awaited<ReturnType<typeof stockIn>>, TError, TData>
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey: ["stock_in", params],
    queryFn: () => stockIn(params),
    ...options,
  });
}

// Stock Left
export const getStockLeftUrl = (params?: FiscalYearQueryParams) => {
  const searchParams = new URLSearchParams();
  if (params?.fiscal_year) searchParams.append("fiscal_year", params.fiscal_year);
  if (params?.species) searchParams.append("species", params.species.toString());
  if (params?.grade) searchParams.append("grade", params.grade);
  return `${BASE_URL}/stock_left/${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
};

export const stockLeft = async (
  params?: FiscalYearQueryParams,
  options?: RequestInit
): Promise<StockLeftResponse> => {
  return customFetch<StockLeftResponse>(getStockLeftUrl(params), options);
};

export function useStockLeft<
  TData = Awaited<ReturnType<typeof stockLeft>>,
  TError = Error
>(
  params?: FiscalYearQueryParams,
  options?: UseQueryOptions<Awaited<ReturnType<typeof stockLeft>>, TError, TData>
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey: ["stock_left", params],
    queryFn: () => stockLeft(params),
    ...options,
  });
}

// Carryover from Previous Year
export const getCarryoverUrl = (params?: FiscalYearQueryParams) => {
  const searchParams = new URLSearchParams();
  if (params?.fiscal_year) searchParams.append("fiscal_year", params.fiscal_year);
  if (params?.species) searchParams.append("species", params.species.toString());
  if (params?.grade) searchParams.append("grade", params.grade);
  return `${BASE_URL}/carryover_from_previous_year/${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
};

export const carryoverFromPreviousYear = async (
  params?: FiscalYearQueryParams,
  options?: RequestInit
): Promise<CarryoverResponse> => {
  return customFetch<CarryoverResponse>(getCarryoverUrl(params), options);
};

export function useCarryoverFromPreviousYear<
  TData = Awaited<ReturnType<typeof carryoverFromPreviousYear>>,
  TError = Error
>(
  params?: FiscalYearQueryParams,
  options?: UseQueryOptions<
    Awaited<ReturnType<typeof carryoverFromPreviousYear>>,
    TError,
    TData
  >
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey: ["carryover_from_previous_year", params],
    queryFn: () => carryoverFromPreviousYear(params),
    ...options,
  });
}
