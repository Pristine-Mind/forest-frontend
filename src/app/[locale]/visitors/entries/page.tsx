"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useListVisitorEntries } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function VisitorEntriesList() {
  const { can } = useAuthStore();
  const [purpose, setPurpose] = useState("all");
  const [feeWaived, setFeeWaived] = useState("all");

  const { data, isLoading } = useListVisitorEntries({
    visit_purpose: purpose !== "all" ? purpose : undefined,
    fee_waived: feeWaived !== "all" ? feeWaived === "true" : undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visitor Entries</h1>
          <p className="text-muted-foreground mt-2">Log and track visitors to the community forest.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/visitors">Back to Visitors</Link></Button>
          {can(WRITE_ROLES) && <Button asChild><Link href="/visitors/entries/new">Log Visitor</Link></Button>}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={purpose} onValueChange={setPurpose}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Purpose" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Purposes</SelectItem>
            <SelectItem value="general_visit">General Visit</SelectItem>
            <SelectItem value="study_research">Study / Research</SelectItem>
          </SelectContent>
        </Select>
        <Select value={feeWaived} onValueChange={setFeeWaived}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Fee Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fees</SelectItem>
            <SelectItem value="false">Fee Collected</SelectItem>
            <SelectItem value="true">Fee Waived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? <div>Loading...</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead className="text-right">Visitors</TableHead>
                  <TableHead className="text-right">Days</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.results.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{formatDate(v.entry_date)}</TableCell>
                    <TableCell className="capitalize">{v.visit_purpose.replace("_", " ")}</TableCell>
                    <TableCell className="text-right">{v.visitor_count}</TableCell>
                    <TableCell className="text-right">{v.days}</TableCell>
                    <TableCell>
                      {v.fee_waived ? (
                        <Badge variant="secondary">Waived</Badge>
                      ) : (
                        <Badge variant="default">Collected</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{v.total_amount ?? "—"}</TableCell>
                    <TableCell>{v.receipt_no ?? "—"}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild><Link href={`/visitors/entries/${v.id}`}>View</Link></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.results || data.results.length === 0) && (
                  <TableRow><TableCell colSpan={8} className="text-center py-6 text-muted-foreground">No visitor entries found.</TableCell></TableRow>
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
  return <AuthGuard><AppLayout><VisitorEntriesList /></AppLayout></AuthGuard>;
}
