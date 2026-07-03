"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { use } from "react";
import { Link } from "@/i18n/routing";
import { useGetCashTransaction } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TYPE_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  income: "default",
  expense: "destructive",
};

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function CashTransactionDetail({ id }: { id: number }) {
  const { data: tx, isLoading } = useGetCashTransaction(id);

  if (isLoading) return <div>Loading...</div>;
  if (!tx) return <div>Transaction not found.</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction #{tx.id}</h1>
          <p className="text-muted-foreground mt-2 capitalize">{tx.type}</p>
        </div>
        <Button variant="outline" asChild><Link href="/fund/cash-transactions">Back to Transactions</Link></Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Transaction Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <Badge variant={TYPE_VARIANT[tx.type] ?? "secondary"} className="capitalize mt-1">{tx.type}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Amount</p>
              <p className="font-mono">{tx.amount}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Source / Purpose</p>
              <p>{tx.source_or_purpose}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p>{formatDate(tx.created_at)}</p>
            </div>
          </div>
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
        <CashTransactionDetail id={Number(id)} />
      </AppLayout>
    </AuthGuard>
  );
}
