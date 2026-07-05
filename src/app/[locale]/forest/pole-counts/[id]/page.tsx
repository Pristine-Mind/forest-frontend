"use client";

import { use } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { useGetTreeCount } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { calculateTreeVolumes } from "@/lib/forest-calculations";

/**
 * Pole Count Detail Page
 */
function PoleCountDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { can } = useAuthStore();
  const { toast } = useToast();

  // Using tree count - pole counts use same structure
  const { data, isLoading, isError, error } = useGetTreeCount(Number(id));
  
  if (isError) {
    toast({
      title: "Error",
      description: error?.message || "Failed to load pole count",
      variant: "destructive",
    });
  }

  if (isLoading) return <AppLayout><div>Loading...</div></AppLayout>;
  if (!data) return <AppLayout><div>Not found</div></AppLayout>;

  return (
    <AppLayout>
      <AuthGuard>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {data.species_name}
              </h1>
              <p className="text-muted-foreground mt-2">Block: {data.block_name}</p>
            </div>
            {can(WRITE_ROLES) && (
              <Button asChild>
                <Link href={`/forest/pole-counts/${id}/edit`}>Edit</Link>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Measurements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Girth (cm)</p>
                  <p className="text-xl font-semibold">{parseFloat(data.girth_cm).toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Height (m)</p>
                  <p className="text-xl font-semibold">{parseFloat(data.height_m).toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tree Class</p>
                  <p className="text-xl font-semibold">{data.tree_class_display}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Volume Calculations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Basal Area (m²)</p>
                  <p className="text-lg">{parseFloat(data.basal_area_sqm).toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Stem Volume (m³)</p>
                  <p className="text-lg">{parseFloat(data.stem_volume_cubic_m).toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Branch Volume (m³)</p>
                  <p className="text-lg">{parseFloat(data.branch_volume_cubic_m).toFixed(3)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Net Volumes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Volume (m³)</p>
                  <p className="text-2xl font-bold text-blue-600">{parseFloat(data.total_volume_cubic_m).toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gross Volume (m³)</p>
                  <p className="text-lg">{parseFloat(data.gross_volume_cubic_m).toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Net Volume (m³)</p>
                  <p className="text-lg">{parseFloat(data.net_volume_cubic_m).toFixed(3)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Special Volumes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fuelwood Volume (m³)</p>
                  <p className="text-lg">{parseFloat(data.fuelwood_volume_cubic_m).toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">R Factor</p>
                  <p className="text-lg">{parseFloat(data.r_factor).toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Harvestable</p>
                  <p className="text-lg">{data.is_harvestable ? "✓ Yes" : "✗ No"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Survey Date</p>
                  <p className="text-lg">{data.survey_date}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {data.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{data.notes}</p>
              </CardContent>
            </Card>
          )}

          <Button asChild variant="outline">
            <Link href="/forest/pole-counts">← Back</Link>
          </Button>
        </div>
      </AuthGuard>
    </AppLayout>
  );
}

export default PoleCountDetail;
