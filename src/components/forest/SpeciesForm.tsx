"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { SpeciesInput, Species } from "@/lib/api";

const speciesSchema = z.object({
  species_name: z.string().min(1, "Species name is required").max(255),
  scientific_name: z.string().max(255).optional().or(z.literal("")),
  local_name: z.string().max(255).optional().or(z.literal("")),
});

type SpeciesFormValues = z.infer<typeof speciesSchema>;

interface SpeciesFormProps {
  initialData?: Species;
  onSubmit: (data: SpeciesInput) => Promise<void>;
  isLoading?: boolean;
}

export function SpeciesForm({ initialData, onSubmit, isLoading = false }: SpeciesFormProps) {
  const t = useTranslations("forest.species");
  const form = useForm<SpeciesFormValues>({
    resolver: zodResolver(speciesSchema),
    defaultValues: {
      species_name: initialData?.species_name ?? "",
      scientific_name: initialData?.scientific_name ?? "",
      local_name: initialData?.local_name ?? "",
    },
  });

  const handleSubmit = async (values: SpeciesFormValues) => {
    await onSubmit({
      species_name: values.species_name,
      scientific_name: values.scientific_name || undefined,
      local_name: values.local_name || undefined,
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
              name="species_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("speciesNameLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Sal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scientific_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scientific Name (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Shorea robusta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="local_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local Name (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. सालको रुख" {...field} />
                  </FormControl>
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
