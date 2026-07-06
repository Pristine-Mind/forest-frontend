"use client";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListMembers } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";

function PeopleList() {
  const t = useTranslations("members.people");
  const tCommon = useTranslations("common");
  const { data, isLoading } = useListMembers();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
      </div>
      <Card>
        <CardHeader><CardTitle>{t("allMembers")}</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <div>{tCommon("loading")}</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("tableName")}</TableHead>
                  <TableHead>{t("tableHousehold")}</TableHead>
                  <TableHead>{t("tableCitizenshipNo")}</TableHead>
                  <TableHead>{t("tableStatus")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.results.map(m => (
                  <TableRow key={m.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">
                      <Link href={`/members/people/${m.id}`} className="hover:underline text-blue-600">
                        {m.full_name}
                      </Link>
                    </TableCell>
                    <TableCell>{m.household_name}</TableCell>
                    <TableCell>{m.citizenship_no}</TableCell>
                    <TableCell><Badge variant={m.membership_status === "active" ? "default" : "secondary"}>{m.membership_status}</Badge></TableCell>
                  </TableRow>
                ))}
                {(!data?.results || data.results.length === 0) && (
                  <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">{t("empty")}</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><PeopleList /></AppLayout></AuthGuard>;
}
