"use client";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { use } from "react";
import { Link } from "@/i18n/routing";
import { useGetHousehold, useListMembers } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function formatDate(value?: string | null) {
  if (!value) return "N/A";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

const EDUCATION_KEYS: Record<string, string> = {
  illiterate: "educationIlliterate",
  basic: "educationBasic",
  secondary_plus: "educationSecondaryPlus",
};

function MemberDetail({ id }: { id: number }) {
  const t = useTranslations("members");
  const tCommon = useTranslations("common");
  const { data: household, isLoading } = useGetHousehold(id);
  const { data: members, isLoading: membersLoading } = useListMembers({ household: id });

  if (isLoading) return <div>{tCommon("loading")}</div>;
  if (!household) return <div>{t("notFound")}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("detailTitle", { name: household.household_head_name })}</h1>
          <p className="text-muted-foreground mt-2">{t("detailRegistered", { date: formatDate(household.registration_date) })}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/members">{t("backToHouseholds")}</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader><CardTitle>{t("householdInfo")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("tole")}</p>
              <p>{household.tole || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("wealthClassLabel")}</p>
              <Badge variant="secondary" className="capitalize">{household.wealth_class}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("statusLabel")}</p>
              <Badge className="capitalize">{household.status}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("entryFeeTypeLabel")}</p>
              <p className="capitalize">{household.entry_fee_type.replace("_", " ")}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("maleMembers")}</p>
                <p>{household.population_male}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("femaleMembers")}</p>
                <p>{household.population_female}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2 border-t">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("cattle")}</p>
                <p>{household.livestock_cattle}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("buffalo")}</p>
                <p>{household.livestock_buffalo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("goat")}</p>
                <p>{household.livestock_goat}</p>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm font-medium text-muted-foreground">{t("educationLevelLabel")}</p>
              <p>{household.education_level ? t(EDUCATION_KEYS[household.education_level] as any) ?? household.education_level : "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("occupationLabel")}</p>
              <p>{household.occupation || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("casteEthnicityLabel")}</p>
              <p>{household.caste_ethnicity || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>{t("familyMembers")}</CardTitle>
            <Button size="sm" asChild>
              <Link href={`/members/people/new?household_id=${id}`}>{t("addMember")}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {membersLoading ? (
              <p>{t("loadingMembers")}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("tableName")}</TableHead>
                    <TableHead>{t("tableCitizenshipNo")}</TableHead>
                    <TableHead>{t("tableType")}</TableHead>
                    <TableHead>{t("tableJoined")}</TableHead>
                    <TableHead>{t("tableStatus")}</TableHead>
                    <TableHead>{t("tableActions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members?.results.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.full_name}</TableCell>
                      <TableCell>{m.citizenship_no}</TableCell>
                      <TableCell>{m.membership_type ?? m.membership_type}</TableCell>
                      <TableCell>{formatDate(m.date_joined)}</TableCell>
                      <TableCell>
                        <Badge variant={m.membership_status === "active" ? "default" : "secondary"} className="capitalize">
                          {m.membership_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/members/people/${m.id}`}>{t("view")}</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!members?.results || members.results.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        {t("emptyMembers")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AuthGuard><AppLayout><MemberDetail id={Number(id)} /></AppLayout></AuthGuard>;
}
