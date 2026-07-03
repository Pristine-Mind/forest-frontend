"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { ForestBlockInput, ForestBlock } from "@/lib/api";

const forestBlockSchema = z.object({
  block_name: z.string().min(1, "Block name is required").max(255),
  total_area_ha: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, "Area must be a valid positive number"),
});

type ForestBlockFormValues = z.infer<typeof forestBlockSchema>;

interface ForestBlockFormProps {
  initialData?: ForestBlock;
  onSubmit: (data: ForestBlockInput) => Promise<void>;
  isLoading?: boolean;
}

export function ForestBlockForm({ initialData, onSubmit, isLoading = false }: ForestBlockFormProps) {
  const t = useTranslations("forest.blocks");
  const form = useForm<ForestBlockFormValues>({
    resolver: zodResolver(forestBlockSchema),
    defaultValues: {
      block_name: initialData?.block_name ?? "",
      total_area_ha: initialData?.total_area_ha?.toString() ?? "",
    },
  });

  const handleSubmit = async (values: ForestBlockFormValues) => {
    await onSubmit({
      block_name: values.block_name,
      total_area_ha: parseFloat(values.total_area_ha),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("formTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="block_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("blockNameLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Block A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="total_area_ha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("areaLabel")}</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g. 150.50" {...field} />
                  </FormControl>
                  <FormDescription>Area in hectares</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner className="mr-2" />}
              {initialData ? t("update") : t("create")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
