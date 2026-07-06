"use client";

import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetMemberStats } from "@/lib/api-member-stats";
import { use } from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatCard, DetailRow } from "@/components/members/StatCard";
import {
  MemberActivityChart,
  HouseholdCompositionChart,
  HarvestStatusChart,
  FinancialPerformanceChart,
} from "@/components/members/MemberCharts";
import { ArrowLeft, AlertCircle } from "lucide-react";

function formatDate(value?: string | null) {
  if (!value) return "N/A";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

function formatCurrency(value?: string | null) {
  if (!value) return "NPR 0.00";
  const num = parseFloat(value);
  return `NPR ${num.toFixed(2)}`;
}

function getMembershipStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function MemberDetailView({ id }: { id: number }) {
  const t = useTranslations("members");
  const tCommon = useTranslations("common");
  const { data: stats, isLoading, error } = useGetMemberStats(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {t("errorLoading", { defaultValue: "Error loading member details" })}
        </AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert>
        <AlertDescription>
          {t("notFound", { defaultValue: "Member not found" })}
        </AlertDescription>
      </Alert>
    );
  }

  const membershipTypeLabel =
    stats.membership_type.charAt(0).toUpperCase() +
    stats.membership_type.slice(1);
  const membershipStatusLabel =
    stats.membership_status.charAt(0).toUpperCase() +
    stats.membership_status.slice(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight">
              {stats.full_name}
            </h1>
            <Badge className={getMembershipStatusColor(stats.membership_status)}>
              {membershipStatusLabel}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Member ID: {stats.id} • Citizenship: {stats.citizenship_no}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("joinedOn", {
              date: formatDate(stats.date_joined),
              defaultValue: `Joined on ${formatDate(stats.date_joined)}`,
            })}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/members/people">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToList", { defaultValue: "Back to Members" })}
          </Link>
        </Button>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Renewals"
          value={stats.renewals_count}
          subtitle={formatCurrency(stats.total_renewal_fees_paid)}
          variant="info"
        />
        <StatCard
          title="Fee Collections"
          value={stats.fee_collections_count}
          subtitle={formatCurrency(stats.total_fees_collected)}
          variant="success"
        />
        <StatCard
          title="Harvest Requests"
          value={stats.harvest_requests_count}
          subtitle={`${stats.harvest_requests_approved} Approved`}
          variant="warning"
        />
        <StatCard
          title="Sales"
          value={stats.sales_count}
          subtitle={formatCurrency(stats.total_sales_amount)}
          variant="info"
        />
        <StatCard
          title="Committee Roles"
          value={stats.committee_roles_count}
          subtitle={`${stats.candidacies_count} Candidacies`}
        />
      </div>

      {/* Member Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {t("memberInfo", { defaultValue: "Member Information" })}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-4">Personal Details</h3>
            <DetailRow label="Full Name" value={stats.full_name} />
            <DetailRow label="Citizenship No" value={stats.citizenship_no} />
            <DetailRow label="Membership Type" value={membershipTypeLabel} />
            <DetailRow label="Fee Tier" value={stats.current_fee_tier} />
            {stats.user_email && (
              <DetailRow label="Email" value={stats.user_email} />
            )}
            <DetailRow
              label="Member Since"
              value={formatDate(stats.date_joined)}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-4">Last Renewal</h3>
            {stats.last_renewal ? (
              <>
                <DetailRow
                  label="Fiscal Year"
                  value={stats.last_renewal.fiscal_year}
                />
                <DetailRow label="Fee Tier" value={stats.last_renewal.fee_tier} />
                <DetailRow
                  label="Fee Charged"
                  value={formatCurrency(stats.last_renewal.fee_charged)}
                  highlight
                />
                <DetailRow
                  label="Paid Date"
                  value={formatDate(stats.last_renewal.paid_date)}
                />
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                No renewal records found
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Household Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {t("householdInfo", { defaultValue: "Household Information" })}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-4">Basic Info</h3>
            <DetailRow
              label="Head Name"
              value={stats.household_details.household_head_name}
            />
            <DetailRow label="Tole" value={stats.household_details.tole} />
            <DetailRow
              label="Wealth Class"
              value={stats.household_details.wealth_class}
            />
            <DetailRow
              label="Occupation"
              value={stats.household_details.occupation}
            />
            <DetailRow
              label="Caste/Ethnicity"
              value={stats.household_details.caste_ethnicity}
            />
            <DetailRow
              label="Education Level"
              value={stats.household_details.education_level}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-4">Population</h3>
            <DetailRow
              label="Male"
              value={stats.household_details.population_male}
            />
            <DetailRow
              label="Female"
              value={stats.household_details.population_female}
            />
            <DetailRow
              label="Total"
              value={
                stats.household_details.population_male +
                stats.household_details.population_female
              }
              highlight
            />
            <h3 className="font-semibold mb-4 mt-6">Livestock</h3>
            <DetailRow
              label="Cattle"
              value={stats.household_details.livestock_cattle}
            />
            <DetailRow
              label="Buffalo"
              value={stats.household_details.livestock_buffalo}
            />
            <DetailRow
              label="Goat"
              value={stats.household_details.livestock_goat}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-4">Entry Fee</h3>
            <DetailRow label="Fee Type" value={stats.household_details.entry_fee_type} />
            <DetailRow
              label="Fee Due"
              value={formatCurrency(stats.household_details.entry_fee_due)}
              highlight
            />
            <DetailRow
              label="Status"
              value={
                <Badge
                  variant={
                    stats.household_details.status === "active"
                      ? "default"
                      : "secondary"
                  }
                >
                  {stats.household_details.status}
                </Badge>
              }
            />
            <DetailRow
              label="Registration Date"
              value={formatDate(
                stats.household_details.registration_date
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MemberActivityChart stats={stats} />
        <FinancialPerformanceChart stats={stats} />
      </div>

      <HouseholdCompositionChart stats={stats} />

      {stats.harvest_requests_count > 0 && (
        <HarvestStatusChart stats={stats} />
      )}

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Offense Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.offense_reports_filed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("filed", { defaultValue: "Filed" })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Informant Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.informant_rewards_received)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("received", { defaultValue: "Received" })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Patrol Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.patrol_logs_count}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("entries", { defaultValue: "Entries" })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Livelihood Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.livelihood_programs_count}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("programs", { defaultValue: "Programs" })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Loans Information */}
      {stats.revolving_loans_count > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Revolving Loan Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailRow
              label="Number of Loans"
              value={stats.revolving_loans_count}
              highlight
            />
            <DetailRow
              label="Total Loan Amount"
              value={formatCurrency(stats.revolving_loans_amount)}
              highlight
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const memberId = parseInt(id, 10);

  return (
    <AuthGuard>
      <AppLayout>
        <MemberDetailView id={memberId} />
      </AppLayout>
    </AuthGuard>
  );
}
