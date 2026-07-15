"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  useListBankTransactions,
  useCreateBankTransaction,
  useUpdateBankTransaction,
  useDeleteBankTransaction,
  getListBankTransactionsQueryKey,
  useListBankAccounts,
  type BankTransaction,
} from "@/lib/api";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Landmark,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
} from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";


const transactionSchema = z.object({
  account: z.coerce.number().min(1, "Bank account is required"),
  transaction_date: z.string().min(1, "Transaction date is required"),
  transaction_type: z.enum(["deposit", "withdrawal"], {
    required_error: "Transaction type is required",
  }),
  amount: z.coerce.number().gt(0, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  requires_committee_approval: z.boolean().default(false),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

function TransactionForm({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues?: Partial<TransactionFormValues>;
  onSubmit: (data: TransactionFormValues) => void;
  isPending: boolean;
}) {
  const { data: accountsData } = useListBankAccounts();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      account: defaultValues?.account ?? 0,
      transaction_date: defaultValues?.transaction_date ?? new Date().toISOString().slice(0, 10),
      transaction_type: defaultValues?.transaction_type ?? "deposit",
      amount: defaultValues?.amount ?? undefined,
      description: defaultValues?.description ?? "",
      requires_committee_approval: defaultValues?.requires_committee_approval ?? false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="account"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Account</FormLabel>
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(v) => field.onChange(Number(v))}
              >
                <FormControl>
                  <SelectTrigger data-testid="select-transaction-account">
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accountsData?.results.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.bank_name} — {a.account_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="transaction_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger data-testid="select-transaction-type">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (Rs.)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  data-testid="input-transaction-amount"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="transaction_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Date</FormLabel>
              <FormControl>
                <Input {...field} type="date" data-testid="input-transaction-date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Purpose of this transaction..."
                  rows={3}
                  data-testid="input-transaction-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="requires_committee_approval"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="checkbox-requires-approval"
                />
              </FormControl>
              <FormLabel className="!mt-0 cursor-pointer">
                Requires committee approval
              </FormLabel>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isPending}
          className="w-full"
          data-testid="button-save-transaction"
        >
          {isPending ? "Saving..." : "Save Transaction"}
        </Button>
      </form>
    </Form>
  );
}


function TransactionViewDialog({ transaction }: { transaction: BankTransaction }) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Transaction Details</DialogTitle>
      </DialogHeader>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between border-b pb-2">
          <span className="text-muted-foreground">Bank Account</span>
          <span className="font-medium">{(transaction as any).account_display ?? transaction.account}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-muted-foreground">Type</span>
          <Badge variant={transaction.transaction_type === "deposit" ? "default" : "secondary"} className="capitalize">
            {transaction.transaction_type ?? "—"}
          </Badge>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-mono font-medium">Rs. {transaction.amount}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-muted-foreground">Date</span>
          <span>{transaction.transaction_date}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-muted-foreground">Committee Approval</span>
          <span>{transaction.requires_committee_approval ? "Required" : "Not required"}</span>
        </div>
        <div className="border-b pb-2">
          <span className="text-muted-foreground block mb-1">Description</span>
          <p>{transaction.description}</p>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Recorded</span>
          <span className="text-xs">{transaction.created_at?.slice(0, 10)}</span>
        </div>
      </div>
    </DialogContent>
  );
}


