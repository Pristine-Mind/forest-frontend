"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const harvestLogSchema = z.object({
  tree_record: z.coerce.number().min(1, "Tree record is required"),
  harvest_date: z.string(),
  harvest_quantity_cubic_m: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, "Harvest quantity must be a valid positive number"),
  reference_harvest_request: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type HarvestLogFormValues = z.infer<typeof harvestLogSchema>;

interface HarvestLogFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<HarvestLogFormValues>;
}

export function HarvestLogForm({ onSubmit, isLoading = false, initialData }: HarvestLogFormProps) {
  const form = useForm<HarvestLogFormValues>({
    resolver: zodResolver(harvestLogSchema),
    defaultValues: {
      tree_record: initialData?.tree_record ?? undefined,
      harvest_date: initialData?.harvest_date ?? new Date().toISOString().split("T")[0],
      harvest_quantity_cubic_m: initialData?.harvest_quantity_cubic_m ?? "",
      reference_harvest_request: initialData?.reference_harvest_request ?? undefined,
      notes: initialData?.notes ?? "",
    },
  });

  const handleSubmit = async (values: HarvestLogFormValues) => {
    await onSubmit({
      tree_record: values.tree_record,
      harvest_date: values.harvest_date,
      harvest_quantity_cubic_m: parseFloat(values.harvest_quantity_cubic_m),
      reference_harvest_request: values.reference_harvest_request,
      notes: values.notes,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Harvest Log Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="tree_record"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tree Record ID</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter tree record ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="harvest_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harvest Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="harvest_quantity_cubic_m"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harvest Quantity (cubic m)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference_harvest_request"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Harvest Request (optional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Harvest request ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add harvest notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner className="mr-2" />}
              Create Harvest Log
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
