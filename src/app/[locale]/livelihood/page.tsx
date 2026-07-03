"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";

export default function Page() {
  const { can } = useAuthStore();
  const canWrite = can(WRITE_ROLES);

  return (
    <AuthGuard>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Livelihood Programs</h1>
            <p className="text-muted-foreground mt-2">
              Manage revolving fund loans and livelihood support programs for households.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revolving Loans</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Track loans issued to households, repayment progress, and loan status.
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link href="/livelihood/revolving-loans">View Loans</Link>
                  </Button>
                  {canWrite && (
                    <Button asChild>
                      <Link href="/livelihood/revolving-loans/new">Issue Loan</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
