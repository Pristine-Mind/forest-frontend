import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@/lib/api/custom-fetch";

export interface CashTransaction {
  id: number;
  type: "income" | "expense";
  payment_type: string;
  source_or_purpose: string;
  amount: string;
  requires_committee_approval: boolean;
  approval_status: "draft" | "submitted" | "approved" | "rejected";
  submitted_for_approval_at?: string;
  submitted_by?: number;
  submitted_by_name?: string;
  approved_by?: number;
  approved_by_name?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

interface CashTransactionListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: CashTransaction[];
}

/**
 * Fetch cash transactions with optional filters
 */
export function useListCashTransactions(filters?: Record<string, any>) {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value));
    });
  }

  return useQuery<CashTransactionListResponse>({
    queryKey: ["cash-transactions", filters],
    queryFn: async () => {
      const url = `/api/v1/fund/cash-transactions/${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
      return customFetch<CashTransactionListResponse>(url, { method: "GET" });
    },
  });
}

/**
 * Fetch pending cash transactions (submitted status)
 */
export function usePendingCashTransactions() {
  return useListCashTransactions({ approval_status: "submitted" });
}

/**
 * Create a cash transaction (draft)
 */
export function useCreateCashTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      type: string;
      payment_type: string;
      source_or_purpose: string;
      amount: string;
    }) => {
      return customFetch<CashTransaction>("/api/v1/fund/cash-transactions/", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-transactions"] });
    },
  });
}

/**
 * Update cash transaction
 */
export function useUpdateCashTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: number; updateData: Partial<CashTransaction> }) => {
      return customFetch<CashTransaction>(`/api/v1/fund/cash-transactions/${data.id}/`, {
        method: "PATCH",
        body: JSON.stringify(data.updateData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-transactions"] });
    },
  });
}

/**
 * Submit cash transaction for approval
 */
export function useSubmitCashTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return customFetch<CashTransaction>(`/api/v1/fund/cash-transactions/${id}/submit_for_approval/`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/**
 * Approve cash transaction (Chair only)
 */
export function useApproveCashTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return customFetch<CashTransaction>(`/api/v1/fund/cash-transactions/${id}/approve/`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/**
 * Reject cash transaction (Chair only)
 */
export function useRejectCashTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: number; rejection_reason: string }) => {
      return customFetch<CashTransaction>(`/api/v1/fund/cash-transactions/${data.id}/reject/`, {
        method: "POST",
        body: JSON.stringify({ rejection_reason: data.rejection_reason }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/**
 * Delete cash transaction
 */
export function useDeleteCashTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return customFetch<void>(`/api/v1/fund/cash-transactions/${id}/`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-transactions"] });
    },
  });
}
