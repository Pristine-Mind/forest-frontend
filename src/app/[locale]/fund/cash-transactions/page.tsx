"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/auth-store";
import {
  useListCashTransactions,
  useCreateCashTransaction,
  useSubmitCashTransaction,
  useApproveCashTransaction,
  useRejectCashTransaction,
  useDeleteCashTransaction,
} from "@/hooks/use-cash-transactions";
import { handle403Error } from "@/lib/error-handler";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Send, CheckCircle2, XCircle, Trash2, Eye } from "lucide-react";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  payment_type: z.string().min(1, "Payment type is required"),
  source_or_purpose: z.string().min(1, "Description is required"),
  amount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be greater than 0"),
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
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultValues?.type ?? "expense",
      payment_type: defaultValues?.payment_type ?? "cash",
      source_or_purpose: defaultValues?.source_or_purpose ?? "",
      amount: defaultValues?.amount ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="source_or_purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description / Purpose</FormLabel>
              <FormControl>
                <Textarea placeholder="What is this transaction for?" rows={3} {...field} />
              </FormControl>
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
                <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Saving..." : "Save as Draft"}
        </Button>
      </form>
    </Form>
  );
}

function CashTransactionsContent() {
  const { can } = useAuthStore();
  const isChair = can(["committee_chair"]);
  const canCreate = can(["committee_chair", "secretary", "staff"]);
  const canSubmit = can(["secretary", "staff"]);

  const [createOpen, setCreateOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: transactionsData, isLoading } = useListCashTransactions(
    statusFilter !== "all" ? { approval_status: statusFilter } : undefined
  );

  const createMutation = useCreateCashTransaction();
  const submitMutation = useSubmitCashTransaction();
  const approveMutation = useApproveCashTransaction();
  const rejectMutation = useRejectCashTransaction();
  const deleteMutation = useDeleteCashTransaction();

  const transactions = transactionsData?.results ?? [];

  const handleCreate = (values: TransactionFormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Transaction saved as draft");
        setCreateOpen(false);
      },
      onError: (error) => {
        const msg = handle403Error(error, "/api/fund/cash-transactions", "POST");
        toast.error(msg);
      },
    });
  };

  const handleSubmit = (id: number) => {
    submitMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Transaction submitted for approval");
      },
      onError: (error) => {
        const msg = handle403Error(error, "/api/v1/fund/cash-transactions/{id}/submit_for_approval", "POST");
        toast.error(msg);
      },
    });
  };

  const handleApprove = (id: number) => {
    approveMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Transaction approved");
      },
      onError: (error) => {
        const msg = handle403Error(error, "/api/v1/fund/cash-transactions/{id}/approve", "POST");
        toast.error(msg);
      },
    });
  };

  const handleReject = (id: number) => {
    if (!rejectReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    rejectMutation.mutate(
      { id, rejection_reason: rejectReason },
      {
        onSuccess: () => {
          toast.success("Transaction rejected");
          setRejectOpen(null);
          setRejectReason("");
        },
        onError: (error) => {
          const msg = handle403Error(error, "/api/v1/fund/cash-transactions/{id}/reject", "POST");
          toast.error(msg);
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Transaction deleted");
      },
      onError: (error) => {
        const msg = handle403Error(error, "/api/v1/fund/cash-transactions/{id}", "DELETE");
        toast.error(msg);
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: "secondary",
      submitted: "default",
      approved: "default",
      rejected: "destructive",
    };
    const labels: Record<string, string> = {
      draft: "Draft",
      submitted: "Pending Approval",
      approved: "Approved",
      rejected: "Rejected",
    };
    return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cash Transactions</h1>
        <p className="text-muted-foreground mt-2">
          Record cash transactions and manage approvals.
        </p>
      </div>

      {isChair && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <strong>Chair Actions:</strong> You can approve or reject transactions submitted by staff.
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>All cash transactions and approval requests.</CardDescription>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
                <SelectItem value="submitted">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {canCreate && (
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" /> New Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Cash Transaction</DialogTitle>
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
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-sm">
                          {t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="capitalize text-sm">{t.type}</TableCell>
                        <TableCell className="max-w-xs truncate text-sm">{t.source_or_purpose}</TableCell>
                        <TableCell className="font-mono text-sm">Rs. {Number(t.amount).toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(t.approval_status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* View */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Transaction Details</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Type</p>
                                      <p className="capitalize">{t.type}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Amount</p>
                                      <p className="font-mono">Rs. {Number(t.amount).toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                                      <p>{getStatusBadge(t.approval_status)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Payment Type</p>
                                      <p className="capitalize">{t.payment_type}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                                    <p>{t.source_or_purpose}</p>
                                  </div>
                                  {t.submitted_by_name && (
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Submitted By</p>
                                      <p>{t.submitted_by_name}</p>
                                    </div>
                                  )}
                                  {t.approved_by_name && (
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Approved By</p>
                                      <p>{t.approved_by_name}</p>
                                    </div>
                                  )}
                                  {t.rejection_reason && (
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Rejection Reason</p>
                                      <p className="text-destructive">{t.rejection_reason}</p>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* Submit for Approval - Only for Draft status */}
                            {canSubmit && t.approval_status === "draft" && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleSubmit(t.id)}
                                title="Submit for Approval"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}

                            {/* Approve - Only for Chair and Submitted status */}
                            {isChair && t.approval_status === "submitted" && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleApprove(t.id)}
                                title="Approve"
                                className="text-green-600 hover:text-green-600"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}

                            {/* Reject - Only for Chair and Submitted status */}
                            {isChair && t.approval_status === "submitted" && (
                              <AlertDialog open={rejectOpen === t.id} onOpenChange={(open) => !open && setRejectOpen(null)}>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setRejectOpen(t.id)}
                                    title="Reject"
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reject Transaction</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Please provide a reason for rejecting this transaction.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <Textarea
                                    placeholder="Rejection reason..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    rows={3}
                                  />
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setRejectReason("")}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleReject(t.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Reject
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}

                            {/* Delete - Only for Draft status */}
                            {t.approval_status === "draft" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete this transaction. This action cannot be undone.
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
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
        <CashTransactionsContent />
      </AppLayout>
    </AuthGuard>
  );
}
