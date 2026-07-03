"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useListRevolvingLoans } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  active: "default",
  repaid: "secondary",
  defaulted: "destructive",
};

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function RevolvingLoansList() {
  const { can } = useAuthStore();
  const [status, setStatus] = useState("all");

  const { data, isLoading } = useListRevolvingLoans({
    status: status !== "all" ? status : undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revolving Loans</h1>
          <p className="text-muted-foreground mt-2">Track household loans and repayments.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/livelihood">Back to Livelihood</Link></Button>
          {can(WRITE_ROLES) && <Button asChild><Link href="/livelihood/revolving-loans/new">Issue Loan</Link></Button>}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="repaid">Repaid</SelectItem>
            <SelectItem value="defaulted">Defaulted</SelectItem>
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
                  <TableHead>Household</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead className="text-right">Repaid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.results.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>#{l.id}</TableCell>
                    <TableCell>{l.household_name || "N/A"}</TableCell>
                    <TableCell className="text-right font-mono">{l.amount}</TableCell>
                    <TableCell>{formatDate(l.issue_date)}</TableCell>
                    <TableCell className="text-right font-mono">{l.repaid_amount ?? "0.00"}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[l.status] ?? "secondary"} className="capitalize">
                        {l.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild><Link href={`/livelihood/revolving-loans/${l.id}`}>View / Edit</Link></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.results || data.results.length === 0) && (
                  <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No revolving loans found.</TableCell></TableRow>
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
  return <AuthGuard><AppLayout><RevolvingLoansList /></AppLayout></AuthGuard>;
}
