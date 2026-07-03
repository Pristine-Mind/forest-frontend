"use client";

import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "@/i18n/routing";
import { useListOperationalPlans } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

/**
 * Operational Plans List Page
 */
function OperationalPlansList() {
  const tCommon = useTranslations("common");
  const { can } = useAuthStore();
  const { toast } = useToast();

  const { data, isLoading, isError, error } = useListOperationalPlans();
  
  if (isError) {
    toast({
      title: "Error",
      description: error?.message || "Failed to load operational plans",
      variant: "destructive",
    });
  }

  return (
    <AppLayout>
      <AuthGuard>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Operational Plans</h1>
              <p className="text-muted-foreground mt-2">Manage forest operational plans</p>
            </div>
            {can(WRITE_ROLES) && (
              <Button asChild>
                <Link href="/forest/operational-plans/new">New Plan</Link>
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Plans</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>{tCommon("loading")}</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Valid From</TableHead>
                        <TableHead>Valid To</TableHead>
                        <TableHead className="text-right">Harvest Limit (m³)</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.results?.map((plan: any) => (
                        <TableRow key={plan.id}>
                          <TableCell>{plan.valid_from}</TableCell>
                          <TableCell>{plan.valid_to}</TableCell>
                          <TableCell className="text-right">{parseFloat(plan.approved_harvest_limit).toFixed(2)}</TableCell>
                          <TableCell>{plan.description}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/forest/operational-plans/${plan.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!data?.results || data.results.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            No operational plans found.
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

export default OperationalPlansList;
