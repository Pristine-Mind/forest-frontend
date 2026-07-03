"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useListHarvestRequests } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

function formatDate(value?: string | null) {
  if (!value) return "N/A";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

function HarvestRequestList() {
  const [status, setStatus] = useState("all");
  const [sourceType, setSourceType] = useState("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useListHarvestRequests({
    status: status !== "all" ? status : undefined,
    source_type: sourceType !== "all" ? sourceType : undefined,
    search: search || undefined,
  });

  const { can, user } = useAuthStore();
  const canCreate = can(WRITE_ROLES) || user?.role === "member";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Harvest Requests</h1>
          <p className="text-muted-foreground mt-2">Member and forest-initiated timber harvest requests.</p>
        </div>
        {canCreate && <Button asChild><Link href="/harvest/new">New Request</Link></Button>}
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by member, species, or operation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceType} onValueChange={setSourceType}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Source Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="member_requested">Member Requested</SelectItem>
            <SelectItem value="forest_initiated">Forest Initiated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? <div>Loading...</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Species</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Member / Operation</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Requested Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.results.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>{h.species_name}</TableCell>
                    <TableCell className="capitalize">{h.source_type.replace("_", " ")}</TableCell>
                    <TableCell>
                      {h.source_type === "member_requested" ? h.member_name ?? "N/A" : h.operation_name}
                    </TableCell>
                    <TableCell className="text-right">{h.quantity}</TableCell>
                    <TableCell>{formatDate(h.requested_date)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[h.status] ?? "secondary"} className="capitalize">{h.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/harvest/${h.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.results || data.results.length === 0) && (
                  <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No harvest requests found.</TableCell></TableRow>
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
  return <AuthGuard><AppLayout><HarvestRequestList /></AppLayout></AuthGuard>;
}
