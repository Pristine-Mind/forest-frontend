"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { use } from "react";
import { Link } from "@/i18n/routing";
import { useGetSale } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  paid: "default",
  due: "destructive",
  partial: "secondary",
};

function SaleDetail({ id }: { id: number }) {
  const { data: sale, isLoading } = useGetSale(id);

  if (isLoading) return <div>Loading...</div>;
  if (!sale) return <div>Sale not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sale to {sale.buyer_name}</h1>
          <p className="text-muted-foreground mt-2 capitalize">{sale.buyer_type} purchase</p>
        </div>
        <Button variant="outline" asChild><Link href="/inventory/sales">Back to Sales</Link></Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Sale Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {sale.buyer_type === "member" && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Member</p>
                <p>{sale.member_name ?? "N/A"}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Species</p>
              <p>{sale.species_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Grade</p>
              <p>{sale.grade}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Quantity</p>
              <p>{sale.quantity}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rate Applied</p>
              <p>{sale.rate_applied}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p className="text-lg font-semibold">{sale.total_amount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
              <Badge variant={STATUS_VARIANT[sale.payment_status] ?? "secondary"} className="capitalize">
                {sale.payment_status}
              </Badge>
            </div>
            {sale.receipt_no && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receipt No.</p>
                <p>{sale.receipt_no}</p>
              </div>
            )}
          </div>
          {sale.audit_note && (
            <div className="pt-2 border-t">
              <p className="text-sm font-medium text-muted-foreground">Audit Note</p>
              <p>{sale.audit_note}</p>
            </div>
          )}
          <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
            <p>Created: {new Date(sale.created_at).toLocaleString()}</p>
            <p>Updated: {new Date(sale.updated_at).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AuthGuard><AppLayout><SaleDetail id={Number(id)} /></AppLayout></AuthGuard>;
}
