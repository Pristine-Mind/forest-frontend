"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListForestProductReceipts } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

function ForestProductReceiptList() {
  const { data, isLoading } = useListForestProductReceipts();
  const { can } = useAuthStore();

  return (
    <div className="space-y-6 mt-10 ml-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">वन पैदावार विक्री रसिद</h1>
          <p className="text-muted-foreground mt-2">अनुसुचि-१० — Forest Product Sales Distribution Receipts</p>
        </div>
        {can(WRITE_ROLES) && (
          <Button asChild><Link href="/forms/forest-product-receipts/new">New Receipt</Link></Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? <div>Loading...</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt No. (रांसद नं.)</TableHead>
                  <TableHead>Buyer (श्री)</TableHead>
                  <TableHead>Issue Date (मिति)</TableHead>
                  <TableHead className="text-right">Grand Total (कूल रकम)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.results.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono">{r.receipt_no}</TableCell>
                    <TableCell>{r.buyer_name}</TableCell>
                    <TableCell>{formatDate(r.issuer_date)}</TableCell>
                    <TableCell className="text-right font-mono">NPR {r.grand_total}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/forms/forest-product-receipts/${r.id}`}>View</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/forms/forest-product-receipts/${r.id}/print`}>Print</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.results || data.results.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No receipts found.
                    </TableCell>
                  </TableRow>
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
  return <AuthGuard><AppLayout><ForestProductReceiptList /></AppLayout></AuthGuard>;
}
