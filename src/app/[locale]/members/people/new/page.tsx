"use client";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useCreateMember, useGetHousehold } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

function MemberNewInner({ householdId }: { householdId: number }) {
  const t = useTranslations("members.people");
  const tCommon = useTranslations("common");
  const tForms = useTranslations("forms");
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMember = useCreateMember();
  const { data: household } = useGetHousehold(householdId);

  const formSchema = z.object({
    full_name: z.string().min(1, tForms("required")),
    citizenship_no: z.string().min(1, tForms("required")),
    membership_type: z.enum(["general", "lifetime", "institutional", "special", "other"]),
    membership_status: z.enum(["active", "inactive", "cancelled"]),
    date_joined: z.string().min(1, tForms("required")),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      citizenship_no: "",
      membership_type: "general",
      membership_status: "active",
      date_joined: new Date().toISOString().split("T")[0],
    },
  });

  function onSubmit(values: FormValues) {
    createMember.mutate(
      { data: { ...values, household: householdId } },
      {
        onSuccess: () => {
          toast({ title: t("toastCreated") });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/members/members/"] });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/members/households/", householdId] });
          router.push(`/members/${householdId}`);
        },
        onError: (error: any) => {
          const detail = error?.response?.data?.citizenship_no?.[0];
          toast({
            title: t("toastFailed"),
            description: detail ?? t("toastFailedDesc"),
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("newTitle")}</h1>
        <p className="text-muted-foreground mt-2">
          {household ? (
            <>{t("addingToHousehold", { name: household.household_head_name })}</>
          ) : (
            t("addingMember")
          )}
        </p>
      </div>
      <Card>
        <CardHeader><CardTitle>{t("formTitle")}</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="full_name" render={({ field }) => (
                <FormItem><FormLabel>{t("fullName")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="citizenship_no" render={({ field }) => (
                <FormItem><FormLabel>{t("citizenshipNo")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="membership_type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("membershipType")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="general">{t("membershipGeneral")}</SelectItem>
                        <SelectItem value="lifetime">{t("membershipLifetime")}</SelectItem>
                        <SelectItem value="institutional">{t("membershipInstitutional")}</SelectItem>
                        <SelectItem value="special">{t("membershipSpecial")}</SelectItem>
                        <SelectItem value="other">{t("membershipOther")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="membership_status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("membershipStatus")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="active">{t("statusActive")}</SelectItem>
                        <SelectItem value="inactive">{t("statusInactive")}</SelectItem>
                        <SelectItem value="cancelled">{t("statusCancelled")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="date_joined" render={({ field }) => (
                <FormItem><FormLabel>{t("dateJoined")}</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={createMember.isPending}>
                  {createMember.isPending ? t("adding") : t("add")}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push(`/members/${householdId}`)}>
                  {tCommon("cancel")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function MemberNewGuard() {
  const t = useTranslations("members.people");
  const searchParams = useSearchParams();
  const householdId = Number(searchParams.get("household_id"));

  if (!householdId || Number.isNaN(householdId)) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 text-muted-foreground">
        {t("noHousehold")}
      </div>
    );
  }

  return <MemberNewInner householdId={householdId} />;
}

export default function Page() {
  return (
    <AuthGuard>
      <AppLayout>
        <MemberNewGuard />
      </AppLayout>
    </AuthGuard>
  );
}
