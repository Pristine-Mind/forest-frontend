"use client";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useListReceipts } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const REFERENCE_TYPE_KEYS: Record<string, string> = {
  sale: "referenceTypeSale",
  fee_collection: "referenceTypeFeeCollection",
  visitor_entry: "referenceTypeVisitorEntry",
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function ReceiptsList() {
  const t = useTranslations("billing.receipts");
  const tCommon = useTranslations("common");
  const [referenceType, setReferenceType] = useState("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useListReceipts({
    reference_type: referenceType !== "all" ? referenceType : undefined,
    search: search || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
        </div>
        <Button variant="outline" asChild><Link href="/billing">{t("backToBilling")}</Link></Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={referenceType} onValueChange={setReferenceType}>
          <SelectTrigger className="w-44"><SelectValue placeholder={t("filterReferenceType")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filterAllTypes")}</SelectItem>
            <SelectItem value="sale">{t("referenceTypeSale")}</SelectItem>
            <SelectItem value="fee_collection">{t("referenceTypeFeeCollection")}</SelectItem>
            <SelectItem value="visitor_entry">{t("referenceTypeVisitorEntry")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? <div>{tCommon("loading")}</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("tableReceiptNo")}</TableHead>
                  <TableHead>{t("tableReference")}</TableHead>
                  <TableHead className="text-right">{t("tableAmount")}</TableHead>
                  <TableHead>{t("tableIssuedDate")}</TableHead>
                  <TableHead>{t("tablePdf")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.results.map((r) => (
                  <TableRow key={r.receipt_no}>
                    <TableCell className="font-medium">{r.receipt_no}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {t(REFERENCE_TYPE_KEYS[r.reference_type] as any)}
                      </Badge>
                      <span className="ml-2 text-muted-foreground">#{r.reference_id}</span>
                    </TableCell>
                    <TableCell className="text-right">{r.amount}</TableCell>
                    <TableCell>{formatDate(r.issued_date)}</TableCell>
                    <TableCell>
                      {r.pdf_file ? (
                        <Button variant="outline" size="sm" asChild>
                          <a href={r.pdf_file} target="_blank" rel="noopener noreferrer">{t("viewPdf")}</a>
                        </Button>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.results || data.results.length === 0) && (
                  <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">{t("empty")}</TableCell></TableRow>
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
  return <AuthGuard><AppLayout><ReceiptsList /></AppLayout></AuthGuard>;
}
