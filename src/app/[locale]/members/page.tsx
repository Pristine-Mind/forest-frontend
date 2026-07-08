"use client";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListHouseholds } from "@/lib/api/members";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function formatValue(value?: string | null) {
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function HouseholdsList() {
  const t = useTranslations("members");
  const tCommon = useTranslations("common");
  const { data, isLoading } = useListHouseholds();
  const { can } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
        </div>
        {can(WRITE_ROLES) && (
          <Button asChild>
            <Link href="/members/new">{t("addHousehold")}</Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("registeredHouseholds")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>{tCommon("loading")}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("tableId")}</TableHead>
                    <TableHead>{t("tableHeadOfHousehold")}</TableHead>
                    <TableHead>Citizenship No.</TableHead>
                    <TableHead>{t("tableTole")}</TableHead>
                    <TableHead>{t("tableWealthClass")}</TableHead>
                    <TableHead>Membership Type</TableHead>
                    <TableHead>Membership Status</TableHead>
                    <TableHead className="text-right">{t("tableMale")}</TableHead>
                    <TableHead className="text-right">{t("tableFemale")}</TableHead>
                    <TableHead className="text-right">{t("tableCattle")}</TableHead>
                    <TableHead className="text-right">{t("tableBuffalo")}</TableHead>
                    <TableHead className="text-right">{t("tableGoat")}</TableHead>
                    <TableHead>{t("tableEducation")}</TableHead>
                    <TableHead>{t("tableOccupation")}</TableHead>
                    <TableHead>{t("tableCasteEthnicity")}</TableHead>
                    <TableHead>{t("tableRegistrationDate")}</TableHead>
                    <TableHead>Date Joined</TableHead>
                    <TableHead>{t("tableEntryFeeType")}</TableHead>
                    <TableHead className="text-right">{t("tableEntryFeeDue")}</TableHead>
                    <TableHead>{t("tableStatus")}</TableHead>
                    <TableHead>{t("tableActions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.results.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="font-medium">{h.id}</TableCell>
                      <TableCell>{h.household_head_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{h.citizenship_no ?? "—"}</TableCell>
                      <TableCell>{h.tole || "—"}</TableCell>
                      <TableCell className="capitalize">{h.wealth_class}</TableCell>
                      <TableCell className="capitalize text-sm">{formatValue(h.membership_type)}</TableCell>
                      <TableCell className="capitalize text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          h.membership_status === "active" ? "bg-green-100 text-green-800" :
                          h.membership_status === "inactive" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {formatValue(h.membership_status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{h.population_male}</TableCell>
                      <TableCell className="text-right">{h.population_female}</TableCell>
                      <TableCell className="text-right">{h.livestock_cattle}</TableCell>
                      <TableCell className="text-right">{h.livestock_buffalo}</TableCell>
                      <TableCell className="text-right">{h.livestock_goat}</TableCell>
                      <TableCell className="text-sm">{formatValue(h.education_level)}</TableCell>
                      <TableCell className="text-sm">{h.occupation || "—"}</TableCell>
                      <TableCell className="text-sm">{h.caste_ethnicity || "—"}</TableCell>
                      <TableCell className="text-sm">{formatDate(h.registration_date)}</TableCell>
                      <TableCell className="text-sm">{formatDate(h.date_joined)}</TableCell>
                      <TableCell className="text-sm capitalize">{h.entry_fee_type.replace(/_/g, " ")}</TableCell>
                      <TableCell className="text-right font-medium">रु {h.entry_fee_due}</TableCell>
                      <TableCell className="capitalize">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          h.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {formatValue(h.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/members/${h.id}`}>{t("view")}</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!data?.results || data.results.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={19} className="text-center py-6 text-muted-foreground">
                        {t("empty")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <AppLayout>
        <HouseholdsList />
      </AppLayout>
    </AuthGuard>
  );
}
