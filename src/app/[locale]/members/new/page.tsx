"use client";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
import { useCreateHousehold } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

function MemberNew() {
  const t = useTranslations("members");
  const tCommon = useTranslations("common");
  const tForms = useTranslations("forms");
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createHousehold = useCreateHousehold();

  const formSchema = z.object({
    household_head_name: z.string().min(1, tForms("required")),
    tole: z.string().optional(),
    wealth_class: z.enum(["rich", "medium", "poor"]),

    population_male: z.coerce.number().int().min(0).default(0),
    population_female: z.coerce.number().int().min(0).default(0),

    livestock_cattle: z.coerce.number().int().min(0).default(0),
    livestock_buffalo: z.coerce.number().int().min(0).default(0),
    livestock_goat: z.coerce.number().int().min(0).default(0),

    education_level: z.enum(["illiterate", "basic", "secondary_plus"]).optional().or(z.literal("")),
    occupation: z.string().optional(),
    caste_ethnicity: z.string().optional(),

    registration_date: z.string().min(1, tForms("required")),
    entry_fee_type: z.enum(["new_household", "split_household"]),
    status: z.enum(["active", "inactive"]),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      household_head_name: "",
      tole: "",
      wealth_class: "medium",

      population_male: 0,
      population_female: 0,

      livestock_cattle: 0,
      livestock_buffalo: 0,
      livestock_goat: 0,

      education_level: "",
      occupation: "",
      caste_ethnicity: "",

      registration_date: new Date().toISOString().split("T")[0],
      entry_fee_type: "new_household",
      status: "active",
    },
  });

  function onSubmit(values: FormValues) {
    createHousehold.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: t("toastCreated") });
        queryClient.invalidateQueries({ queryKey: ["/api/v1/members/households/"] });
        router.push("/members");
      },
      onError: () => toast({ title: t("toastFailed"), variant: "destructive" }),
    });
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("newTitle")}</h1>
        <p className="text-muted-foreground mt-2">{t("newSubtitle")}</p>
      </div>
      <Card>
        <CardHeader><CardTitle>{t("formTitle")}</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Basic info */}
              <div className="space-y-4">
                <FormField control={form.control} name="household_head_name" render={({ field }) => (
                  <FormItem><FormLabel>{t("headOfHouseholdName")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="tole" render={({ field }) => (
                  <FormItem><FormLabel>{t("toleSettlement")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="wealth_class" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("wealthClass")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="rich">{t("wealthRich")}</SelectItem>
                          <SelectItem value="medium">{t("wealthMedium")}</SelectItem>
                          <SelectItem value="poor">{t("wealthPoor")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("status")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="active">{t("statusActive")}</SelectItem>
                          <SelectItem value="inactive">{t("statusInactive")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Population */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">{t("population")}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="population_male" render={({ field }) => (
                    <FormItem><FormLabel>{t("maleMembers")}</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="population_female" render={({ field }) => (
                    <FormItem><FormLabel>{t("femaleMembers")}</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              {/* Livestock */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">{t("livestock")}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="livestock_cattle" render={({ field }) => (
                    <FormItem><FormLabel>{t("cattle")}</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="livestock_buffalo" render={({ field }) => (
                    <FormItem><FormLabel>{t("buffalo")}</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="livestock_goat" render={({ field }) => (
                    <FormItem><FormLabel>{t("goat")}</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              {/* Socioeconomic */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">{t("socioeconomicDetails")}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="education_level" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("educationLevel")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder={t("educationNotSpecified")} /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="illiterate">{t("educationIlliterate")}</SelectItem>
                          <SelectItem value="basic">{t("educationBasic")}</SelectItem>
                          <SelectItem value="secondary_plus">{t("educationSecondaryPlus")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="occupation" render={({ field }) => (
                    <FormItem><FormLabel>{t("occupation")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="caste_ethnicity" render={({ field }) => (
                  <FormItem><FormLabel>{t("casteEthnicity")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              {/* Registration & Fee */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">{t("registrationAndFee")}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="registration_date" render={({ field }) => (
                    <FormItem><FormLabel>{t("registrationDate")}</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="entry_fee_type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("entryFeeType")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="new_household">{t("entryFeeNew")}</SelectItem>
                          <SelectItem value="split_household">{t("entryFeeSplit")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={createHousehold.isPending}>
                  {createHousehold.isPending ? t("creating") : t("createHousehold")}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/members")}>{tCommon("cancel")}</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><MemberNew /></AppLayout></AuthGuard>;
}
