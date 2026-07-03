"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const wildlifeSpeciesSchema = z.object({
  species_name: z.string().min(1, "Species name is required").max(255),
  scientific_name: z.string().max(255).optional().or(z.literal("")),
  local_name: z.string().max(255).optional().or(z.literal("")),
});

type WildlifeSpeciesFormValues = z.infer<typeof wildlifeSpeciesSchema>;

interface WildlifeSpeciesFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<WildlifeSpeciesFormValues>;
}

export function WildlifeSpeciesForm({ onSubmit, isLoading = false, initialData }: WildlifeSpeciesFormProps) {
  const form = useForm<WildlifeSpeciesFormValues>({
    resolver: zodResolver(wildlifeSpeciesSchema),
    defaultValues: {
      species_name: initialData?.species_name ?? "",
      scientific_name: initialData?.scientific_name ?? "",
      local_name: initialData?.local_name ?? "",
    },
  });

  const handleSubmit = async (values: WildlifeSpeciesFormValues) => {
    await onSubmit({
      species_name: values.species_name,
      scientific_name: values.scientific_name || undefined,
      local_name: values.local_name || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wildlife Species Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="species_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Species Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Tiger" {...field} />
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
                    <Input placeholder="e.g. Panthera tigris" {...field} />
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
                    <Input placeholder="e.g. बाघ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner className="mr-2" />}
              Create Wildlife Species
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
