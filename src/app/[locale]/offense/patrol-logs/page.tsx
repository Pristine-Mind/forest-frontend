"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "@/i18n/routing";
import { useListPatrolLogs } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function PatrolLogsList() {
  const { can } = useAuthStore();
  const { data, isLoading } = useListPatrolLogs();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patrol Logs</h1>
          <p className="text-muted-foreground mt-2">Track community patrol rounds and observations.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/offense">Back to Offense</Link></Button>
          {can(WRITE_ROLES) && <Button asChild><Link href="/offense/patrol-logs/new">Log Patrol</Link></Button>}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? <div>Loading...</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Watcher</TableHead>
                  <TableHead>Patrol Date</TableHead>
                  <TableHead>Linked Offense</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.results.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>#{p.id}</TableCell>
                    <TableCell>{p.watcher_name || "N/A"}</TableCell>
                    <TableCell>{formatDate(p.patrol_date)}</TableCell>
                    <TableCell>{p.offense ? `#${p.offense}` : "—"}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild><Link href={`/offense/patrol-logs/${p.id}`}>View</Link></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.results || data.results.length === 0) && (
                  <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No patrol logs found.</TableCell></TableRow>
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
  return <AuthGuard><AppLayout><PatrolLogsList /></AppLayout></AuthGuard>;
}
