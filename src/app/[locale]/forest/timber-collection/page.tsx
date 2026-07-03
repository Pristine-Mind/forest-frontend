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
 * Timber Collection List Page
 */
function TimberCollectionList() {
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
        const response = await fetch(`${apiBaseUrl}/api/v1/forest/timber-collection/`, {
          headers: {
            "Authorization": `Token ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch timber collections");
        const result = await response.json();
        setData(result);
        setIsError(false);
      } catch (err: any) {
        setError(err);
        setIsError(true);
        toast({
          title: "Error",
          description: err?.message || "Failed to load timber collections",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token, toast]);
  
  if (isError) {
    toast({
      title: "Error",
      description: error?.message || "Failed to load timber collections",
      variant: "destructive",
    });
  }

  return (
    <AppLayout>
      <AuthGuard>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Timber Collection</h1>
              <p className="text-muted-foreground mt-2">Track timber collection by block and species</p>
            </div>
            {can(WRITE_ROLES) && (
              <Button asChild>
                <Link href="/forest/timber-collection/new">Add Collection</Link>
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Timber Collections</CardTitle>
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
                        <TableHead className="text-right">Wood Volume (m³)</TableHead>
                        <TableHead className="text-right">Firewood (m³)</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.results?.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.block_name}</TableCell>
                          <TableCell>{item.species_name}</TableCell>
                          <TableCell className="text-right">{parseFloat(item.wood_volume).toFixed(2)}</TableCell>
                          <TableCell className="text-right">{parseFloat(item.firewood).toFixed(2)}</TableCell>
                          <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/forest/timber-collection/${item.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!data?.results || data.results.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                            No timber collections found.
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

export default TimberCollectionList;
