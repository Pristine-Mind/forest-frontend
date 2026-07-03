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
  useGetFundAllocationRule,
  useUpdateFundAllocationRule,
  useDeleteFundAllocationRule,
} from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  forest_dev_min_percent: z.string().min(1, "Required").refine((v) => !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100, "Must be between 0 and 100"),
  poor_targeted_min_percent: z.string().min(1, "Required").refine((v) => !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100, "Must be between 0 and 100"),
  effective_from: z.string().min(1, "Effective date is required"),
});

type FormValues = z.infer<typeof formSchema>;

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

function AllocationRuleDetail({ id }: { id: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { can } = useAuthStore();
  const canWrite = can(WRITE_ROLES);

  const { data: rule, isLoading } = useGetFundAllocationRule(id);
  const updateRule = useUpdateFundAllocationRule();
  const deleteRule = useDeleteFundAllocationRule();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      forest_dev_min_percent: "",
      poor_targeted_min_percent: "",
      effective_from: "",
    },
  });

  useEffect(() => {
    if (rule) {
      form.reset({
        forest_dev_min_percent: rule.forest_dev_min_percent,
        poor_targeted_min_percent: rule.poor_targeted_min_percent,
        effective_from: formatDate(rule.effective_from),
      });
    }
  }, [rule, form]);

  if (isLoading) return <div>Loading...</div>;
  if (!rule) return <div>Allocation rule not found.</div>;

  function onSubmit(values: FormValues) {
    updateRule.mutate(
      {
        id,
        data: {
          forest_dev_min_percent: values.forest_dev_min_percent,
          poor_targeted_min_percent: values.poor_targeted_min_percent,
          effective_from: values.effective_from,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Allocation rule updated" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/fund/allocation-rules/"] });
          queryClient.invalidateQueries({ queryKey: [`/api/v1/fund/allocation-rules/${id}/`] });
        },
        onError: () => {
          toast({ title: "Failed to update allocation rule", variant: "destructive" });
        },
      }
    );
  }

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this allocation rule?")) return;
    deleteRule.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Allocation rule deleted" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/fund/allocation-rules/"] });
          router.push("/fund/allocation-rules");
        },
        onError: () => {
          toast({ title: "Failed to delete allocation rule", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Allocation Rule #{rule.id}</h1>
          <p className="text-muted-foreground mt-2">Effective from {formatDate(rule.effective_from)}</p>
        </div>
        <Button variant="outline" asChild><Link href="/fund/allocation-rules">Back to Rules</Link></Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Allocation Details</CardTitle></CardHeader>
        <CardContent>
          {canWrite ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="forest_dev_min_percent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Forest Dev Min %</FormLabel>
                        <FormControl><Input type="number" min={0} max={100} step="0.01" inputMode="decimal" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="poor_targeted_min_percent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Poor Targeted Min %</FormLabel>
                        <FormControl><Input type="number" min={0} max={100} step="0.01" inputMode="decimal" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="effective_from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective From</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={updateRule.isPending}>
                    {updateRule.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteRule.isPending}>
                    {deleteRule.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Forest Dev Min %</p>
                <p>{rule.forest_dev_min_percent}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Poor Targeted Min %</p>
                <p>{rule.poor_targeted_min_percent}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Effective From</p>
                <p>{formatDate(rule.effective_from)}</p>
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
        <AllocationRuleDetail id={Number(id)} />
      </AppLayout>
    </AuthGuard>
  );
}
