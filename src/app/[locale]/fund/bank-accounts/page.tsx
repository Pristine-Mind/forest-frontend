"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "@/i18n/routing";
import { useListBankAccounts } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";

function BankAccountsList() {
  const { can } = useAuthStore();
  const { data, isLoading } = useListBankAccounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Accounts</h1>
          <p className="text-muted-foreground mt-2">Manage community fund bank accounts and signatories.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/fund">Back to Fund</Link></Button>
          {can(WRITE_ROLES) && <Button asChild><Link href="/fund/bank-accounts/new">Add Account</Link></Button>}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? <div>Loading...</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bank Name</TableHead>
                  <TableHead>Account Number</TableHead>
                  <TableHead className="text-right">Min Signatures</TableHead>
                  <TableHead className="text-right">Signatories</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.results.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.bank_name}</TableCell>
                    <TableCell className="font-mono">{a.account_number}</TableCell>
                    <TableCell className="text-right">{a.min_signatures_required}</TableCell>
                    <TableCell className="text-right">{a.signatories?.length ?? 0}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild><Link href={`/fund/bank-accounts/${a.id}`}>View / Edit</Link></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.results || data.results.length === 0) && (
                  <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No bank accounts found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><BankAccountsList /></AppLayout></AuthGuard>;
}
