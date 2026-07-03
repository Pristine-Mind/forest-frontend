"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListStockLedgers, useListSales } from "@/lib/api";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";

function Inventory() {
  const { data: stock, isLoading: isStockLoading } = useListStockLedgers();
  const { data: sales, isLoading: isSalesLoading } = useListSales({ limit: 5 });
  const { can } = useAuthStore();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory & Sales</h1>
        <p className="text-muted-foreground mt-2">Manage forest product inventory and recent sales.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Current Stock</CardTitle>
            {can(WRITE_ROLES) && <Button size="sm" asChild><Link href="/inventory/ledgers/new">Add Stock Entry</Link></Button>}
          </CardHeader>
          <CardContent>
            {isStockLoading ? <div>Loading...</div> : (
              <Table>
                <TableHeader><TableRow><TableHead>Species</TableHead><TableHead>Grade</TableHead><TableHead className="text-right">Available Qty</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {stock?.results.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.species_name}</TableCell>
                      <TableCell>{s.grade}</TableCell>
                      <TableCell className="text-right font-mono">{s.quantity_available}</TableCell>
                      <TableCell><Button variant="outline" size="sm" asChild><Link href={`/inventory/ledgers/${s.id}`}>View</Link></Button></TableCell>
                    </TableRow>
                  ))}
                  {(!stock?.results || stock.results.length === 0) && <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Inventory is empty.</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Sales</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild><Link href="/inventory/sales">View All</Link></Button>
              {can(WRITE_ROLES) && <Button size="sm" asChild><Link href="/inventory/sales/new">Record Sale</Link></Button>}
            </div>
          </CardHeader>
          <CardContent>
            {isSalesLoading ? <div>Loading...</div> : (
              <Table>
                <TableHeader><TableRow><TableHead>Buyer</TableHead><TableHead>Species</TableHead><TableHead>Qty</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {sales?.results.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>{s.buyer_name}</TableCell>
                      <TableCell>{s.species_name}</TableCell>
                      <TableCell>{s.quantity}</TableCell>
                      <TableCell className="text-right">{s.total_amount}</TableCell>
                      <TableCell><Button variant="outline" size="sm" asChild><Link href={`/inventory/sales/${s.id}`}>View</Link></Button></TableCell>
                    </TableRow>
                  ))}
                  {(!sales?.results || sales.results.length === 0) && <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No recent sales.</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Price Rates</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild><Link href="/inventory/price-rates">View All</Link></Button>
            {can(WRITE_ROLES) && <Button size="sm" asChild><Link href="/inventory/price-rates/new">Add Rate</Link></Button>}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Standard rates by species, grade, and buyer type — used to auto-fill sale prices.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><Inventory /></AppLayout></AuthGuard>;
}
