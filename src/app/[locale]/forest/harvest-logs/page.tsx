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
 * Harvest Logs List Page
 */
function HarvestLogsList() {
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
        const response = await fetch(`${apiBaseUrl}/api/v1/forest/harvest-logs/`, {
          headers: {
            "Authorization": `Token ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch harvest logs");
        const result = await response.json();
        setData(result);
        setIsError(false);
      } catch (err: any) {
        setError(err);
        setIsError(true);
        toast({
          title: "Error",
          description: err?.message || "Failed to load harvest logs",
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
      description: error?.message || "Failed to load harvest logs",
      variant: "destructive",
    });
  }

  return (
    <AppLayout>
      <AuthGuard>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Harvest Logs</h1>
              <p className="text-muted-foreground mt-2">Track all harvested trees and volumes</p>
            </div>
            {can(WRITE_ROLES) && (
              <Button asChild>
                <Link href="/forest/harvest-logs/new">Add Log</Link>
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>{tCommon("loading")}</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tree Record</TableHead>
                        <TableHead>Species</TableHead>
                        <TableHead>Block</TableHead>
                        <TableHead>Harvest Date</TableHead>
                        <TableHead className="text-right">Quantity (m³)</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.results?.map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.tree_record}</TableCell>
                          <TableCell>{log.tree_details?.species}</TableCell>
                          <TableCell>{log.tree_details?.block}</TableCell>
                          <TableCell>{log.harvest_date}</TableCell>
                          <TableCell className="text-right">
                            {parseFloat(log.harvest_quantity_cubic_m).toFixed(3)}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/forest/harvest-logs/${log.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!data?.results || data.results.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                            No harvest logs found.
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

export default HarvestLogsList;
