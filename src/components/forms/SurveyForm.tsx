"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button as UIButton } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const treeItemSchema = z.object({
  serial_number: z.coerce.number().min(1, "Serial number is required"),
  species: z.coerce.number().min(1, "Species is required"),
  girth_cm: z.coerce.number().min(0.1, "Girth must be greater than 0"),
  height_m: z.coerce.number().min(0.1, "Height must be greater than 0"),
  volume_cubic_m: z.coerce.number().min(0.01, "Volume must be greater than 0"),
  fuelwood_volume_cubic_m: z.coerce.number().min(0, "Fuelwood volume must be >= 0"),
  wood_type: z.enum(["timber", "fuelwood"]),
  remarks: z.string().optional(),
});

const surveyFormSchema = z.object({
  form_number: z.string().min(1, "Form number is required"),
  survey_date: z.string(),
  block: z.coerce.number().min(1, "Block is required"),
  district: z.string().min(1, "District is required"),
  municipality: z.string().min(1, "Municipality is required"),
  ward_number: z.coerce.number().min(1, "Ward number is required"),
  plot_number: z.coerce.number().min(1, "Plot number is required"),
  forest_category: z.string().min(1, "Forest category is required"),
  community_representative: z.string().min(1, "Community representative is required"),
  forest_officer: z.string().min(1, "Forest officer is required"),
  notes: z.string().optional(),
  tree_items_data: z.array(treeItemSchema).min(1, "At least one tree item is required"),
});

type SurveyFormValues = z.infer<typeof surveyFormSchema>;

interface SurveyFormProps {
  onSubmit: (data: SurveyFormValues) => Promise<void>;
  isLoading?: boolean;
  species?: Array<{ id: number; species_name?: string; name?: string }>;
  blocks?: Array<{ id: number; block_name?: string; name?: string }>;
}

export function SurveyForm({ onSubmit, isLoading = false, species = [], blocks = [] }: SurveyFormProps) {
  const { toast } = useToast();
  const t = useTranslations("forms.survey");
  
  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: {
      form_number: "SURVEY-",
      survey_date: new Date().toISOString().split("T")[0],
      block: undefined,
      district: "",
      municipality: "",
      ward_number: undefined,
      plot_number: undefined,
      forest_category: "Community Forest",
      community_representative: "",
      forest_officer: "",
      notes: "",
      tree_items_data: [
        {
          serial_number: 1,
          species: 1,
          girth_cm: 0,
          height_m: 0,
          volume_cubic_m: 0,
          fuelwood_volume_cubic_m: 0,
          wood_type: "timber",
          remarks: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tree_items_data",
  });

  const handleSubmit = async (values: SurveyFormValues) => {
    try {
      await onSubmit(values);
      toast({
        title: "Success",
        description: "Survey form created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create survey form",
        variant: "destructive",
      });
    }
  };

  const totalVolume = form.watch("tree_items_data").reduce((sum, item) => sum + (item.volume_cubic_m || 0), 0);
  const totalFuelwood = form.watch("tree_items_data").reduce((sum, item) => sum + (item.fuelwood_volume_cubic_m || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Survey Form</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Form Header Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="form_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form Number</FormLabel>
                    <FormControl>
                      <Input placeholder="SURVEY-001" {...field} />
                    </FormControl>
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

              <FormField
                control={form.control}
                name="block"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Block</FormLabel>
                    <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(Number(v))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select block" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {blocks.map((block) => (
                          <SelectItem key={block.id} value={block.id.toString()}>
                            {block.block_name || block.name}
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
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <FormControl>
                      <Input placeholder="Kathmandu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="municipality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Municipality</FormLabel>
                    <FormControl>
                      <Input placeholder="Chandragiri" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ward_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ward Number</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5" {...field} />
                    </FormControl>
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
                      <Input type="number" placeholder="101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="forest_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forest Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Community Forest">Community Forest</SelectItem>
                        <SelectItem value="Government Forest">Government Forest</SelectItem>
                        <SelectItem value="Private Forest">Private Forest</SelectItem>
                        <SelectItem value="Protected Forest">Protected Forest</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="community_representative"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Representative</FormLabel>
                    <FormControl>
                      <Input placeholder="Ram Prasad Sharma" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="forest_officer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forest Officer</FormLabel>
                    <FormControl>
                      <Input placeholder="Hari Singh" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add survey notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tree Items Section */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Tree Items</h3>
                <div className="text-sm text-gray-600">
                  <p>Total Volume: {totalVolume.toFixed(3)} m³</p>
                  <p>Total Fuelwood: {totalFuelwood.toFixed(3)} m³</p>
                </div>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="bg-gray-50">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`tree_items_data.${index}.serial_number`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Serial Number</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`tree_items_data.${index}.species`}
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
                                      {sp.species_name || sp.name}
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
                          name={`tree_items_data.${index}.girth_cm`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Girth (cm)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" placeholder="45.5" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`tree_items_data.${index}.height_m`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Height (m)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" placeholder="15.2" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`tree_items_data.${index}.volume_cubic_m`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Volume (m³)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="2.45" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`tree_items_data.${index}.fuelwood_volume_cubic_m`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fuelwood Volume (m³)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="0.5" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`tree_items_data.${index}.wood_type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Wood Type</FormLabel>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="timber">Timber</SelectItem>
                                  <SelectItem value="fuelwood">Fuelwood</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`tree_items_data.${index}.remarks`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Remarks</FormLabel>
                              <FormControl>
                                <Input placeholder="Good quality timber" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(index)}
                          className="mt-4"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Item
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    serial_number: fields.length + 1,
                    species: 1,
                    girth_cm: 0,
                    height_m: 0,
                    volume_cubic_m: 0,
                    fuelwood_volume_cubic_m: 0,
                    wood_type: "timber",
                    remarks: "",
                  })
                }
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Tree Item
              </Button>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Spinner className="mr-2" />}
                Create Survey Form
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
