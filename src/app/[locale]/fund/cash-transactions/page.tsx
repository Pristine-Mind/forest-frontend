"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useListCashTransactions } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";

const TYPE_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  income: "default",
  expense: "destructive",
};

function CashTransactionsList() {
  const { can } = useAuthStore();
  const [type, setType] = useState("all");

  const { data, isLoading } = useListCashTransactions({
    type: type !== "all" ? type : undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cash Transactions</h1>
          <p className="text-muted-foreground mt-2">Track fund income and expenses.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/fund">Back to Fund</Link></Button>
          {can(WRITE_ROLES) && <Button asChild><Link href="/fund/cash-transactions/new">Record Transaction</Link></Button>}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? <div>Loading...</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source / Purpose</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.results.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>#{t.id}</TableCell>
                    <TableCell>
                      <Badge variant={TYPE_VARIANT[t.type] ?? "secondary"} className="capitalize">
                        {t.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.source_or_purpose}</TableCell>
                    <TableCell className="text-right font-mono">{t.amount}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild><Link href={`/fund/cash-transactions/${t.id}`}>View</Link></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.results || data.results.length === 0) && (
                  <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No transactions found.</TableCell></TableRow>
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
  return <AuthGuard><AppLayout><CashTransactionsList /></AppLayout></AuthGuard>;
}