function BankTransactionsContent() {
  const { can } = useAuthStore();
  const canWrite = can(WRITE_ROLES);

  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<BankTransaction | null>(null);
  const [viewItem, setViewItem] = useState<BankTransaction | null>(null);
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data, isLoading } = useListBankTransactions(
    dateFilter ? { transaction_date: dateFilter } : undefined,
  );
  const { data: accountsData } = useListBankAccounts();

  const createMutation = useCreateBankTransaction();
  const updateMutation = useUpdateBankTransaction();
  const deleteMutation = useDeleteBankTransaction();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListBankTransactionsQueryKey() });

  const accountNameById = useMemo(() => {
    const map = new Map<number, string>();
    accountsData?.results.forEach((a) => map.set(a.id, `${a.bank_name} (${a.account_number})`));
    return map;
  }, [accountsData]);

  const filteredResults = useMemo(() => {
    const results = data?.results ?? [];
    if (typeFilter === "all") return results;
    return results.filter((t) => t.transaction_type === typeFilter);
  }, [data, typeFilter]);

  const totals = useMemo(() => {
    return filteredResults.reduce(
      (acc, t) => {
        if (t.transaction_type === "deposit") acc.deposits += t.amount;
        else if (t.transaction_type === "withdrawal") acc.withdrawals += t.amount;
        return acc;
      },
      { deposits: 0, withdrawals: 0 },
    );
  }, [filteredResults]);

  const handleCreate = (values: TransactionFormValues) => {
    createMutation.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast.success("Transaction recorded");
          setCreateOpen(false);
          invalidate();
        },
        onError: () => toast.error("Failed to record transaction"),
      },
    );
  };

  const handleUpdate = (values: TransactionFormValues) => {
    if (!editItem) return;
    updateMutation.mutate(
      { id: editItem.id, data: values },
      {
        onSuccess: () => {
          toast.success("Transaction updated");
          setEditItem(null);
          invalidate();
        },
        onError: () => toast.error("Failed to update transaction"),
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Transaction deleted");
          invalidate();
        },
        onError: () => toast.error("Failed to delete transaction"),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Landmark className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Record and review deposits and withdrawals across registered CFUG bank accounts.
          </p>
        </div>
      </div>

      {/* {!canWrite && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You have read-only access. Contact a committee officer to record or edit transactions.
        </div>
      )} */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Deposits</p>
              <p className="text-2xl font-bold font-mono">Rs. {totals.deposits.toLocaleString()}</p>
            </div>
            <ArrowDownCircle className="h-8 w-8 text-emerald-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Withdrawals</p>
              <p className="text-2xl font-bold font-mono">Rs. {totals.withdrawals.toLocaleString()}</p>
            </div>
            <ArrowUpCircle className="h-8 w-8 text-rose-500" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>All recorded deposits and withdrawals.</CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-40"
              data-testid="input-filter-date"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36" data-testid="select-filter-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
              </SelectContent>
            </Select>
            {canWrite && (
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-add-transaction">
                    <Plus className="h-4 w-4 mr-1" /> New Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Bank Transaction</DialogTitle>
                  </DialogHeader>
                  <TransactionForm onSubmit={handleCreate} isPending={createMutation.isPending} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Bank Account</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredResults.map((t) => (
                    <TableRow key={t.id} data-testid={`row-transaction-${t.id}`}>
                      <TableCell className="whitespace-nowrap">{t.transaction_date}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {accountNameById.get(t.account) ?? `#${t.account}`}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={t.transaction_type === "deposit" ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {t.transaction_type ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">Rs. {t.amount}</TableCell>
                      <TableCell className="max-w-[240px] truncate">{t.description}</TableCell>
                      <TableCell>
                        {t.requires_committee_approval ? (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Required
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog
                            open={viewItem?.id === t.id}
                            onOpenChange={(open) => !open && setViewItem(null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewItem(t)}
                                data-testid={`button-view-transaction-${t.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            {viewItem?.id === t.id && <TransactionViewDialog transaction={t} />}
                          </Dialog>

                          {canWrite && (
                            <>
                              <Dialog
                                open={editItem?.id === t.id}
                                onOpenChange={(open) => !open && setEditItem(null)}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditItem(t)}
                                    data-testid={`button-edit-transaction-${t.id}`}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Transaction</DialogTitle>
                                  </DialogHeader>
                                  <TransactionForm
                                    defaultValues={t}
                                    onSubmit={handleUpdate}
                                    isPending={updateMutation.isPending}
                                  />
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    data-testid={`button-delete-transaction-${t.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently remove the{" "}
                                      <strong className="capitalize">{t.transaction_type}</strong> of{" "}
                                      <strong>Rs. {t.amount}</strong> dated{" "}
                                      <strong>{t.transaction_date}</strong>.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(t.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <AppLayout>
        <BankTransactionsContent />
      </AppLayout>
    </AuthGuard>
  );
}
