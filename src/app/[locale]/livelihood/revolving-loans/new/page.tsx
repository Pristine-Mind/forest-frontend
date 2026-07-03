"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
import { useCreateRevolvingLoan, useListHouseholds } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  household: z.string().min(1, "Household is required"),
  amount: z.string().min(1, "Amount is required").refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be a positive number"),
  issue_date: z.string().min(1, "Issue date is required"),
  repaid_amount: z.string().refine((v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0), "Must be 0 or greater"),
  status: z.enum(["active", "repaid", "defaulted"]),
});

type FormValues = z.infer<typeof formSchema>;

function IssueRevolvingLoan() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createLoan = useCreateRevolvingLoan();
  const { data: households } = useListHouseholds({ status: "active", limit: 200 });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      household: "",
      amount: "",
      issue_date: new Date().toISOString().split("T")[0],
      repaid_amount: "",
      status: "active",
    },
  });

  function onSubmit(values: FormValues) {
    createLoan.mutate(
      {
        data: {
          household: Number(values.household),
          amount: values.amount,
          issue_date: values.issue_date,
          repaid_amount: values.repaid_amount || undefined,
          status: values.status,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Revolving loan issued" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/livelihood/revolving-loans/"] });
          router.push("/livelihood/revolving-loans");
        },
        onError: () => {
          toast({ title: "Failed to issue loan", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Issue Revolving Loan</h1>
        <p className="text-muted-foreground mt-2">Issue a new revolving fund loan to a household.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Loan Details</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="household"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Household</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select household" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {households?.results.map((h) => (
                          <SelectItem key={h.id} value={String(h.id)}>{h.household_head_name}</SelectItem>
                        ))}
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
                    <FormLabel>Loan Amount</FormLabel>
                    <FormControl><Input type="number" min={0.01} step="0.01" inputMode="decimal" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issue_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="repaid_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repaid Amount (optional)</FormLabel>
                    <FormControl><Input type="number" min={0} step="0.01" inputMode="decimal" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="repaid">Repaid</SelectItem>
                        <SelectItem value="defaulted">Defaulted</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={createLoan.isPending}>
                  {createLoan.isPending ? "Issuing..." : "Issue Loan"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/livelihood/revolving-loans")}>Cancel</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><IssueRevolvingLoan /></AppLayout></AuthGuard>;
}
