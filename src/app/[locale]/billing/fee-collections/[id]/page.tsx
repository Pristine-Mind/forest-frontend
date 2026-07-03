"use client";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { use, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetFeeCollection, useUpdateFeeCollection } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  paid: "default",
  due: "destructive",
  partial: "secondary",
};

const FEE_TYPE_KEYS: Record<string, string> = {
  membership: "feeTypeMembership",
  renewal: "feeTypeRenewal",
  royalty: "feeTypeRoyalty",
  visitor_entry: "feeTypeVisitorEntry",
  other: "feeTypeOther",
};

function FeeCollectionDetail({ id }: { id: number }) {
  const t = useTranslations("billing.feeCollections");
  const tCommon = useTranslations("common");
  const tForms = useTranslations("forms");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { can } = useAuthStore();
  const canWrite = can(WRITE_ROLES);

  const { data: fee, isLoading } = useGetFeeCollection(id);
  const updateFee = useUpdateFeeCollection();

  const formSchema = z.object({
    amount_paid: z.string().min(1, tForms("required")).refine((v) => !isNaN(Number(v)) && Number(v) >= 0, tForms("required")),
    description: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount_paid: "", description: "" },
  });

  useEffect(() => {
    if (fee) {
      form.reset({
        amount_paid: fee.amount_paid,
        description: fee.description ?? "",
      });
    }
  }, [fee, form]);

  if (isLoading) return <div>{tCommon("loading")}</div>;
  if (!fee) return <div>{t("notFound")}</div>;

  function onSubmit(values: FormValues) {
    updateFee.mutate(
      {
        id,
        data: {
          amount_paid: values.amount_paid,
          description: values.description || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: t("toastUpdated") });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/billing/fee-collections/"] });
          queryClient.invalidateQueries({ queryKey: [`/api/v1/billing/fee-collections/${id}/`] });
        },
        onError: () => {
          toast({ title: t("toastUpdateFailed"), variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("detailTitle", { id: fee.id })}</h1>
          <p className="text-muted-foreground mt-2 capitalize">{t(FEE_TYPE_KEYS[fee.fee_type] as any)}</p>
        </div>
        <Button variant="outline" asChild><Link href="/billing/fee-collections">{t("backToCollections")}</Link></Button>
      </div>

      <Card>
        <CardHeader><CardTitle>{t("formTitle")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("member")}</p>
              <p>{fee.member_name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{tCommon("type")}</p>
              <p className="capitalize">{t(FEE_TYPE_KEYS[fee.fee_type] as any)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("totalAmount")}</p>
              <p>{fee.amount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("amountPaid")}</p>
              <p>{fee.amount_paid}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{tCommon("status")}</p>
              <Badge variant={STATUS_VARIANT[fee.payment_status ?? "due"] ?? "secondary"} className="capitalize">
                {fee.payment_status}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("receiptNo")}</p>
              <p>{fee.receipt_no ?? "—"}</p>
            </div>
          </div>

          {canWrite && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-medium">{t("updatePayment")}</h3>
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
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("description")}</FormLabel>
                      <FormControl><Textarea placeholder={t("notesPlaceholder")} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={updateFee.isPending}>
                  {updateFee.isPending ? t("saving") : t("saveChanges")}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AuthGuard>
      <AppLayout>
        <FeeCollectionDetail id={Number(id)} />
      </AppLayout>
    </AuthGuard>
  );
}
