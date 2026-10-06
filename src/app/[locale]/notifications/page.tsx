"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/stores/auth-store";
import { useListNotifications, useMarkNotificationAsRead, useMarkAllAsRead } from "@/hooks/use-notifications";
import { useApproveCashTransaction, useRejectCashTransaction } from "@/hooks/use-cash-transactions";
import { useApproveHousehold, useGetHousehold, useRejectHousehold } from "@/lib/api/members";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Check, Clock, Eye, EyeOff, Trash2, Bell, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { adToBs } from "@/components/ui/nepali-date-input";

type NotificationStatus = "unread" | "read" | "actioned";

interface Notification {
  id: number;
  title: string;
  description: string;
  status: NotificationStatus;
  notification_type: string;
  content_type: string;
  object_id: number;
  action_required: boolean;
  created_at: string;
  updated_at: string;
  recipient: number;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onApprove,
  onReject,
  onApproveHousehold,
  onRejectHousehold,
  isChair,
  householdDecisionPending,
}: {
  notification: Notification;
  onMarkAsRead: () => void;
  onDelete: () => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number, reason: string) => void;
  onApproveHousehold?: (id: number) => void;
  onRejectHousehold?: (id: number, reason?: string) => void;
  isChair: boolean;
  householdDecisionPending: boolean;
}) {
  const isUnread = notification.status === "unread";
  const isActionable = notification.action_required;
  const isMemberRequest =
    notification.notification_type === "member_request" &&
    notification.content_type === "Household";
  const { data: household, isLoading: isHouseholdLoading, error: householdError } =
    useGetHousehold(notification.object_id, { enabled: isMemberRequest });
  const canDecideMemberRequest =
    isChair &&
    isMemberRequest &&
    notification.action_required &&
    notification.status !== "actioned" &&
    household?.approval_status === "pending";
  // More flexible cash transaction detection - check title, type, and content_type
  const isCashTransaction = 
    notification.title?.toLowerCase().includes("cash") ||
    notification.content_type?.toLowerCase().includes("cash") || 
    notification.notification_type?.toLowerCase().includes("cash") ||
    notification.notification_type?.toLowerCase().includes("approval");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleReject = () => {
    if (!isMemberRequest && !rejectReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    if (isMemberRequest) {
      onRejectHousehold?.(notification.id, rejectReason.trim() || undefined);
    } else {
      onReject?.(notification.id, rejectReason.trim());
    }
    setRejectOpen(false);
    setRejectReason("");
  };

  return (
    <div
      className={`relative p-4 rounded-lg border transition-all ${
        isUnread
          ? "bg-blue-50 border-blue-200"
          : isActionable
          ? "bg-orange-50 border-orange-200"
          : "bg-muted/50 border-muted"
      }`}
    >
      {/* Status Indicators */}
      <div className="absolute top-3 right-3 flex gap-2">
        {isUnread && <Badge variant="default" className="bg-blue-600">New</Badge>}
        {isActionable && <Badge variant="outline" className="border-orange-600 text-orange-600">Action Required</Badge>}
      </div>

      {/* Icon */}
      <div className="flex gap-3">
        <div className="mt-1">
          {isActionable ? (
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
          ) : isUnread ? (
            <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
          ) : (
            <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm ${isUnread ? "text-foreground" : "text-muted-foreground"}`}>
            {notification.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.description}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>{adToBs(notification.created_at)}</span>
            <span>•</span>
            <span className="capitalize">{notification.notification_type.replace(/_/g, " ")}</span>
          </div>
          {isMemberRequest && (
            <div className="mt-3 rounded-md bg-background/70 px-3 py-2 text-sm">
              {isHouseholdLoading ? (
                <span className="text-muted-foreground">Loading household details…</span>
              ) : householdError ? (
                <span className="text-destructive">
                  Household details unavailable: {householdError.message}
                </span>
              ) : household ? (
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <span>Household: <strong>{household.household_head_name}</strong></span>
                  <span>Tole: <strong>{household.tole}</strong></span>
                  {household.contact_number && (
                    <span>Contact: <strong>{household.contact_number}</strong></span>
                  )}
                  <span>
                    Approval status: <strong className="capitalize">{household.approval_status ?? "unknown"}</strong>
                  </span>
                  {household.rejection_reason && (
                    <span>Rejection reason: {household.rejection_reason}</span>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3 flex-wrap">
        {canDecideMemberRequest && (
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={householdDecisionPending}
              onClick={() => onApproveHousehold?.(notification.id)}
              className="text-xs text-green-600 hover:text-green-600"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
            </Button>
            <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
              <Button
                variant="outline"
                size="sm"
                disabled={householdDecisionPending}
                onClick={() => setRejectOpen(true)}
                className="text-xs text-destructive hover:text-destructive"
              >
                <XCircle className="h-3 w-3 mr-1" /> Reject
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject Household Request</AlertDialogTitle>
                  <AlertDialogDescription>
                    Optionally provide a reason for rejecting this household request.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Textarea
                  placeholder="Rejection reason (optional)..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setRejectReason("")}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={householdDecisionPending}
                    onClick={handleReject}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Reject
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}

        {/* Approve Button - Only for actionable cash transactions */}
        {!isMemberRequest && isActionable && isCashTransaction && onApprove && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onApprove(notification.id)}
            className="text-xs text-green-600 hover:text-green-600"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
          </Button>
        )}

        {/* Reject Button - Only for actionable cash transactions */}
        {!isMemberRequest && isActionable && isCashTransaction && onReject && (
          <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectOpen(true)}
              className="text-xs text-destructive hover:text-destructive"
            >
              <XCircle className="h-3 w-3 mr-1" /> Reject
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject Transaction</AlertDialogTitle>
                <AlertDialogDescription>
                  Please provide a reason for rejecting this transaction.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Textarea
                placeholder="Rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setRejectReason("")}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReject}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Reject
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Mark as read/unread */}
        {isUnread && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAsRead}
            className="text-xs"
          >
            <Eye className="h-3 w-3 mr-1" /> Mark as read
          </Button>
        )}
        {!isUnread && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAsRead}
            className="text-xs"
          >
            <EyeOff className="h-3 w-3 mr-1" /> Mark as unread
          </Button>
        )}

        {/* Delete */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-xs text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3 mr-1" /> Delete
        </Button>
      </div>
    </div>
  );
}

function NotificationsContent() {
  const { can } = useAuthStore();
  const { data: notificationsData, isLoading, error } = useListNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const approveCashTransaction = useApproveCashTransaction();
  const rejectCashTransaction = useRejectCashTransaction();
  const approveHousehold = useApproveHousehold();
  const rejectHousehold = useRejectHousehold();
  const isChair = can(["committee_chair"]);
  const householdDecisionPending = approveHousehold.isPending || rejectHousehold.isPending;
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | "all">("all");

  const notifications = notificationsData?.results ?? [];

  const filtered =
    statusFilter === "all"
      ? notifications
      : notifications.filter((n) => n.status === statusFilter);

  const unreadCount = notifications.filter((n) => n.status === "unread").length;
  const actionableCount = notifications.filter((n) => n.action_required).length;
  const readCount = notifications.filter((n) => n.status === "read").length;
  const actionedCount = notifications.filter((n) => n.status === "actioned").length;

  const handleMarkAsRead = (id: number) => {
    markAsRead.mutate(id, {
      onSuccess: () => {
        toast.success("Notification status updated");
      },
      onError: () => {
        toast.error("Failed to update notification");
      },
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate(undefined, {
      onSuccess: () => {
        toast.success("All notifications marked as read");
      },
      onError: () => {
        toast.error("Failed to update notifications");
      },
    });
  };

  const handleApprove = (notificationId: number) => {
    const notification = notifications.find((n) => n.id === notificationId);
    if (!notification) return;

    approveCashTransaction.mutate(notification.object_id, {
      onSuccess: () => {
        toast.success("Transaction approved");
        handleMarkAsRead(notificationId);
      },
      onError: (error: any) => {
        const msg = error?.response?.data?.detail || "Failed to approve transaction";
        toast.error(msg);
      },
    });
  };

  const handleReject = (notificationId: number, rejectionReason: string) => {
    const notification = notifications.find((n) => n.id === notificationId);
    if (!notification) return;

    rejectCashTransaction.mutate(
      {
        id: notification.object_id,
        rejection_reason: rejectionReason,
      },
      {
        onSuccess: () => {
          toast.success("Transaction rejected");
          handleMarkAsRead(notificationId);
        },
        onError: (error: any) => {
          const msg = error?.response?.data?.detail || "Failed to reject transaction";
          toast.error(msg);
        },
      }
    );
  };

  const handleApproveHousehold = (notificationId: number) => {
    const notification = notifications.find((n) => n.id === notificationId);
    if (
      !notification ||
      notification.notification_type !== "member_request" ||
      notification.content_type !== "Household" ||
      !notification.action_required ||
      notification.status === "actioned" ||
      !isChair
    ) {
      return;
    }

    approveHousehold.mutate(notification.object_id, {
      onSuccess: () => toast.success("Household request approved"),
      onError: (error) => toast.error(error.message || "Failed to approve household request"),
    });
  };

  const handleRejectHousehold = (notificationId: number, rejectionReason?: string) => {
    const notification = notifications.find((n) => n.id === notificationId);
    if (
      !notification ||
      notification.notification_type !== "member_request" ||
      notification.content_type !== "Household" ||
      !notification.action_required ||
      notification.status === "actioned" ||
      !isChair
    ) {
      return;
    }

    rejectHousehold.mutate(
      { id: notification.object_id, rejectionReason },
      {
        onSuccess: () => toast.success("Household request rejected"),
        onError: (error) => toast.error(error.message || "Failed to reject household request"),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-2">
          Manage all notifications and approval requests.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <strong>Error loading notifications:</strong> {(error as any)?.message || "Failed to fetch notifications"}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{unreadCount}</p>
              <p className="text-sm text-muted-foreground mt-1">Unread</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{actionableCount}</p>
              <p className="text-sm text-muted-foreground mt-1">Action Required</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-600">{readCount}</p>
              <p className="text-sm text-muted-foreground mt-1">Read</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{actionedCount}</p>
              <p className="text-sm text-muted-foreground mt-1">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>All Notifications</CardTitle>
            <CardDescription>
              {notifications.length} total notification{notifications.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
              Mark all as read
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">
                  All {notifications.length > 0 && `(${notifications.length})`}
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </TabsTrigger>
                <TabsTrigger value="read">
                  Read {readCount > 0 && `(${readCount})`}
                </TabsTrigger>
                <TabsTrigger value="actioned">
                  Completed {actionedCount > 0 && `(${actionedCount})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <NotificationsList
                  notifications={filtered}
                  isLoading={isLoading}
                  onMarkAsRead={handleMarkAsRead}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onApproveHousehold={handleApproveHousehold}
                  onRejectHousehold={handleRejectHousehold}
                  isChair={isChair}
                  householdDecisionPending={householdDecisionPending}
                />
              </TabsContent>

              <TabsContent value="unread" className="mt-6">
                <NotificationsList
                  notifications={filtered}
                  isLoading={isLoading}
                  onMarkAsRead={handleMarkAsRead}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onApproveHousehold={handleApproveHousehold}
                  onRejectHousehold={handleRejectHousehold}
                  isChair={isChair}
                  householdDecisionPending={householdDecisionPending}
                />
              </TabsContent>

              <TabsContent value="read" className="mt-6">
                <NotificationsList
                  notifications={filtered}
                  isLoading={isLoading}
                  onMarkAsRead={handleMarkAsRead}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onApproveHousehold={handleApproveHousehold}
                  onRejectHousehold={handleRejectHousehold}
                  isChair={isChair}
                  householdDecisionPending={householdDecisionPending}
                />
              </TabsContent>

              <TabsContent value="actioned" className="mt-6">
                <NotificationsList
                  notifications={filtered}
                  isLoading={isLoading}
                  onMarkAsRead={handleMarkAsRead}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onApproveHousehold={handleApproveHousehold}
                  onRejectHousehold={handleRejectHousehold}
                  isChair={isChair}
                  householdDecisionPending={householdDecisionPending}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationsList({
  notifications,
  isLoading,
  onMarkAsRead,
  onApprove,
  onReject,
  onApproveHousehold,
  onRejectHousehold,
  isChair,
  householdDecisionPending,
}: {
  notifications: Notification[];
  isLoading: boolean;
  onMarkAsRead: (id: number) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number, reason: string) => void;
  onApproveHousehold?: (id: number) => void;
  onRejectHousehold?: (id: number, reason?: string) => void;
  isChair: boolean;
  householdDecisionPending: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">No notifications in this category</p>
      </div>
    );
  }

  return (
    <ScrollArea className="pr-4">
      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={() => onMarkAsRead(notification.id)}
            onDelete={() => {
              toast.info("Delete feature coming soon");
            }}
            onApprove={onApprove}
            onReject={onReject}
            onApproveHousehold={onApproveHousehold}
            onRejectHousehold={onRejectHousehold}
            isChair={isChair}
            householdDecisionPending={householdDecisionPending}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <AppLayout>
        <NotificationsContent />
      </AppLayout>
    </AuthGuard>
  );
}
