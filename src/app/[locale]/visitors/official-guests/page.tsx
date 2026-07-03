"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useListOfficialGuests } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function OfficialGuestsList() {
  const { can } = useAuthStore();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useListOfficialGuests({
    search: search || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Official Guests</h1>
          <p className="text-muted-foreground mt-2">Track visits by officials and distinguished guests.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/visitors">Back to Visitors</Link></Button>
          {can(WRITE_ROLES) && <Button asChild><Link href="/visitors/official-guests/new">Add Guest</Link></Button>}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by name or designation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? <div>Loading...</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.results.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium">{g.visitor_name}</TableCell>
                    <TableCell>{g.designation}</TableCell>
                    <TableCell>{formatDate(g.visit_start_date)}</TableCell>
                    <TableCell>{formatDate(g.visit_end_date)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild><Link href={`/visitors/official-guests/${g.id}`}>View / Edit</Link></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.results || data.results.length === 0) && (
                  <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No official guests found.</TableCell></TableRow>
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
  return <AuthGuard><AppLayout><OfficialGuestsList /></AppLayout></AuthGuard>;
}
