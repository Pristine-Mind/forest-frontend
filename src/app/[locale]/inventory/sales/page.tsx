"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useListSales } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  paid: "default",
  due: "destructive",
  partial: "secondary",
};

function SalesList() {
  const [buyerType, setBuyerType] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [search, setSearch] = useState("");
  const { can } = useAuthStore();

  const { data, isLoading } = useListSales({
    buyer_type: buyerType !== "all" ? buyerType : undefined,
    payment_status: paymentStatus !== "all" ? paymentStatus : undefined,
    search: search || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground mt-2">All recorded forest product sales.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/inventory">Back to Inventory</Link></Button>
          {can(WRITE_ROLES) && <Button asChild><Link href="/inventory/sales/new">Record Sale</Link></Button>}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search by buyer or member..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={buyerType} onValueChange={setBuyerType}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Buyer Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buyers</SelectItem>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="outsider">Outsider</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentStatus} onValueChange={setPaymentStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Payment Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="due">Due</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? <div>Loading...</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Species / Grade</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.results.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.buyer_name}</TableCell>
                    <TableCell>{s.species_name} — {s.grade}</TableCell>
                    <TableCell className="text-right">{s.quantity}</TableCell>
                    <TableCell className="text-right">{s.total_amount}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[s.payment_status] ?? "secondary"} className="capitalize">{s.payment_status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild><Link href={`/inventory/sales/${s.id}`}>View</Link></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.results || data.results.length === 0) && (
                  <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No sales found.</TableCell></TableRow>
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
  return <AuthGuard><AppLayout><SalesList /></AppLayout></AuthGuard>;
}
