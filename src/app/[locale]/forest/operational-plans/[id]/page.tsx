"use client";

import { use } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { useGetOperationalPlan } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

/**
 * Operational Plan Detail Page
 */
function OperationalPlanDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { can } = useAuthStore();
  const { toast } = useToast();

  const { data, isLoading, isError, error } = useGetOperationalPlan(Number(id));
  
  if (isError) {
    toast({
      title: "Error",
      description: error?.message || "Failed to load operational plan",
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
              <h1 className="text-3xl font-bold tracking-tight">Operational Plan</h1>
            </div>
            {can(WRITE_ROLES) && (
              <Button asChild>
                <Link href={`/forest/operational-plans/${id}/edit`}>Edit</Link>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valid From</p>
                  <p>{data.valid_from}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valid To</p>
                  <p>{data.valid_to}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved Harvest Limit (m³)</p>
                  <p className="text-2xl font-bold">{parseFloat(data.approved_harvest_limit).toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p>{new Date(data.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p>{new Date(data.updated_at).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {data.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{data.description}</p>
              </CardContent>
            </Card>
          )}

          <Button asChild variant="outline">
            <Link href="/forest/operational-plans">← Back</Link>
          </Button>
        </div>
      </AuthGuard>
    </AppLayout>
  );
}

export default OperationalPlanDetail;
