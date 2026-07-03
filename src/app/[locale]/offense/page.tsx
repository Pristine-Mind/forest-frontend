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
            <h1 className="text-3xl font-bold tracking-tight">Offense Tracking</h1>
            <p className="text-muted-foreground mt-2">
              Record offense reports, manage resolutions, and log patrol activity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Offense Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Track forest violations, damages, fines, and case resolutions.
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link href="/offense/reports">View Reports</Link>
                  </Button>
                  {canWrite && (
                    <Button asChild>
                      <Link href="/offense/reports/new">File Report</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Patrol Logs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Log patrol rounds by community watchers and link observations to offenses.
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link href="/offense/patrol-logs">View Logs</Link>
                  </Button>
                  {canWrite && (
                    <Button asChild>
                      <Link href="/offense/patrol-logs/new">Log Patrol</Link>
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
