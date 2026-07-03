"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { use } from "react";
import { Link } from "@/i18n/routing";
import { useGetSpecies, useListTreeCounts } from "@/lib/api";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function SpeciesDetail({ id }: { id: number }) {
  const { data: species, isLoading } = useGetSpecies(id);
  const { data: treeCounts, isLoading: countsLoading } = useListTreeCounts({ species: id });
  const { can } = useAuthStore();

  if (isLoading) return <div>Loading...</div>;
  if (!species) return <div>Species not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{species.species_name}</h1>
        <div className="flex gap-2">
          {can(WRITE_ROLES) && (
            <Button asChild>
              <Link href={`/forest/species/${id}/edit`}>Edit</Link>
            </Button>
          )}
          <Button variant="outline" asChild><Link href="/forest">Back to Forest Resources</Link></Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Tree Counts by Block</CardTitle></CardHeader>
        <CardContent>
          {countsLoading ? <div>Loading...</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Block</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Harvested</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treeCounts?.results.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      {t.block ? (
                        <Link href={`/forest/blocks/${t.block}`} className="hover:underline">{t.block_name}</Link>
                      ) : (
                        "All blocks"
                      )}
                    </TableCell>
                    <TableCell className="text-right">{t.total_count}</TableCell>
                    <TableCell className="text-right">{t.harvested_count}</TableCell>
                    <TableCell className="text-right">{t.remaining_count}</TableCell>
                  </TableRow>
                ))}
                {(!treeCounts?.results || treeCounts.results.length === 0) && (
                  <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No tree counts recorded for this species.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AuthGuard><AppLayout><SpeciesDetail id={Number(id)} /></AppLayout></AuthGuard>;
}
