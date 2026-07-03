"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const operationalPlanSchema = z.object({
  valid_from: z.string(),
  valid_to: z.string(),
  approved_harvest_limit: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, "Harvest limit must be a valid positive number"),
  description: z.string().optional(),
});

type OperationalPlanFormValues = z.infer<typeof operationalPlanSchema>;

interface OperationalPlanFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export function OperationalPlanForm({ onSubmit, isLoading = false }: OperationalPlanFormProps) {
  const form = useForm<OperationalPlanFormValues>({
    resolver: zodResolver(operationalPlanSchema),
    defaultValues: {
      valid_from: new Date().toISOString().split("T")[0],
      valid_to: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split("T")[0],
      approved_harvest_limit: "5000",
      description: "",
    },
  });

  const handleSubmit = async (values: OperationalPlanFormValues) => {
    await onSubmit({
      valid_from: values.valid_from,
      valid_to: values.valid_to,
      approved_harvest_limit: parseFloat(values.approved_harvest_limit),
      description: values.description,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operational Plan Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="valid_from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid From</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valid_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid To</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="approved_harvest_limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approved Harvest Limit (cubic m)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="5000.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="5-year operational plan for sustainable harvest" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner className="mr-2" />}
              Create Operational Plan
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
