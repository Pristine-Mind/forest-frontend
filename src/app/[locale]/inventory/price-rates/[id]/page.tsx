"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { use } from "react";
import { useRouter } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetPriceRate, useUpdatePriceRate, useDeletePriceRate } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  rate_per_unit: z.string().min(1, "Rate is required").refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be a positive number"),
  effective_from: z.string().min(1, "Effective date is required"),
});

type FormValues = z.infer<typeof formSchema>;

function PriceRateDetail({ id }: { id: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: rate, isLoading } = useGetPriceRate(id);
  const updatePriceRate = useUpdatePriceRate();
  const deletePriceRate = useDeletePriceRate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: { rate_per_unit: rate?.rate_per_unit ?? "", effective_from: rate?.effective_from ?? "" },
  });

  if (isLoading) return <div>Loading...</div>;
  if (!rate) return <div>Price rate not found.</div>;

  function onSubmit(values: FormValues) {
    updatePriceRate.mutate(
      { id, data: values },
      {
        onSuccess: () => {
          toast({ title: "Price rate updated successfully" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/inventory/price-rates/"] });
          queryClient.invalidateQueries({ queryKey: [`/api/v1/inventory/price-rates/${id}/`] });
        },
        onError: () => toast({ title: "Failed to update price rate", variant: "destructive" }),
      }
    );
  }

  function handleDelete() {
    if (!window.confirm("Delete this price rate? This cannot be undone.")) return;
    deletePriceRate.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Price rate deleted" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/inventory/price-rates/"] });
          router.push("/inventory/price-rates");
        },
        onError: () => toast({ title: "Failed to delete price rate", variant: "destructive" }),
      }
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{rate.species_name}</h1>
          <p className="text-muted-foreground mt-2 capitalize">Grade {rate.grade} — {rate.buyer_type}</p>
        </div>
        <Button variant="outline" asChild><Link href="/inventory/price-rates">Back to Price Rates</Link></Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Edit Rate</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <Button type="submit" disabled={updatePriceRate.isPending}>
                {updatePriceRate.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle></CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDelete} disabled={deletePriceRate.isPending}>
            {deletePriceRate.isPending ? "Deleting..." : "Delete Price Rate"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AuthGuard><AppLayout><PriceRateDetail id={Number(id)} /></AppLayout></AuthGuard>;
}
