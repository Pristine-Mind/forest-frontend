"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { use, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { useRouter } from "@/i18n/routing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetBankAccount,
  useUpdateBankAccount,
  useDeleteBankAccount,
  useListUsers,
} from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
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

function BankAccountDetail({ id }: { id: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { can } = useAuthStore();
  const canWrite = can(WRITE_ROLES);

  const { data: account, isLoading } = useGetBankAccount(id);
  const updateAccount = useUpdateBankAccount();
  const deleteAccount = useDeleteBankAccount();
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

  useEffect(() => {
    if (account) {
      form.reset({
        bank_name: account.bank_name,
        account_number: account.account_number,
        min_signatures_required: String(account.min_signatures_required),
        signatories: account.signatories ?? [],
      });
    }
  }, [account, form]);

  if (isLoading) return <div>Loading...</div>;
  if (!account) return <div>Bank account not found.</div>;

  function onSubmit(values: FormValues) {
    updateAccount.mutate(
      {
        id,
        data: {
          bank_name: values.bank_name,
          account_number: values.account_number,
          min_signatures_required: Number(values.min_signatures_required),
          signatories: values.signatories,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Bank account updated" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/fund/bank-accounts/"] });
          queryClient.invalidateQueries({ queryKey: [`/api/v1/fund/bank-accounts/${id}/`] });
        },
        onError: () => {
          toast({ title: "Failed to update bank account", variant: "destructive" });
        },
      }
    );
  }

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this bank account?")) return;
    deleteAccount.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Bank account deleted" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/fund/bank-accounts/"] });
          router.push("/fund/bank-accounts");
        },
        onError: () => {
          toast({ title: "Failed to delete bank account", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{account.bank_name}</h1>
          <p className="text-muted-foreground mt-2">Account {account.account_number}</p>
        </div>
        <Button variant="outline" asChild><Link href="/fund/bank-accounts">Back to Accounts</Link></Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
        <CardContent>
          {canWrite ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="bank_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
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
                      <FormControl><Input {...field} /></FormControl>
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
                                        field.onChange(value.filter((uid) => uid !== u.id));
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
                  <Button type="submit" disabled={updateAccount.isPending}>
                    {updateAccount.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteAccount.isPending}>
                    {deleteAccount.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bank Name</p>
                <p>{account.bank_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                <p>{account.account_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Minimum Signatures</p>
                <p>{account.min_signatures_required}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Signatories</p>
                <p>{account.signatories?.length ?? 0}</p>
              </div>
            </div>
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
        <BankAccountDetail id={Number(id)} />
      </AppLayout>
    </AuthGuard>
  );
}
