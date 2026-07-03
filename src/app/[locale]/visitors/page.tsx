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
            <h1 className="text-3xl font-bold tracking-tight">Visitors</h1>
            <p className="text-muted-foreground mt-2">
              Log visitor entries and track official guest visits to the community forest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Visitor Entries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Record general visits and study/research visits, including visitor counts,
                  days stayed, fees collected, and fee waivers.
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link href="/visitors/entries">View Entries</Link>
                  </Button>
                  {canWrite && (
                    <Button asChild>
                      <Link href="/visitors/entries/new">Log Visitor</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Official Guests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Track visits by government officials, VIPs, and other distinguished guests,
                  including designation, visit dates, and guidance provided.
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link href="/visitors/official-guests">View Guests</Link>
                  </Button>
                  {canWrite && (
                    <Button asChild>
                      <Link href="/visitors/official-guests/new">Add Guest</Link>
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
