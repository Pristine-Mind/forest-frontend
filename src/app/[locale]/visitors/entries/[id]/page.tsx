"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { use } from "react";
import { Link } from "@/i18n/routing";
import { useGetVisitorEntry } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function VisitorEntryDetail({ id }: { id: number }) {
  const { data: entry, isLoading } = useGetVisitorEntry(id);

  if (isLoading) return <div>Loading...</div>;
  if (!entry) return <div>Visitor entry not found.</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visitor Entry #{entry.id}</h1>
          <p className="text-muted-foreground mt-2 capitalize">{entry.visit_purpose.replace("_", " ")}</p>
        </div>
        <Button variant="outline" asChild><Link href="/visitors/entries">Back to Entries</Link></Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Entry Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Entry Date</p>
              <p>{formatDate(entry.entry_date)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Purpose</p>
              <p className="capitalize">{entry.visit_purpose.replace("_", " ")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Visitor Count</p>
              <p>{entry.visitor_count}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Days</p>
              <p>{entry.days}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fee Status</p>
              <Badge variant={entry.fee_waived ? "secondary" : "default"}>
                {entry.fee_waived ? "Waived" : "Collected"}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p>{entry.total_amount ?? "—"}</p>
            </div>
            {entry.receipt_no && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receipt No.</p>
                <p>{entry.receipt_no}</p>
              </div>
            )}
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
        <VisitorEntryDetail id={Number(id)} />
      </AppLayout>
    </AuthGuard>
  );
}
