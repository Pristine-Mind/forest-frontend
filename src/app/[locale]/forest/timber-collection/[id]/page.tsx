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
 * Timber Collection Detail Page
 */
function TimberCollectionDetail({
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
        const response = await fetch(`${apiBaseUrl}/api/v1/forest/timber-collection/${id}/`, {
          headers: {
            "Authorization": `Token ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch timber collection");
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
      description: error?.message || "Failed to load timber collection",
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
              <h1 className="text-3xl font-bold tracking-tight">{data.species_name}</h1>
              <p className="text-muted-foreground mt-2">Block: {data.block_name}</p>
            </div>
            {can(WRITE_ROLES) && (
              <Button asChild>
                <Link href={`/forest/timber-collection/${id}/edit`}>Edit</Link>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Collection Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Wood Volume (m³)</p>
                  <p className="text-2xl font-bold">{parseFloat(data.wood_volume).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Firewood Volume (m³)</p>
                  <p className="text-2xl font-bold">{parseFloat(data.firewood).toFixed(2)}</p>
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

          <Button asChild variant="outline">
            <Link href="/forest/timber-collection">← Back</Link>
          </Button>
        </div>
      </AuthGuard>
    </AppLayout>
  );
}

export default TimberCollectionDetail;
