"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "@/i18n/routing";
import { useListFundAllocationRules } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function AllocationRulesList() {
  const { can } = useAuthStore();
  const { data, isLoading } = useListFundAllocationRules();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Allocation Rules</h1>
          <p className="text-muted-foreground mt-2">Configure fund allocation percentages.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/fund">Back to Fund</Link></Button>
          {can(WRITE_ROLES) && <Button asChild><Link href="/fund/allocation-rules/new">Add Rule</Link></Button>}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? <div>Loading...</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Effective From</TableHead>
                  <TableHead className="text-right">Forest Dev Min %</TableHead>
                  <TableHead className="text-right">Poor Targeted Min %</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.results.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{formatDate(r.effective_from)}</TableCell>
                    <TableCell className="text-right font-mono">{r.forest_dev_min_percent}%</TableCell>
                    <TableCell className="text-right font-mono">{r.poor_targeted_min_percent}%</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild><Link href={`/fund/allocation-rules/${r.id}`}>View / Edit</Link></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.results || data.results.length === 0) && (
                  <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No allocation rules found.</TableCell></TableRow>
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
  return <AuthGuard><AppLayout><AllocationRulesList /></AppLayout></AuthGuard>;
}
