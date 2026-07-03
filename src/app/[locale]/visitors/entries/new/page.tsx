"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
import { useLogAndCollectVisitor, useListVisitorFeeRates } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  entry_date: z.string().min(1, "Entry date is required"),
  visit_purpose: z.enum(["general_visit", "study_research"]),
  visitor_count: z.coerce.number().int().min(1, "At least 1 visitor is required"),
  days: z.coerce.number().int().min(1, "At least 1 day is required"),
  fee_waived: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

function LogVisitorEntry() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const logVisitor = useLogAndCollectVisitor();
  const { data: feeRates } = useListVisitorFeeRates();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entry_date: new Date().toISOString().split("T")[0],
      visit_purpose: "general_visit",
      visitor_count: 1,
      days: 1,
      fee_waived: false,
    },
  });

  const watchedPurpose = form.watch("visit_purpose");
  const watchedCount = form.watch("visitor_count");
  const watchedDays = form.watch("days");
  const watchedWaived = form.watch("fee_waived");

  const computedTotal = useMemo(() => {
    if (watchedWaived) return "0.00";
    const rate = feeRates?.results.find((r) => r.visit_purpose === watchedPurpose);
    if (!rate) return null;
    const total = Number(rate.fee_per_visitor_per_day) * watchedCount * watchedDays;
    return total.toFixed(2);
  }, [feeRates, watchedPurpose, watchedCount, watchedDays, watchedWaived]);

  function onSubmit(values: FormValues) {
    logVisitor.mutate(
      {
        data: {
          entry_date: values.entry_date,
          visit_purpose: values.visit_purpose,
          visitor_count: values.visitor_count,
          days: values.days,
          fee_waived: values.fee_waived,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Visitor entry logged successfully" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/visitors/entries/"] });
          router.push("/visitors/entries");
        },
        onError: () => {
          toast({ title: "Failed to log visitor entry", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Log Visitor Entry</h1>
        <p className="text-muted-foreground mt-2">Record a new visitor entry and collect applicable fees.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Visitor Details</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="entry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visit_purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Purpose</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="general_visit">General Visit</SelectItem>
                        <SelectItem value="study_research">Study / Research</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="visitor_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visitor Count</FormLabel>
                      <FormControl><Input type="number" min={1} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Days</FormLabel>
                      <FormControl><Input type="number" min={1} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="fee_waived"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Fee Waived</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <div className="rounded-md bg-muted px-3 py-2 text-sm">
                Estimated total:
                <span className="font-mono font-medium ml-2">
                  {computedTotal === null ? "—" : computedTotal}
                </span>
                {watchedWaived && <span className="ml-2 text-muted-foreground">(fee waived)</span>}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={logVisitor.isPending}>
                  {logVisitor.isPending ? "Logging..." : "Log Visitor"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/visitors/entries")}>Cancel</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><LogVisitorEntry /></AppLayout></AuthGuard>;
}
