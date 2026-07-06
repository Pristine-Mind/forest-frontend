"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
import { useCreateCashTransaction } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  source_or_purpose: z.string().min(1, "Source / purpose is required"),
  amount: z.string().min(1, "Amount is required").refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be a positive number"),
  payment_type: z.enum(["cash", "cheque", "digital_wallet"]).default("cash"),
  cheque_number: z.string().optional(),
  cheque_bank_name: z.string().optional(),
}).refine(
  (data) => {
    if (data.payment_type === "cheque") {
      return data.cheque_number && data.cheque_number.trim() !== "" && data.cheque_bank_name && data.cheque_bank_name.trim() !== "";
    }
    return true;
  },
  {
    message: "Cheque number and bank name are required for cheque payments",
    path: ["cheque_number"],
  }
);

type FormValues = z.infer<typeof formSchema>;

function RecordCashTransaction() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createTransaction = useCreateCashTransaction();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "income",
      source_or_purpose: "",
      amount: "",
      payment_type: "cash",
      cheque_number: "",
      cheque_bank_name: "",
    },
  });

  function onSubmit(values: FormValues) {
    createTransaction.mutate(
      {
        data: {
          type: values.type,
          source_or_purpose: values.source_or_purpose,
          amount: values.amount,
          payment_type: values.payment_type,
          cheque_number: values.payment_type === "cheque" ? values.cheque_number : undefined,
          cheque_bank_name: values.payment_type === "cheque" ? values.cheque_bank_name : undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Cash transaction recorded" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/fund/cash-transactions/"] });
          router.push("/fund/cash-transactions");
        },
        onError: () => {
          toast({ title: "Failed to record transaction", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Record Cash Transaction</h1>
        <p className="text-muted-foreground mt-2">Record a new income or expense transaction.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Transaction Details</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
                name="source_or_purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source / Purpose</FormLabel>
                    <FormControl><Input placeholder="e.g. Membership fees" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl><Input type="number" min={0.01} step="0.01" inputMode="decimal" {...field} /></FormControl>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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

              {form.watch("payment_type") === "cheque" && (
                <>
                  <FormField
                    control={form.control}
                    name="cheque_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cheque Number</FormLabel>
                        <FormControl><Input placeholder="e.g. CHQ-123456" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cheque_bank_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl><Input placeholder="e.g. ABC Bank" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={createTransaction.isPending}>
                  {createTransaction.isPending ? "Recording..." : "Record Transaction"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/fund/cash-transactions")}>Cancel</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><RecordCashTransaction /></AppLayout></AuthGuard>;
}
