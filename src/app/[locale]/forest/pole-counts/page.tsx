"use client";

import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "@/i18n/routing";
import { useListTreeCounts } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

/**
 * Pole Counts List Page
 * Similar to Tree Counts but for poles specifically
 */
function PoleCountsList() {
  const tCommon = useTranslations("common");
  const { can } = useAuthStore();
  const { toast } = useToast();

  // Using useListTreeCounts - pole counts may be a subset or separate endpoint
  const { data, isLoading, isError, error } = useListTreeCounts();
  
  if (isError) {
    toast({
      title: "Error",
      description: error?.message || "Failed to load pole counts",
      variant: "destructive",
    });
  }

  return (
    <AppLayout>
      <AuthGuard>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Pole Count Register</h1>
              <p className="text-muted-foreground mt-2">Track pole inventory and measurements</p>
            </div>
            {can(WRITE_ROLES) && (
              <Button asChild>
                <Link href="/forest/pole-counts/new">Add Pole Count</Link>
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pole Counts</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>{tCommon("loading")}</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Block</TableHead>
                        <TableHead>Species</TableHead>
                        <TableHead>Plot</TableHead>
                        <TableHead>Tree #</TableHead>
                        <TableHead className="text-right">Girth (cm)</TableHead>
                        <TableHead className="text-right">Height (m)</TableHead>
                        <TableHead className="text-right">Volume (m³)</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.results?.map((pole: any) => (
                        <TableRow key={pole.id}>
                          <TableCell>{pole.block_name}</TableCell>
                          <TableCell>{pole.species_name}</TableCell>
                          <TableCell>{pole.plot_number}</TableCell>
                          <TableCell>{pole.tree_number}</TableCell>
                          <TableCell className="text-right">{parseFloat(pole.girth_cm).toFixed(1)}</TableCell>
                          <TableCell className="text-right">{parseFloat(pole.height_m).toFixed(1)}</TableCell>
                          <TableCell className="text-right">{parseFloat(pole.total_volume_cubic_m).toFixed(3)}</TableCell>
                          <TableCell>{pole.tree_class_display}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/forest/pole-counts/${pole.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!data?.results || data.results.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                            No pole counts found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    </AppLayout>
  );
}

export default PoleCountsList;
