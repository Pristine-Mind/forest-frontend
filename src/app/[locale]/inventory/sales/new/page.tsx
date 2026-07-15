"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
import { useRecordSale, useListSpecies, useListPriceRates } from "@/lib/api";
import MemberSelect  from "@/components/members/MemberSelect";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  buyer_name: z.string().optional(),
  buyer_type: z.enum(["member", "outsider"]),
  member: z.string().optional(),
  species: z.string().min(1, "Species is required"),
  grade: z.string().min(1, "Grade is required"),
  quantity: z.string().min(1, "Quantity is required").refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be a positive number"),
  rate_applied: z.string().min(1, "Rate is required").refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be a positive number"),
  payment_status: z.enum(["paid", "due", "partial"]),
  audit_note: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.buyer_type === "member" && !data.member) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Member is required when buyer type is member", path: ["member"] });
  }
});

type FormValues = z.infer<typeof formSchema>;

function RecordSale() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const recordSale = useRecordSale();
  const [rateManuallyEdited, setRateManuallyEdited] = useState(false);

  const { data: species } = useListSpecies({ limit: 100 });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      buyer_name: "", buyer_type: "outsider", member: "",
      species: "", grade: "", quantity: "", rate_applied: "",
      payment_status: "due", audit_note: "",
    },
  });

  const watchedSpecies = form.watch("species");
  const watchedGrade = form.watch("grade");
  const watchedBuyerType = form.watch("buyer_type");
  const watchedQuantity = form.watch("quantity");
  const watchedRate = form.watch("rate_applied");

  const { data: speciesRates } = useListPriceRates(
    { species: Number(watchedSpecies) },
    { query: {
        enabled: !!watchedSpecies,
        queryKey: []
    } }
  );

  const gradeOptions = useMemo(() => {
    if (!speciesRates?.results) return [];
    return Array.from(new Set(speciesRates.results.map((r) => r.grade)));
  }, [speciesRates]);

  const suggestedRate = useMemo(() => {
    if (!speciesRates?.results || !watchedGrade || !watchedBuyerType) return null;
    const today = new Date().toISOString().split("T")[0];
    const candidates = speciesRates.results.filter(
      (r) => r.grade === watchedGrade && r.buyer_type === watchedBuyerType && r.effective_from <= today
    );
    if (candidates.length === 0) return null;
    return candidates.sort((a, b) => (a.effective_from < b.effective_from ? 1 : -1))[0];
  }, [speciesRates, watchedGrade, watchedBuyerType]);

  useEffect(() => {
    if (!rateManuallyEdited && suggestedRate) {
      form.setValue("rate_applied", suggestedRate.rate_per_unit);
    }
  }, [suggestedRate, rateManuallyEdited]);

  // Reset manual-edit flag whenever species/grade/buyer type change
  useEffect(() => {
    setRateManuallyEdited(false);
  }, [watchedSpecies, watchedGrade, watchedBuyerType]);

  const previewTotal = (Number(watchedQuantity || 0) * Number(watchedRate || 0)).toFixed(2);
  const rateDiffersFromSuggestion = suggestedRate && watchedRate !== suggestedRate.rate_per_unit;

  function onSubmit(values: FormValues) {
    if (rateDiffersFromSuggestion && !values.audit_note?.trim()) {
      form.setError("audit_note", { message: "Please explain why the rate was changed from the standard rate" });
      return;
    }

    recordSale.mutate(
      {
        data: {
          buyer_name: values.buyer_name,
          buyer_type: values.buyer_type,
          member: values.buyer_type === "member" ? Number(values.member) : undefined,
          species: Number(values.species),
          grade: values.grade,
          quantity: values.quantity,
          rate_applied: values.rate_applied,
          payment_status: values.payment_status,
          audit_note: values.audit_note || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Sale recorded successfully" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/inventory/sales/"] });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/inventory/ledgers/"] });
          router.push("/inventory");
        },
        onError: (error: any) => {
          const detail = error?.response?.data?.member?.[0] ?? error?.response?.data?.detail;
          toast({
            title: "Failed to record sale",
            description: detail ?? "Stock may be insufficient or another error occurred.",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Record Sale</h1>
        <p className="text-muted-foreground mt-2">Record a forest product sale and deduct from stock.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Sale Details</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="buyer_name" render={({ field }) => (
                <FormItem><FormLabel>Buyer Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="buyer_type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buyer Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="outsider">Outsider</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                {watchedBuyerType === "member" && (
                  <FormField control={form.control} name="member" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Member</FormLabel>
                      <FormControl>
                        <MemberSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select member"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
              </div>

              <FormField control={form.control} name="species" render={({ field }) => (
                <FormItem>
                  <FormLabel>Species</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select species" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {species?.results.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.species_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="grade" render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <FormControl>
                    <>
                      <Input list="grade-options" placeholder="e.g. A, B, Sawn timber" {...field} />
                      <datalist id="grade-options">
                        {gradeOptions.map((g) => <option key={g} value={g} />)}
                      </datalist>
                    </>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="quantity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl><Input type="number" min={0.01} step="0.01" inputMode="decimal" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="rate_applied" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Applied</FormLabel>
                    <FormControl>
                      <Input
                        type="number" min={0.01} step="0.01" inputMode="decimal"
                        {...field}
                        onChange={(e) => { field.onChange(e); setRateManuallyEdited(true); }}
                      />
                    </FormControl>
                    {suggestedRate && (
                      <FormDescription>
                        Standard rate for this species/grade/buyer type: {suggestedRate.rate_per_unit}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="rounded-md bg-muted px-3 py-2 text-sm">
                Estimated total: <span className="font-mono font-medium">{previewTotal}</span>
              </div>

              <FormField control={form.control} name="payment_status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="due">Due</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {rateDiffersFromSuggestion && (
                <FormField control={form.control} name="audit_note" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Audit Note (required — rate differs from standard rate)</FormLabel>
                    <FormControl><Textarea placeholder="Reason for manually adjusting the rate" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={recordSale.isPending}>
                  {recordSale.isPending ? "Recording..." : "Record Sale"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/inventory")}>Cancel</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><RecordSale /></AppLayout></AuthGuard>;
}
