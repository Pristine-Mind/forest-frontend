"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
import { useCreateFundAllocationRule } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
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

function AddAllocationRule() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createRule = useCreateFundAllocationRule();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      forest_dev_min_percent: "",
      poor_targeted_min_percent: "",
      effective_from: "",
    },
  });

  function onSubmit(values: FormValues) {
    createRule.mutate(
      {
        data: {
          forest_dev_min_percent: values.forest_dev_min_percent,
          poor_targeted_min_percent: values.poor_targeted_min_percent,
          effective_from: values.effective_from,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Allocation rule added" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/fund/allocation-rules/"] });
          router.push("/fund/allocation-rules");
        },
        onError: () => {
          toast({ title: "Failed to add allocation rule", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Allocation Rule</h1>
        <p className="text-muted-foreground mt-2">Set minimum allocation percentages for fund distribution.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Allocation Details</CardTitle></CardHeader>
        <CardContent>
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
                <Button type="submit" disabled={createRule.isPending}>
                  {createRule.isPending ? "Saving..." : "Add Rule"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/fund/allocation-rules")}>Cancel</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><AddAllocationRule /></AppLayout></AuthGuard>;
}
