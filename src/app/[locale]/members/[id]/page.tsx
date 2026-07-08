"use client";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { use, useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useGetHousehold, useListMembers, useDeleteHousehold, useDeleteMember } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2, Edit } from "lucide-react";

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
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: household, isLoading } = useGetHousehold(id);
  const { data: members, isLoading: membersLoading } = useListMembers({ household: id });
  const deleteHousehold = useDeleteHousehold();
  const deleteMember = useDeleteMember();
  const [deleteHouseholdOpen, setDeleteHouseholdOpen] = useState(false);
  const [deleteMemberOpen, setDeleteMemberOpen] = useState<number | null>(null);
  
  const handleDeleteHousehold = () => {
    deleteHousehold.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: t("householdDeleted") || "Household deleted" });
          router.push("/members");
        },
        onError: () => toast({ title: t("deleteFailed"), variant: "destructive" }),
      }
    );
  };
  
  const handleDeleteMember = (memberId: number) => {
    deleteMember.mutate(
      { id: memberId },
      {
        onSuccess: () => {
          toast({ title: t("memberDeleted") || "Member deleted" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/members/members/"] });
          queryClient.invalidateQueries({ queryKey: [`/api/v1/members/households/${id}/`] });
        },
        onError: () => toast({ title: t("deleteFailed"), variant: "destructive" }),
      }
    );
  };

  if (isLoading) return <div>{tCommon("loading")}</div>;
  if (!household) return <div>{t("notFound")}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("detailTitle", { name: household.household_head_name })}</h1>
          <p className="text-muted-foreground mt-2">{t("detailRegistered", { date: formatDate(household.registration_date) })}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/members/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setDeleteHouseholdOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button variant="outline" asChild>
            <Link href="/members">{t("backToHouseholds")}</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader><CardTitle>{t("householdInfo")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p>{household.photo ? <img src={household.photo} alt={household.household_head_name} className="w-12 h-12 rounded-full object-cover" /> : <span className="text-muted-foreground">No Photo</span> }</p>
            </div>
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
                    <TableHead>Photo</TableHead>
                    <TableHead>Relation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members?.results.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.full_name}</TableCell>
                      <TableCell>
                        {(m as any).member_photo ? (
                          <img src={(m as any).member_photo} alt={m.full_name} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <span className="text-muted-foreground">No Photo</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{(m as any).relation || "N/A"}</TableCell>

                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/members/people/${m.id}`}>{t("view")}</Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/members/people/${m.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setDeleteMemberOpen(m.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

      <AlertDialog open={deleteHouseholdOpen} onOpenChange={setDeleteHouseholdOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Household</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this household? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHousehold}
              disabled={deleteHousehold.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteHousehold.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteMemberOpen !== null} onOpenChange={(open) => !open && setDeleteMemberOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this member? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteMemberOpen) handleDeleteMember(deleteMemberOpen);
              }}
              disabled={deleteMember.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMember.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AuthGuard><AppLayout><MemberDetail id={Number(id)} /></AppLayout></AuthGuard>;
}
