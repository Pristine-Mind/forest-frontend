"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
import { useCreateStockLedger, useListSpecies } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  species: z.string().min(1, "Species is required"),
  grade: z.string().min(1, "Grade is required"),
});

type FormValues = z.infer<typeof formSchema>;

function StockLedgerNew() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createStockLedger = useCreateStockLedger();
  const { data: species } = useListSpecies({ limit: 100 });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { species: "", grade: "" },
  });

  function onSubmit(values: FormValues) {
    createStockLedger.mutate(
      { data: { species: Number(values.species), grade: values.grade } },
      {
        onSuccess: () => {
          toast({ title: "Stock entry created successfully" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/inventory/ledgers/"] });
          router.push("/inventory");
        },
        onError: (error: any) => {
          const detail = error?.response?.data?.non_field_errors?.[0];
          toast({
            title: "Failed to create stock entry",
            description: detail ?? "An entry for this species/grade may already exist.",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Stock Entry</h1>
        <p className="text-muted-foreground mt-2">Create a stock ledger for a species and grade.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Stock Entry Details</CardTitle></CardHeader>
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
              <FormField control={form.control} name="grade" render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <FormControl><Input placeholder="e.g. A, B, Sawn timber" {...field} /></FormControl>
                  <FormDescription>Available quantity starts at 0 and is tracked via stock transactions.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={createStockLedger.isPending}>
                  {createStockLedger.isPending ? "Creating..." : "Create Entry"}
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
  return <AuthGuard><AppLayout><StockLedgerNew /></AppLayout></AuthGuard>;
}
