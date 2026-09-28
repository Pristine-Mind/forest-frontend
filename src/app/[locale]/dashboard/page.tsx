"use client";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Link } from "@/i18n/routing";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Home, Axe, Banknote, ShieldAlert, BadgeDollarSign, KeyRound } from "lucide-react";
import { useListHarvestRequests, useGetAnnualDfoReport } from "@/lib/api";
import { CommitteeWidget } from "@/components/dashboard/CommitteeWidget";
import { LatestProgramWidget } from "@/components/dashboard/LatestProgramWidget";

// inside your dashboard grid
function Dashboard() {
  const t = useTranslations();
  const { data: dfoReport, isLoading } = useGetAnnualDfoReport();
  const { data: harvests } = useListHarvestRequests({ status: "pending" as any, limit: 1 });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  const metrics = [
    { title: t("dashboard.totalMembers"), value: dfoReport?.members || 0, icon: Users, description: t("dashboard.totalMembersDesc") },
    { title: t("dashboard.households"), value: dfoReport?.households || 0, icon: Home, description: t("dashboard.householdsDesc") },
    { title: t("dashboard.pendingHarvests"), value: harvests?.count || 0, icon: Axe, description: t("dashboard.pendingHarvestsDesc") },
    { title: t("dashboard.totalSales"), value: `NPR ${dfoReport?.sales || 0}`, icon: BadgeDollarSign, description: t("dashboard.totalSalesDesc") },
    { title: t("dashboard.totalIncome"), value: `NPR ${dfoReport?.cash_income || 0}`, icon: Banknote, description: t("dashboard.totalIncomeDesc") },
    { title: t("dashboard.visitorEntries"), value: dfoReport?.visitor_entries || 0, icon: ShieldAlert, description: t("dashboard.visitorEntriesDesc") },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("dashboard.subtitle")}</p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/dashboard/change-password" aria-label={t("changePassword.title")}>
            <KeyRound className="h-4 w-4 sm:me-2" />
            <span className="hidden sm:inline">{t("changePassword.title")}</span>
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {metrics.map((m, i) => (
          <Card key={i} className="hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{m.title}</CardTitle>
              <m.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{m.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-1 items-start">
        <Card className="lg:col-span-2 xl:col-span-3">
          <Card className="lg:col-span-2 xl:col-span-3">
            <CardHeader>
              <CardTitle>Latest Program</CardTitle>
            </CardHeader>
            <CardContent>
              <LatestProgramWidget />
            </CardContent>
          </Card>
          <CardHeader>
            <CardTitle>Committee Members Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <CommitteeWidget />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><Dashboard /></AppLayout></AuthGuard>;
}
