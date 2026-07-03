"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
import { useCreatePriceRate, useListSpecies } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  species: z.string().min(1, "Species is required"),
  grade: z.string().min(1, "Grade is required"),
  buyer_type: z.enum(["member", "outsider"]),
  rate_per_unit: z.string().min(1, "Rate is required").refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be a positive number"),
  effective_from: z.string().min(1, "Effective date is required"),
});

type FormValues = z.infer<typeof formSchema>;

function PriceRateNew() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createPriceRate = useCreatePriceRate();
  const { data: species } = useListSpecies({ limit: 100 });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      species: "", grade: "", buyer_type: "outsider",
      rate_per_unit: "", effective_from: new Date().toISOString().split("T")[0],
    },
  });

  function onSubmit(values: FormValues) {
    createPriceRate.mutate(
      { data: { ...values, species: Number(values.species) } },
      {
        onSuccess: () => {
          toast({ title: "Price rate created successfully" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/inventory/price-rates/"] });
          router.push("/inventory/price-rates");
        },
        onError: (error: any) => {
          const detail = error?.response?.data?.non_field_errors?.[0];
          toast({
            title: "Failed to create price rate",
            description: detail ?? "A rate for this exact combination and date may already exist.",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Price Rate</h1>
        <p className="text-muted-foreground mt-2">Set a standard rate for a species, grade, and buyer type.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Rate Details</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="grade" render={({ field }) => (
                  <FormItem><FormLabel>Grade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="rate_per_unit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate per Unit</FormLabel>
                    <FormControl><Input type="number" min={0.01} step="0.01" inputMode="decimal" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="effective_from" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective From</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={createPriceRate.isPending}>
                  {createPriceRate.isPending ? "Creating..." : "Create Rate"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/inventory/price-rates")}>Cancel</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><PriceRateNew /></AppLayout></AuthGuard>;
}
