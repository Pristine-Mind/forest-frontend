"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
import { useCreateBankAccount, useListUsers } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  bank_name: z.string().min(1, "Bank name is required"),
  account_number: z.string().min(1, "Account number is required"),
  min_signatures_required: z.string().min(1, "Required").refine((v) => !isNaN(Number(v)) && Number(v) >= 1, "Must be at least 1"),
  signatories: z.array(z.number()).min(1, "Select at least one signatory"),
});

type FormValues = z.infer<typeof formSchema>;

function AddBankAccount() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createAccount = useCreateBankAccount();
  const { data: users } = useListUsers({ limit: 200 });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bank_name: "",
      account_number: "",
      min_signatures_required: "1",
      signatories: [],
    },
  });

  function onSubmit(values: FormValues) {
    createAccount.mutate(
      {
        data: {
          bank_name: values.bank_name,
          account_number: values.account_number,
          min_signatures_required: Number(values.min_signatures_required),
          signatories: values.signatories,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Bank account added" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/fund/bank-accounts/"] });
          router.push("/fund/bank-accounts");
        },
        onError: () => {
          toast({ title: "Failed to add bank account", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Bank Account</h1>
        <p className="text-muted-foreground mt-2">Register a new bank account for the community fund.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl><Input placeholder="e.g. Nepal Bank Limited" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="account_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl><Input placeholder="e.g. 0123456789" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_signatures_required"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Signatures Required</FormLabel>
                    <FormControl><Input type="number" min={1} step={1} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="signatories"
                render={() => (
                  <FormItem>
                    <FormLabel>Signatories</FormLabel>
                    <div className="space-y-2 border rounded-md p-4">
                      {users?.results.map((u) => (
                        <FormField
                          key={u.id}
                          control={form.control}
                          name="signatories"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(u.id)}
                                  onCheckedChange={(checked) => {
                                    const value = field.value ?? [];
                                    if (checked) {
                                      field.onChange([...value, u.id]);
                                    } else {
                                      field.onChange(value.filter((id) => id !== u.id));
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {u.first_name || u.last_name ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() : u.email}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                      {(!users?.results || users.results.length === 0) && (
                        <p className="text-sm text-muted-foreground">No users available.</p>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={createAccount.isPending}>
                  {createAccount.isPending ? "Saving..." : "Add Account"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/fund/bank-accounts")}>Cancel</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><AddBankAccount /></AppLayout></AuthGuard>;
}
