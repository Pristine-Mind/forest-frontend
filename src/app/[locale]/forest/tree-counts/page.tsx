"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListTreeCounts } from "@/lib/api";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";

function TreeCountList() {
  const { data, isLoading } = useListTreeCounts();
  const { can } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tree Count Register</h1>
          <p className="text-muted-foreground mt-2">Baseline and remaining tree counts by species and block.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/forest">Back to Forest Resources</Link></Button>
          {can(WRITE_ROLES) && <Button asChild><Link href="/forest/tree-counts/new">Add Entry</Link></Button>}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? <div>Loading...</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Species</TableHead>
                  <TableHead>Block</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Harvested</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.results.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.species_name}</TableCell>
                    <TableCell>{t.block_name ?? "All blocks"}</TableCell>
                    <TableCell className="text-right">{t.total_count}</TableCell>
                    <TableCell className="text-right">{t.harvested_count}</TableCell>
                    <TableCell className="text-right">{t.remaining_count}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/forest/tree-counts/${t.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.results || data.results.length === 0) && (
                  <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No tree count entries found.</TableCell></TableRow>
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
  return <AuthGuard><AppLayout><TreeCountList /></AppLayout></AuthGuard>;
}
