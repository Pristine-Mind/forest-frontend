"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { use } from "react";
import { Link } from "@/i18n/routing";
import { useGetPatrolLog } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function PatrolLogDetail({ id }: { id: number }) {
  const { data: log, isLoading } = useGetPatrolLog(id);

  if (isLoading) return <div>Loading...</div>;
  if (!log) return <div>Patrol log not found.</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patrol Log #{log.id}</h1>
          <p className="text-muted-foreground mt-2">{log.watcher_name || "N/A"}</p>
        </div>
        <Button variant="outline" asChild><Link href="/offense/patrol-logs">Back to Logs</Link></Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Patrol Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Watcher</p>
              <p>{log.watcher_name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Patrol Date</p>
              <p>{formatDate(log.patrol_date)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Linked Offense</p>
              <p>{log.offense ? `#${log.offense}` : "—"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Notes</p>
              <p>{log.notes || "—"}</p>
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
        <PatrolLogDetail id={Number(id)} />
      </AppLayout>
    </AuthGuard>
  );
}
