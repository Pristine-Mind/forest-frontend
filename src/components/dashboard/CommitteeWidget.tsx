"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useListCommitteeMembers } from "@/lib/api";
import { CommitteeMemberWithPhoto } from "@/lib/api/committee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Users } from "lucide-react";

const POSITION_PRIORITY: Record<string, number> = {
  chair: 1,
  vice_chair: 2,
  secretary: 3,
  joint_secretary: 4,
  treasurer: 5,
  member: 6,
};

const DISPLAY_LIMIT = 6;

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatPosition(position: string): string {
  return position.replace(/_/g, " ");
}

export function CommitteeWidget() {
  const t = useTranslations("dashboard.committeeMembers");
  const { data, isLoading } = useListCommitteeMembers({ status: "active" as any });

  const allMembers = (data?.results ?? [])
    .filter((m) => m.status === "active")
    .sort((a, b) => {
      const priorityDiff =
        (POSITION_PRIORITY[a.position] ?? 99) - (POSITION_PRIORITY[b.position] ?? 99);
      if (priorityDiff !== 0) return priorityDiff;
      return (a.member_name ?? "").localeCompare(b.member_name ?? "");
    }) as CommitteeMemberWithPhoto[];

  const members = allMembers.slice(0, DISPLAY_LIMIT);
  const remaining = Math.max(0, allMembers.length - DISPLAY_LIMIT);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            {t("title")}
          </CardTitle>
          <Link
            href="/governance/committee-members"
            className="text-xs text-primary hover:underline"
          >
            {t("viewAll")}
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-5 w-5" />
          </div>
        ) : members.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("empty")}
          </p>
        ) : (
          <ul className="space-y-3">
            {members.map((member) => (
              <li key={member.id} className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border">
                  {member.photo && (
                    <AvatarImage src={member.photo} alt={member.member_name ?? ""} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {getInitials(member.member_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {member.member_name ?? t("unnamed")}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {formatPosition(member.position)}
                  </p>
                </div>
              </li>
            ))}
            {remaining > 0 && (
              <li className="text-center pt-1">
                <Link
                  href="/governance/committee-members"
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  {t("more", { count: remaining })}
                </Link>
              </li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
