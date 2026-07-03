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
            <h1 className="text-3xl font-bold tracking-tight">Fund Management</h1>
            <p className="text-muted-foreground mt-2">
              Track cash transactions, bank accounts, and fund allocation rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cash Transactions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Record income and expense transactions for the fund.
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link href="/fund/cash-transactions">View Transactions</Link>
                  </Button>
                  {canWrite && (
                    <Button asChild>
                      <Link href="/fund/cash-transactions/new">Record</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bank Accounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Manage community fund bank accounts and authorized signatories.
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link href="/fund/bank-accounts">View Accounts</Link>
                  </Button>
                  {canWrite && (
                    <Button asChild>
                      <Link href="/fund/bank-accounts/new">Add Account</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Allocation Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Configure minimum allocation percentages for forest development and poor-targeted programs.
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link href="/fund/allocation-rules">View Rules</Link>
                  </Button>
                  {canWrite && (
                    <Button asChild>
                      <Link href="/fund/allocation-rules/new">Add Rule</Link>
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
