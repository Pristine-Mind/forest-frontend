"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListPriceRates } from "@/lib/api";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";

function formatDate(value?: string | null) {
  if (!value) return "N/A";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

function PriceRateList() {
  const { data, isLoading } = useListPriceRates({ limit: 100 });
  const { can } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Price Rates</h1>
          <p className="text-muted-foreground mt-2">Standard rates by species, grade, and buyer type.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/inventory">Back to Inventory</Link></Button>
          {can(WRITE_ROLES) && <Button asChild><Link href="/inventory/price-rates/new">Add Rate</Link></Button>}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? <div>Loading...</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Species</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Buyer Type</TableHead>
                  <TableHead className="text-right">Rate / Unit</TableHead>
                  <TableHead>Effective From</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.results.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.species_name}</TableCell>
                    <TableCell>{r.grade}</TableCell>
                    <TableCell className="capitalize">{r.buyer_type}</TableCell>
                    <TableCell className="text-right font-mono">{r.rate_per_unit}</TableCell>
                    <TableCell>{formatDate(r.effective_from)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild><Link href={`/inventory/price-rates/${r.id}`}>Edit</Link></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.results || data.results.length === 0) && (
                  <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No price rates found.</TableCell></TableRow>
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
  return <AuthGuard><AppLayout><PriceRateList /></AppLayout></AuthGuard>;
}
