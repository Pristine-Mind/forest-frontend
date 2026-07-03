"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "@/i18n/routing";
import { useToast } from "@/hooks/use-toast";

/**
 * Wildlife Species List Page
 */
function WildlifeSpeciesList() {
  const tCommon = useTranslations("common");
  const { can, token } = useAuthStore();
  const { toast } = useToast();
  const [data, setData] = useState<any>({ results: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8005";
        const response = await fetch(`${apiBaseUrl}/api/v1/forest/wildlife-species/`, {
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
        toast({
          title: "Error",
          description: err?.message || "Failed to load wildlife species",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token, toast]);

  return (
    <AppLayout>
      <AuthGuard>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Wildlife Species</h1>
              <p className="text-muted-foreground mt-2">Manage wildlife species found in the forest</p>
            </div>
            {can(WRITE_ROLES) && (
              <Button asChild>
                <Link href="/forest/wildlife-species/new">Add Wildlife Species</Link>
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Wildlife Species</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>{tCommon("loading")}</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Species Name</TableHead>
                      <TableHead>Scientific Name</TableHead>
                      <TableHead>Local Name</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.results?.map((species: any) => (
                      <TableRow key={species.id}>
                        <TableCell>{species.species_name}</TableCell>
                        <TableCell>{species.scientific_name}</TableCell>
                        <TableCell>{species.local_name}</TableCell>
                        <TableCell>{new Date(species.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/forest/wildlife-species/${species.id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!data?.results || data.results.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No wildlife species found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    </AppLayout>
  );
}

export default WildlifeSpeciesList;
