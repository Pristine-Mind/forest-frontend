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

function getTier(position: string): 1 | 2 | 3 {
  if (position === "chair") return 1;
  if (["vice_chair", "secretary", "joint_secretary", "treasurer"].includes(position)) return 2;
  return 3;
}

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

function MemberCard({
  member,
  size,
}: {
  member: CommitteeMemberWithPhoto;
  size: "lg" | "md" | "sm";
}) {
  const avatarSize = size === "lg" ? "h-20 w-20" : size === "md" ? "h-14 w-14" : "h-11 w-11";
  const ringClass =
    size === "lg" ? "ring-2 ring-primary/40" : size === "md" ? "ring-1 ring-primary/20" : "";
  const nameClass =
    size === "lg" ? "text-base font-semibold" : size === "md" ? "text-sm font-medium" : "text-sm font-medium";
  const positionClass = size === "lg" ? "text-sm" : "text-xs";
  const width = size === "lg" ? "w-40" : size === "md" ? "w-32" : "w-28";

  return (
    <div className={`flex flex-col items-center text-center gap-2 ${width}`}>
      <Avatar className={`${avatarSize} border ${ringClass}`}>
        {member.member_photo && (
          <AvatarImage src={member.member_photo} alt={member.member_name ?? ""} />
        )}
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {getInitials(member.member_name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 w-full">
        <p className={`${nameClass} leading-snug break-words`}>
          {member.member_name ?? "—"}
        </p>
        <p className={`${positionClass} text-muted-foreground capitalize`}>
          {formatPosition(member.position)}
        </p>
      </div>
    </div>
  );
}

export function CommitteeWidget() {
  const t = useTranslations("dashboard.committeeMembers");
  const { data, isLoading } = useListCommitteeMembers({ status: "active" as any });

  const members = (data?.results ?? [])
    .filter((m) => m.status === "active")
    .sort((a, b) => {
      const priorityDiff =
        (POSITION_PRIORITY[a.position] ?? 99) - (POSITION_PRIORITY[b.position] ?? 99);
      if (priorityDiff !== 0) return priorityDiff;
      return (a.member_name ?? "").localeCompare(b.member_name ?? "");
    }) as CommitteeMemberWithPhoto[];

  const chair = members.filter((m) => getTier(m.position) === 1);
  const officers = members.filter((m) => getTier(m.position) === 2);
  const generalMembers = members.filter((m) => getTier(m.position) === 3);

  return (
    <Card className="w-full">
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
          <div className="space-y-6">
            {/* Tier 1: Chair */}
            {chair.length > 0 && (
              <div className="flex justify-center pb-5 border-b">
                {chair.map((member) => (
                  <MemberCard key={member.id} member={member} size="lg" />
                ))}
              </div>
            )}

            {/* Tier 2: Officers */}
            {officers.length > 0 && (
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-5 pb-5 border-b">
                {officers.map((member) => (
                  <MemberCard key={member.id} member={member} size="md" />
                ))}
              </div>
            )}

            {/* Tier 3: General members */}
            {generalMembers.length > 0 && (
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-4">
                {generalMembers.map((member) => (
                  <MemberCard key={member.id} member={member} size="sm" />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}