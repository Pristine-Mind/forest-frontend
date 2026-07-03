"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import {
  useListCommitteeMembers,
  useGetCommitteeQuotaStatus,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  active: "default",
  vacant: "secondary",
  removed: "destructive",
};

function CommitteeMembersList() {
  const { can } = useAuthStore();
  const [position, setPosition] = useState("all");
  const [status, setStatus] = useState("all");

  const { data, isLoading } = useListCommitteeMembers({
    position: position !== "all" ? position : undefined,
    status: status !== "all" ? status : undefined,
  });
  const { data: quota } = useGetCommitteeQuotaStatus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Committee Members</h1>
          <p className="text-muted-foreground mt-2">Manage the executive committee.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/governance">Back to Governance</Link></Button>
          {can(WRITE_ROLES) && <Button asChild><Link href="/governance/committee-members/new">Add Member</Link></Button>}
        </div>
      </div>

      {quota && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Members</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{quota.active_total ?? 0}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Female Representation</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{quota.female_count ?? 0} <span className="text-sm font-normal text-muted-foreground">/ {quota.female_min ?? 0} min</span></p>
              <Badge variant={quota.female_quota_met ? "default" : "destructive"} className="mt-2">
                {quota.female_quota_met ? "Quota Met" : "Quota Not Met"}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Minority Representation</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{quota.minority_count ?? 0} <span className="text-sm font-normal text-muted-foreground">/ {quota.minority_min ?? 0} min</span></p>
              <Badge variant={quota.minority_quota_met ? "default" : "destructive"} className="mt-2">
                {quota.minority_quota_met ? "Quota Met" : "Quota Not Met"}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Select value={position} onValueChange={setPosition}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Position" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Positions</SelectItem>
            <SelectItem value="chair">Chair</SelectItem>
            <SelectItem value="vice_chair">Vice Chair</SelectItem>
            <SelectItem value="secretary">Secretary</SelectItem>
            <SelectItem value="joint_secretary">Joint Secretary</SelectItem>
            <SelectItem value="treasurer">Treasurer</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="vacant">Vacant</SelectItem>
            <SelectItem value="removed">Removed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? <div>Loading...</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Term Start</TableHead>
                  <TableHead>Term End</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.results.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.member_name}</TableCell>
                    <TableCell className="capitalize">{c.position.replace("_", " ")}</TableCell>
                    <TableCell className="capitalize">{c.gender}</TableCell>
                    <TableCell>{formatDate(c.term_start)}</TableCell>
                    <TableCell>{formatDate(c.term_end)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[c.status] ?? "secondary"} className="capitalize">{c.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild><Link href={`/governance/committee-members/${c.id}`}>View / Edit</Link></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.results || data.results.length === 0) && (
                  <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No committee members found.</TableCell></TableRow>
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
  return <AuthGuard><AppLayout><CommitteeMembersList /></AppLayout></AuthGuard>;
}
