import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@/lib/api/custom-fetch";

export interface Notification {
  id: number;
  recipient: number;
  recipient_name?: string;
  notification_type: string;
  title: string;
  description: string;
  status: "unread" | "read" | "actioned";
  content_type: string;
  object_id: number;
  action_required: boolean;
  action_deadline?: string;
  read_at?: string;
  actioned_at?: string;
  actioned_by?: number;
  actioned_by_name?: string;
  action_notes: string;
  created_at: string;
  updated_at: string;
}

interface NotificationListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Notification[];
}

interface UnreadCountResponse {
  unread_count: number;
}

/**
 * Fetch all notifications for the current user
 */
export function useListNotifications(filters?: Record<string, any>) {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value));
    });
  }

  return useQuery<NotificationListResponse>({
    queryKey: ["notifications", filters],
    queryFn: async () => {
      const url = `/api/v1/fund/notifications/${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
      return customFetch<NotificationListResponse>(url, { method: "GET" });
    },
  });
}

/**
 * Fetch unread notifications only
 */
export function useUnreadNotifications() {
  return useListNotifications({ status: "unread" });
}

/**
 * Fetch pending approval notifications
 */
export function usePendingApprovals() {
  return useQuery<Notification[]>({
    queryKey: ["notifications", "pending-approvals"],
    queryFn: async () => {
      return customFetch<Notification[]>("/api/v1/fund/notifications/pending_approvals/", { method: "GET" });
    },
  });
}

/**
 * Get unread notification count
 */
export function useUnreadCount() {
  return useQuery<UnreadCountResponse>({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      return customFetch<UnreadCountResponse>("/api/v1/fund/notifications/unread_count/", { method: "GET" });
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Mark a single notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number) => {
      return customFetch<Notification>(`/api/v1/fund/notifications/${notificationId}/mark_as_read/`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return customFetch<{ detail: string }>("/api/v1/fund/notifications/mark_all_as_read/", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
