"use client";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useListFeeCollections } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";

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

function FeeCollectionsList() {
  const t = useTranslations("billing.feeCollections");
  const tCommon = useTranslations("common");
  const { can } = useAuthStore();
  const [feeType, setFeeType] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");

  const { data, isLoading } = useListFeeCollections({
    fee_type: feeType !== "all" ? feeType : undefined,
    payment_status: paymentStatus !== "all" ? paymentStatus : undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/billing">{t("backToBilling")}</Link></Button>
          {can(WRITE_ROLES) && <Button asChild><Link href="/billing/fee-collections/new">{t("recordPayment")}</Link></Button>}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={feeType} onValueChange={setFeeType}>
          <SelectTrigger className="w-44"><SelectValue placeholder={t("filterFeeType")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filterAllTypes")}</SelectItem>
            <SelectItem value="membership">{t("feeTypeMembership")}</SelectItem>
            <SelectItem value="renewal">{t("feeTypeRenewal")}</SelectItem>
            <SelectItem value="royalty">{t("feeTypeRoyalty")}</SelectItem>
            <SelectItem value="visitor_entry">{t("feeTypeVisitorEntry")}</SelectItem>
            <SelectItem value="other">{t("feeTypeOther")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentStatus} onValueChange={setPaymentStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder={t("filterPaymentStatus")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filterAllStatuses")}</SelectItem>
            <SelectItem value="paid">{t("statusPaid")}</SelectItem>
            <SelectItem value="due">{t("statusDue")}</SelectItem>
            <SelectItem value="partial">{t("statusPartial")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? <div>{tCommon("loading")}</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("tableMember")}</TableHead>
                  <TableHead>{t("tableType")}</TableHead>
                  <TableHead className="text-right">{t("tableAmount")}</TableHead>
                  <TableHead className="text-right">{t("tablePaid")}</TableHead>
                  <TableHead>{t("tableStatus")}</TableHead>
                  <TableHead>{t("tableReceipt")}</TableHead>
                  <TableHead>{t("tableActions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.results.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>{f.member_name || "N/A"}</TableCell>
                    <TableCell className="capitalize">{t(FEE_TYPE_KEYS[f.fee_type] as any)}</TableCell>
                    <TableCell className="text-right">{f.amount}</TableCell>
                    <TableCell className="text-right">{f.amount_paid}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[f.payment_status ?? "due"] ?? "secondary"} className="capitalize">
                        {f.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>{f.receipt_no ?? "—"}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild><Link href={`/billing/fee-collections/${f.id}`}>{t("viewEdit")}</Link></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.results || data.results.length === 0) && (
                  <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">{t("empty")}</TableCell></TableRow>
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
  return <AuthGuard><AppLayout><FeeCollectionsList /></AppLayout></AuthGuard>;
}
