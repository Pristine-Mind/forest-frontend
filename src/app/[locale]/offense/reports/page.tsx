"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useListOffenseReports } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  reported: "destructive",
  investigating: "default",
  resolved: "secondary",
  escalated_to_court: "outline",
};

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function OffenseReportsList() {
  const { can } = useAuthStore();
  const [status, setStatus] = useState("all");

  const { data, isLoading } = useListOffenseReports({
    status: status !== "all" ? status : undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offense Reports</h1>
          <p className="text-muted-foreground mt-2">Track violations and resolutions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/offense">Back to Offense</Link></Button>
          {can(WRITE_ROLES) && <Button asChild><Link href="/offense/reports/new">File Report</Link></Button>}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="reported">Reported</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="escalated_to_court">Escalated to Court</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? <div>Loading...</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Accused</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Report Date</TableHead>
                  <TableHead className="text-right">Fine</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.results.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>#{o.id}</TableCell>
                    <TableCell className="font-medium">{o.accused_name}</TableCell>
                    <TableCell>{o.offense_type}</TableCell>
                    <TableCell>{formatDate(o.report_date)}</TableCell>
                    <TableCell className="text-right font-mono">{o.fine_amount ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[o.status] ?? "secondary"} className="capitalize whitespace-nowrap">
                        {o.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild><Link href={`/offense/reports/${o.id}`}>View / Edit</Link></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.results || data.results.length === 0) && (
                  <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No offense reports found.</TableCell></TableRow>
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
  return <AuthGuard><AppLayout><OffenseReportsList /></AppLayout></AuthGuard>;
}
