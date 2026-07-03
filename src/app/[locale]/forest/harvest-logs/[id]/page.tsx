"use client";

import { use, useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { useToast } from "@/hooks/use-toast";

/**
 * Harvest Log Detail Page
 */
function HarvestLogDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { can } = useAuthStore();
  const { toast } = useToast();

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8005";
        const response = await fetch(`${apiBaseUrl}/api/v1/forest/harvest-logs/${id}/`, {
          headers: {
            "Authorization": `Token ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch harvest log");
        const result = await response.json();
        setData(result);
        setIsError(false);
      } catch (err: any) {
        setError(err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    if (id && token) fetchData();
  }, [id, token]);
  
  if (isError) {
    toast({
      title: "Error",
      description: error?.message || "Failed to load harvest log",
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
              <h1 className="text-3xl font-bold tracking-tight">Harvest Log #{id}</h1>
            </div>
            {can(WRITE_ROLES) && (
              <Button asChild>
                <Link href={`/forest/harvest-logs/${id}/edit`}>Edit</Link>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tree Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Species</p>
                  <p>{data.tree_details?.species}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Block</p>
                  <p>{data.tree_details?.block}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Plot</p>
                  <p>{data.tree_details?.plot}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tree Number</p>
                  <p>{data.tree_details?.tree_number}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Harvest Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Harvest Date</p>
                  <p>{data.harvest_date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quantity (m³)</p>
                  <p className="text-2xl font-bold">{parseFloat(data.harvest_quantity_cubic_m).toFixed(3)}</p>
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
            <Link href="/forest/harvest-logs">← Back</Link>
          </Button>
        </div>
      </AuthGuard>
    </AppLayout>
  );
}

export default HarvestLogDetail;
