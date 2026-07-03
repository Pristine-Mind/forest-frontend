"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { use } from "react";
import { Link } from "@/i18n/routing";
import { useGetForestBlock, useListTreeCounts } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function ForestBlockDetail({ id }: { id: number }) {
  const { data: block, isLoading } = useGetForestBlock(id);
  const { data: treeCounts, isLoading: countsLoading } = useListTreeCounts({ block: id });

  if (isLoading) return <div>Loading...</div>;
  if (!block) return <div>Forest block not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{block.block_name}</h1>
          <p className="text-muted-foreground mt-2">{block.total_area_ha} hectares</p>
        </div>
        <Button variant="outline" asChild><Link href="/forest">Back to Forest Resources</Link></Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Tree Counts in this Block</CardTitle></CardHeader>
        <CardContent>
          {countsLoading ? <div>Loading...</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Species</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Harvested</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treeCounts?.results.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Link href={`/forest/species/${t.species}`} className="hover:underline">
                        {t.species_name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">{t.total_count}</TableCell>
                    <TableCell className="text-right">{t.harvested_count}</TableCell>
                    <TableCell className="text-right">{t.remaining_count}</TableCell>
                  </TableRow>
                ))}
                {(!treeCounts?.results || treeCounts.results.length === 0) && (
                  <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No tree counts recorded for this block.</TableCell></TableRow>
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
  return <AuthGuard><AppLayout><ForestBlockDetail id={Number(id)} /></AppLayout></AuthGuard>;
}
