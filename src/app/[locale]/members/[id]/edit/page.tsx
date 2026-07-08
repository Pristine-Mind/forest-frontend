"use client";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
import {
  useUpdateHousehold,
  useGetHousehold,
  type HouseholdUpdate,
  type MembershipStatus,
  type MembershipType,
  type EntryFeeType,
  type WealthClass,
  type HouseholdStatus,
  type EducationLevel,
} from "@/lib/api/members";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { use } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useEffect } from "react";

function HouseholdEdit({ id }: { id: number }) {
  const t = useTranslations("members");
  const tCommon = useTranslations("common");
  const tForms = useTranslations("forms");
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateHousehold = useUpdateHousehold();
  const { data: household, isLoading } = useGetHousehold(id);

  const formSchema = z.object({
    household_head_name: z.string().min(1, tForms("required")),
    tole: z.string().optional(),
    citizenship_no: z.string().min(1, tForms("required")),
    contact_number: z.string().optional(),
    wealth_class: z.enum(["rich", "medium", "poor"] as const),
    membership_type: z.enum(["general", "lifetime", "institutional", "special", "other"] as const),
    membership_status: z.enum(["active", "inactive", "cancelled"] as const),
    date_joined: z.string().min(1, tForms("required")),
    population_male: z.coerce.number().int().min(0),
    population_female: z.coerce.number().int().min(0),
    livestock_cattle: z.coerce.number().int().min(0),
    livestock_buffalo: z.coerce.number().int().min(0),
    livestock_goat: z.coerce.number().int().min(0),
    education_level: z.enum(["illiterate", "basic", "secondary_plus"] as const).optional().or(z.literal("")),
    occupation: z.string().optional(),
    caste_ethnicity: z.string().optional(),
    registration_date: z.string().min(1, tForms("required")),
    entry_fee_type: z.enum(["new_household", "split_household"] as const),
    status: z.enum(["active", "inactive"] as const),
    photo: z.instanceof(File).optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      household_head_name: "",
      tole: "",
      citizenship_no: "",
      contact_number: "",
      wealth_class: "medium",
      membership_type: "general",
      membership_status: "active",
      date_joined: new Date().toISOString().split("T")[0],
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
      photo: undefined,
    },
  });

  // Reset form when household data loads
  useEffect(() => {
    if (household) {
      form.reset({
        household_head_name: household.household_head_name,
        tole: household.tole || "",
        citizenship_no: household.citizenship_no,
        contact_number: household.contact_number || "",
        wealth_class: household.wealth_class as WealthClass,
        membership_type: household.membership_type as MembershipType,
        membership_status: household.membership_status as MembershipStatus,
        date_joined: household.date_joined,
        population_male: household.population_male,
        population_female: household.population_female,
        livestock_cattle: household.livestock_cattle,
        livestock_buffalo: household.livestock_buffalo,
        livestock_goat: household.livestock_goat,
        education_level: household.education_level as EducationLevel | undefined || "",
        occupation: household.occupation || "",
        caste_ethnicity: household.caste_ethnicity || "",
        registration_date: household.registration_date,
        entry_fee_type: household.entry_fee_type as EntryFeeType,
        status: household.status as HouseholdStatus,
        photo: undefined,
      });
    }
  }, [household, form.reset]);

  function onSubmit(values: FormValues) {
    const payload: HouseholdUpdate = {
      household_head_name: values.household_head_name,
      tole: values.tole,
      citizenship_no: values.citizenship_no,
      contact_number: values.contact_number,
      wealth_class: values.wealth_class as WealthClass,
      membership_type: values.membership_type as MembershipType,
      membership_status: values.membership_status as MembershipStatus,
      date_joined: values.date_joined,
      status: values.status as HouseholdStatus,
      population_male: values.population_male,
      population_female: values.population_female,
      livestock_cattle: values.livestock_cattle,
      livestock_buffalo: values.livestock_buffalo,
      livestock_goat: values.livestock_goat,
      education_level: values.education_level as EducationLevel | undefined,
      occupation: values.occupation,
      caste_ethnicity: values.caste_ethnicity,
      registration_date: values.registration_date,
      entry_fee_type: values.entry_fee_type as EntryFeeType,
      photo: values.photo,
    };

    updateHousehold.mutate(
      { id, data: payload },
      {
        onSuccess: () => {
          toast({ title: t("householdUpdated") || "Household updated" });
          queryClient.invalidateQueries({ queryKey: [`/api/v1/members/households/${id}/`] });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/members/households/"] });
          router.push(`/members/${id}`);
        },
        onError: () => toast({ title: t("toastFailed"), variant: "destructive" }),
      }
    );
  }

  if (isLoading) return <div className="flex items-center justify-center p-8"><Spinner /></div>;
  if (!household) return <div>{t("notFound")}</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("editTitle") || "Edit Household"}</h1>
        <p className="text-muted-foreground mt-2">Update household information</p>
      </div>
      <Card>
        <CardHeader><CardTitle>{t("formTitle")}</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Basic Information</h3>
                <FormField control={form.control} name="household_head_name" render={({ field }) => (
                  <FormItem><FormLabel>{t("headOfHouseholdName")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="citizenship_no" render={({ field }) => (
                  <FormItem><FormLabel>Citizenship No.</FormLabel><FormControl><Input {...field} placeholder="e.g., 56789-2087-123456" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="contact_number" render={({ field }) => (
                  <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input {...field} placeholder="e.g., 9812345678" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="tole" render={({ field }) => (
                  <FormItem><FormLabel>{t("toleSettlement")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              {/* Membership Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Membership Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="membership_type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="lifetime">Lifetime</SelectItem>
                          <SelectItem value="institutional">Institutional</SelectItem>
                          <SelectItem value="special">Special</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="membership_status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="date_joined" render={({ field }) => (
                    <FormItem><FormLabel>Date Joined</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="registration_date" render={({ field }) => (
                    <FormItem><FormLabel>{t("registrationDate")}</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              {/* Household Status & Wealth */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Household Details</h3>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
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

              {/* Entry Fee */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">{t("registrationAndFee")}</h3>
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

              {/* Photo */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Photo</h3>
                <FormField control={form.control} name="photo" render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Household Head Photo</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...field} />
                        {value && <div className="text-sm text-muted-foreground">Selected: {value.name}</div>}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={updateHousehold.isPending}>
                  {updateHousehold.isPending ? "Updating..." : "Update Household"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push(`/members/${id}`)}>{tCommon("cancel")}</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AuthGuard><AppLayout><HouseholdEdit id={Number(id)} /></AppLayout></AuthGuard>;
}
