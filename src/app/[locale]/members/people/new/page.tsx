"use client";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useCreateMember, useGetHousehold } from "@/lib/api/members";
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
    photo: z.instanceof(File).optional(),
    relation: z.string().min(1, tForms("required")),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      photo: undefined,
      relation: "",
    },
  });

  function onSubmit(values: FormValues) {
    createMember.mutate(
      { full_name: values.full_name, household: householdId, photo: values.photo },
      {
        onSuccess: () => {
          toast({ title: t("toastCreated") });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/members/members/"] });
          queryClient.invalidateQueries({ queryKey: [`/api/v1/members/households/${householdId}/`] });
          router.push(`/members/${householdId}`);
        },
        onError: (error: any) => {
          const detail = error?.response?.data?.full_name?.[0];
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
              <FormField control={form.control} name="relation" render={({ field }) => (
                <FormItem><FormLabel>{t("relation")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="photo" render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Photo</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...field} />
                      {value && <div className="text-sm text-muted-foreground">Selected: {value.name}</div>}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
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
