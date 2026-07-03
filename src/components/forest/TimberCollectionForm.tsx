"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { ForestBlock, Species } from "@/lib/api";

const timberCollectionSchema = z.object({
  block: z.coerce.number().min(1, "Block is required"),
  species: z.coerce.number().min(1, "Species is required"),
  wood_volume: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, "Wood volume must be a valid positive number"),
  firewood: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, "Firewood volume must be a valid positive number"),
});

type TimberCollectionFormValues = z.infer<typeof timberCollectionSchema>;

interface TimberCollectionFormProps {
  blocks?: ForestBlock[];
  species?: Species[];
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<TimberCollectionFormValues>;
}

export function TimberCollectionForm({ blocks = [], species = [], onSubmit, isLoading = false, initialData }: TimberCollectionFormProps) {
  const form = useForm<TimberCollectionFormValues>({
    resolver: zodResolver(timberCollectionSchema),
    values: {
      block: initialData?.block ?? 0,
      species: initialData?.species ?? 0,
      wood_volume: initialData?.wood_volume ?? "0",
      firewood: initialData?.firewood ?? "0",
    },
  });

  const handleSubmit = async (values: TimberCollectionFormValues) => {
    await onSubmit({
      block: values.block,
      species: values.species,
      wood_volume: parseFloat(values.wood_volume),
      firewood: parseFloat(values.firewood),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timber Collection Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="block"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forest Block</FormLabel>
                  <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(Number(v))}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select block" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {blocks.map((block) => (
                        <SelectItem key={block.id} value={block.id.toString()}>
                          {block.block_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="species"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Species</FormLabel>
                  <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(Number(v))}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select species" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {species.map((sp) => (
                        <SelectItem key={sp.id} value={sp.id.toString()}>
                          {sp.species_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wood_volume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wood Volume (cubic m)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="firewood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Firewood Volume (cubic m)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner className="mr-2" />}
              Create Timber Collection
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
