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
import { Checkbox } from "@/components/ui/checkbox";
import type { TreeCountInput, TreeCount, ForestBlock, Species } from "@/lib/api";

const treeCountSchema = z.object({
  block: z.coerce.number().min(1, "Block is required"),
  operational_plan: z.coerce.number().optional(),
  species: z.coerce.number().min(1, "Species is required"),
  plot_number: z.coerce.number().min(1, "Plot number must be greater than 0"),
  tree_number: z.coerce.number().min(1, "Tree number must be greater than 0"),
  girth_cm: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0 && num <= 500;
  }, "Girth must be between 0 and 500 cm"),
  height_m: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0 && num <= 100;
  }, "Height must be between 0 and 100 meters"),
  tree_class: z.enum(["i", "ii", "iii"]),
  survey_date: z.string().optional(),
  is_harvestable: z.boolean().default(true),
  notes: z.string().optional(),
});

type TreeCountFormValues = z.infer<typeof treeCountSchema>;

interface TreeCountFormProps {
  initialData?: TreeCount;
  blocks?: ForestBlock[];
  species?: Species[];
  onSubmit: (data: TreeCountInput) => Promise<void>;
  isLoading?: boolean;
}

export function TreeCountForm({ initialData, blocks = [], species = [], onSubmit, isLoading = false }: TreeCountFormProps) {
  const t = useTranslations("forest.treeCounts");
  const form = useForm<TreeCountFormValues>({
    resolver: zodResolver(treeCountSchema),
    defaultValues: {
      block: initialData?.block ?? undefined,
      operational_plan: initialData?.operational_plan,
      species: initialData?.species ?? undefined,
      plot_number: initialData?.plot_number ?? undefined,
      tree_number: initialData?.tree_number ?? undefined,
      girth_cm: initialData?.girth_cm?.toString() ?? "",
      height_m: initialData?.height_m?.toString() ?? "",
      tree_class: initialData?.tree_class ?? "i",
      survey_date: initialData?.survey_date ?? new Date().toISOString().split("T")[0],
      is_harvestable: initialData?.is_harvestable ?? true,
      notes: initialData?.notes ?? "",
    },
  });

  const handleSubmit = async (values: TreeCountFormValues) => {
    await onSubmit({
      block: values.block,
      operational_plan: values.operational_plan,
      species: values.species,
      plot_number: values.plot_number,
      tree_number: values.tree_number,
      girth_cm: parseFloat(values.girth_cm),
      height_m: parseFloat(values.height_m),
      tree_class: values.tree_class,
      survey_date: values.survey_date,
      is_harvestable: values.is_harvestable,
      notes: values.notes,
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="block"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forestBlock")}</FormLabel>
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
                    <FormLabel>{t("species")}</FormLabel>
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
                name="plot_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plot Number</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tree_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tree Number</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="girth_cm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Girth (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="0-500" {...field} />
                    </FormControl>
                    <FormDescription>Girth at breast height</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="height_m"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (m)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="0-100" {...field} />
                    </FormControl>
                    <FormDescription>Height in meters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tree_class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tree Class</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="i">Class I</SelectItem>
                        <SelectItem value="ii">Class II</SelectItem>
                        <SelectItem value="iii">Class III</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="survey_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Survey Date</FormLabel>
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
              name="is_harvestable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel>Is Harvestable</FormLabel>
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
                    <Textarea placeholder="Add any notes about this tree..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner className="mr-2" />}
              {initialData ? "Update" : "Create"} Tree Count
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
