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
 * Wildlife Species Detail Page
 */
function WildlifeSpeciesDetail({
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
        const response = await fetch(`${apiBaseUrl}/api/v1/forest/wildlife-species/${id}/`, {
          headers: {
            "Authorization": `Token ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch wildlife species");
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
      description: error?.message || "Failed to load wildlife species",
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
            </div>
            {can(WRITE_ROLES) && (
              <Button asChild>
                <Link href={`/forest/wildlife-species/${id}/edit`}>Edit</Link>
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scientific Name</p>
                <p>{data.scientific_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Local Name</p>
                <p>{data.local_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p>{new Date(data.created_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Button asChild variant="outline">
            <Link href="/forest/wildlife-species">← Back</Link>
          </Button>
        </div>
      </AuthGuard>
    </AppLayout>
  );
}

export default WildlifeSpeciesDetail;
