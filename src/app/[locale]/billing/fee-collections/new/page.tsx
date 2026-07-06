"use client";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
import { useCreateFeeCollection, useListMembers } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const FEE_TYPE_KEYS: Record<string, string> = {
  membership: "feeTypeMembership",
  renewal: "feeTypeRenewal",
  royalty: "feeTypeRoyalty",
  visitor_entry: "feeTypeVisitorEntry",
  other: "feeTypeOther",
};

function RecordFeeCollection() {
  const t = useTranslations("billing.feeCollections");
  const tCommon = useTranslations("common");
  const tForms = useTranslations("forms");
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createFeeCollection = useCreateFeeCollection();
  const { data: members } = useListMembers({ membership_status: "active", limit: 100 });

  const formSchema = z.object({
    member: z.string().optional(),
    fee_type: z.enum(["membership", "renewal", "royalty", "visitor_entry", "other"]),
    amount: z.string().min(1, tForms("required")).refine((v) => !isNaN(Number(v)) && Number(v) > 0, tForms("positiveNumber")),
    amount_paid: z.string().min(1, tForms("required")).refine((v) => !isNaN(Number(v)) && Number(v) >= 0, tForms("required")),
    description: z.string().optional(),
    payment_type: z.enum(["cash", "cheque", "digital_wallet"]).default("cash"),
    cheque_number: z.string().optional(),
    cheque_bank_name: z.string().optional(),
  }).refine(
    (data) => {
      if (data.payment_type === "cheque") {
        return data.cheque_number && data.cheque_number.trim() !== "" && data.cheque_bank_name && data.cheque_bank_name.trim() !== "";
      }
      return true;
    },
    {
      message: "Cheque number and bank name are required for cheque payments",
      path: ["cheque_number"],
    }
  );

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      member: "",
      fee_type: "membership",
      amount: "",
      amount_paid: "",
      description: "",
      payment_type: "cash",
      cheque_number: "",
      cheque_bank_name: "",
    },
  });

  function onSubmit(values: FormValues) {
    createFeeCollection.mutate(
      {
        data: {
          member: values.member ? Number(values.member) : null,
          fee_type: values.fee_type,
          amount: values.amount,
          amount_paid: values.amount_paid,
          description: values.description || undefined,
          payment_type: values.payment_type,
          cheque_number: values.payment_type === "cheque" ? values.cheque_number : undefined,
          cheque_bank_name: values.payment_type === "cheque" ? values.cheque_bank_name : undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: t("toastCreated") });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/billing/fee-collections/"] });
          router.push("/billing/fee-collections");
        },
        onError: () => {
          toast({ title: t("toastFailed"), variant: "destructive" });
        },
      }
    );
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="member"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("memberOptional")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder={t("selectMember")} /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="">{t("noMember")}</SelectItem>
                        {members?.results.map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>{m.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fee_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("feeType")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="membership">{t("feeTypeMembership")}</SelectItem>
                        <SelectItem value="renewal">{t("feeTypeRenewal")}</SelectItem>
                        <SelectItem value="royalty">{t("feeTypeRoyalty")}</SelectItem>
                        <SelectItem value="visitor_entry">{t("feeTypeVisitorEntry")}</SelectItem>
                        <SelectItem value="other">{t("feeTypeOther")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("totalAmount")}</FormLabel>
                      <FormControl><Input type="number" min={0.01} step="0.01" inputMode="decimal" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount_paid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("amountPaid")}</FormLabel>
                      <FormControl><Input type="number" min={0} step="0.01" inputMode="decimal" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("description")}</FormLabel>
                    <FormControl><Textarea placeholder={t("descriptionPlaceholder")} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("paymentType") || "Payment Type"}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="cash">{t("paymentTypeCash") || "Cash"}</SelectItem>
                        <SelectItem value="cheque">{t("paymentTypeCheque") || "Cheque"}</SelectItem>
                        <SelectItem value="digital_wallet">{t("paymentTypeDigitalWallet") || "Digital Wallet"}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("payment_type") === "cheque" && (
                <>
                  <FormField
                    control={form.control}
                    name="cheque_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("chequeNumber") || "Cheque Number"}</FormLabel>
                        <FormControl><Input placeholder="e.g. CHQ-123456" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cheque_bank_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("chequeBankName") || "Bank Name"}</FormLabel>
                        <FormControl><Input placeholder="e.g. ABC Bank" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={createFeeCollection.isPending}>
                  {createFeeCollection.isPending ? t("recording") : t("create")}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/billing/fee-collections")}>{tCommon("cancel")}</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><RecordFeeCollection /></AppLayout></AuthGuard>;
}
