"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useUnreadCount } from "@/hooks/use-notifications";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "@/i18n/routing";

function NotificationBellContent() {
  const { data: unreadData } = useUnreadCount();
  const router = useRouter();
  const unreadCount = unreadData?.unread_count ?? 0;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      title="Notifications"
      onClick={() => router.push("/notifications")}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge
          className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
          variant="destructive"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </Badge>
      )}
    </Button>
  );
}

export function NotificationBell() {
  const { can } = useAuthStore();

  // Only show notification bell for committee chair
  if (!can(["committee_chair"])) {
    return null;
  }

  return <NotificationBellContent />;
}
