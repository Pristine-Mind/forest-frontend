"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { use, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetRevolvingLoan, useUpdateRevolvingLoan } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  active: "default",
  repaid: "secondary",
  defaulted: "destructive",
};

const formSchema = z.object({
  repaid_amount: z.string().refine((v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0), "Must be 0 or greater"),
  status: z.enum(["active", "repaid", "defaulted"]),
});

type FormValues = z.infer<typeof formSchema>;

function RevolvingLoanDetail({ id }: { id: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { can } = useAuthStore();
  const canWrite = can(WRITE_ROLES);

  const { data: loan, isLoading } = useGetRevolvingLoan(id);
  const updateLoan = useUpdateRevolvingLoan();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repaid_amount: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (loan) {
      form.reset({
        repaid_amount: loan.repaid_amount ?? "",
        status: loan.status,
      });
    }
  }, [loan, form]);

  if (isLoading) return <div>Loading...</div>;
  if (!loan) return <div>Revolving loan not found.</div>;

  function onSubmit(values: FormValues) {
    updateLoan.mutate(
      {
        id,
        data: {
          repaid_amount: values.repaid_amount || undefined,
          status: values.status,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Revolving loan updated" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/livelihood/revolving-loans/"] });
          queryClient.invalidateQueries({ queryKey: [`/api/v1/livelihood/revolving-loans/${id}/`] });
        },
        onError: () => {
          toast({ title: "Failed to update loan", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loan #{loan.id}</h1>
          <p className="text-muted-foreground mt-2">{loan.household_name || "N/A"}</p>
        </div>
        <Button variant="outline" asChild><Link href="/livelihood/revolving-loans">Back to Loans</Link></Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Loan Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Household</p>
              <p>{loan.household_name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={STATUS_VARIANT[loan.status] ?? "secondary"} className="capitalize mt-1">{loan.status}</Badge>
            </div>
          </div>

          {canWrite && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-medium">Update Loan</h3>

                <FormField
                  control={form.control}
                  name="repaid_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repaid Amount</FormLabel>
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
                  <Button type="submit" disabled={updateLoan.isPending}>
                    {updateLoan.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AuthGuard>
      <AppLayout>
        <RevolvingLoanDetail id={Number(id)} />
      </AppLayout>
    </AuthGuard>
  );
}
