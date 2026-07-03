"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { use } from "react";
import { Link } from "@/i18n/routing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetStockLedger,
  useListStockTransactions,
  useRecordStockAdjustment,
} from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const movementSchema = z.object({
  transaction_type: z.enum(["in", "out"]),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  note: z.string().min(1, "Note is required for the audit trail"),
});

type MovementValues = z.infer<typeof movementSchema>;

function formatDate(value?: string | null) {
  if (!value) return "N/A";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleString();
}

function StockLedgerDetail({ id }: { id: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { can } = useAuthStore();
  const canWrite = can(WRITE_ROLES);

  const { data: stock, isLoading: isStockLoading } = useGetStockLedger(id);
  const { data: transactions, isLoading: isTransactionsLoading } =
    useListStockTransactions({ stock: id });
  const recordAdjustment = useRecordStockAdjustment();

  const form = useForm<MovementValues>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      transaction_type: "in",
      quantity: 0,
      note: "",
    },
  });

  if (isStockLoading) return <div>Loading...</div>;
  if (!stock) return <div>Stock entry not found.</div>;

  function invalidateRelated() {
    queryClient.invalidateQueries({
      queryKey: ["/api/v1/inventory/stock-transactions/"],
    });
    queryClient.invalidateQueries({
      queryKey: [`/api/v1/inventory/ledgers/${id}/`],
    });
  }

  function onSubmit(values: MovementValues) {
    recordAdjustment.mutate(
      {
        data: {
          stock: id,
          transaction_type: values.transaction_type,
          quantity: String(values.quantity),
          note: values.note,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Stock movement recorded" });
          invalidateRelated();
          form.reset({ transaction_type: "in", quantity: 0, note: "" });
        },
        onError: () =>
          toast({
            title: "Failed to record stock movement",
            variant: "destructive",
          }),
      }
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {stock.species_name}
          </h1>
          <p className="text-muted-foreground mt-2">Grade {stock.grade}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/inventory">Back to Inventory</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold font-mono">
            {stock.quantity_available}
          </p>
          <p className="text-sm text-muted-foreground mt-1">units available</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {isTransactionsLoading ? (
            <p>Loading transactions...</p>
          ) : transactions?.results.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.results.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="capitalize">
                      {txn.transaction_type}
                    </TableCell>
                    <TableCell>{txn.quantity}</TableCell>
                    <TableCell>
                      {txn.reference_type
                        ? `${txn.reference_type} #${txn.reference_id ?? "-"}`
                        : "Manual"}
                    </TableCell>
                    <TableCell>{txn.note ?? "-"}</TableCell>
                    <TableCell>{formatDate(txn.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              No stock movements recorded yet.
            </p>
          )}
        </CardContent>
      </Card>

      {canWrite && (
        <Card>
          <CardHeader>
            <CardTitle>Record Stock Movement</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <FormField
                  control={form.control}
                  name="transaction_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="in">In</SelectItem>
                          <SelectItem value="out">Out</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Note</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Reason for this stock movement"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2">
                  <Button type="submit" disabled={recordAdjustment.isPending}>
                    {recordAdjustment.isPending
                      ? "Recording..."
                      : "Record Movement"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AuthGuard>
      <AppLayout>
        <StockLedgerDetail id={Number(id)} />
      </AppLayout>
    </AuthGuard>
  );
}
