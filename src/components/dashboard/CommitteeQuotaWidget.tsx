"use client";

import { useTranslations } from "next-intl";
import { useGetCommitteeQuotaStatus } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, CircleDashed } from "lucide-react";

export function CommitteeQuotaWidget() {
  const t = useTranslations("dashboard.committeeQuota");
  const { data: quota, isLoading } = useGetCommitteeQuotaStatus();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <CircleDashed className="h-4 w-4 text-muted-foreground" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-5 w-5" />
          </div>
        ) : !quota ? (
          <p className="text-sm text-muted-foreground text-center py-6">{t("empty")}</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t("activeMembers")}</p>
                  <p className="text-xs text-muted-foreground">{t("activeMembersDesc")}</p>
                </div>
              </div>
              <span className="text-xl font-bold">{quota.active_total ?? 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-50">
                  <UserCheck className="h-4 w-4 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t("femaleRepresentation")}</p>
                  <p className="text-xs text-muted-foreground">
                    {quota.female_count ?? 0} / {quota.female_min ?? 0} {t("min")}
                  </p>
                </div>
              </div>
              <Badge variant={quota.female_quota_met ? "default" : "destructive"}>
                {quota.female_quota_met ? t("quotaMet") : t("quotaNotMet")}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50">
                  <UserCheck className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t("minorityRepresentation")}</p>
                  <p className="text-xs text-muted-foreground">
                    {quota.minority_count ?? 0} / {quota.minority_min ?? 0} {t("min")}
                  </p>
                </div>
              </div>
              <Badge variant={quota.minority_quota_met ? "default" : "destructive"}>
                {quota.minority_quota_met ? t("quotaMet") : t("quotaNotMet")}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
