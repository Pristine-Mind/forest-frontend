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
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const cuttingItemSchema = z.object({
  serial_number: z.coerce.number().min(1, "Serial number is required"),
  entry_time: z.string().min(1, "Entry time is required"),
  plot_number: z.string().min(1, "Plot number is required"),
  quota_number: z.string().min(1, "Quota number is required"),
  species: z.coerce.number().min(1, "Species is required"),
  size_measurement: z.string().min(1, "Size measurement is required"),
  volume_cubic_m: z.coerce.number().min(0.01, "Volume must be greater than 0"),
  comments: z.string().optional(),
  remarks: z.string().optional(),
});

const cuttingRegisterSchema = z.object({
  form_number: z.string().min(1, "Form number is required"),
  register_date: z.string(),
  block: z.coerce.number().min(1, "Block is required"),
  zone: z.string().min(1, "Zone is required"),
  district: z.string().min(1, "District is required"),
  municipality: z.string().min(1, "Municipality is required"),
  ward_number: z.coerce.number().min(1, "Ward number is required"),
  forest_classification: z.string().min(1, "Forest classification is required"),
  block_plot_name: z.string().min(1, "Block plot name is required"),
  block_plot_type: z.string().min(1, "Block plot type is required"),
  cutting_location: z.string().min(1, "Cutting location is required"),
  community_representative_name: z.string().min(1, "Community representative name is required"),
  forest_officer_name: z.string().min(1, "Forest officer name is required"),
  notes: z.string().optional(),
  cutting_items_data: z.array(cuttingItemSchema).min(1, "At least one cutting item is required"),
});

type CuttingRegisterValues = z.infer<typeof cuttingRegisterSchema>;

interface CuttingRegisterProps {
  onSubmit: (data: CuttingRegisterValues) => Promise<void>;
  isLoading?: boolean;
  species?: Array<{ id: number; species_name?: string; name?: string }>;
  blocks?: Array<{ id: number; block_name?: string; name?: string }>;
}

export function CuttingRegisterForm({ onSubmit, isLoading = false, species = [], blocks = [] }: CuttingRegisterProps) {
  const { toast } = useToast();
  const t = useTranslations("forms.cutting");
  
  const form = useForm<CuttingRegisterValues>({
    resolver: zodResolver(cuttingRegisterSchema),
    defaultValues: {
      form_number: "CUT-",
      register_date: new Date().toISOString().split("T")[0],
      block: undefined,
      zone: "",
      district: "Kathmandu",
      municipality: "Chandragiri",
      ward_number: undefined,
      forest_classification: "Community Forest",
      block_plot_name: "Block A",
      block_plot_type: "Natural Forest",
      cutting_location: "",
      community_representative_name: "",
      forest_officer_name: "",
      notes: "",
      cutting_items_data: [
        {
          serial_number: 1,
          entry_time: "09:00:00",
          plot_number: "P101",
          quota_number: "Q001",
          species: undefined,
          size_measurement: "",
          volume_cubic_m: 0,
          comments: "",
          remarks: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cutting_items_data",
  });

  const handleSubmit = async (values: CuttingRegisterValues) => {
    try {
      await onSubmit(values);
      toast({
        title: "Success",
        description: "Cutting register created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create cutting register",
        variant: "destructive",
      });
    }
  };

  const totalVolume = form.watch("cutting_items_data").reduce((sum, item) => sum + (item.volume_cubic_m || 0), 0);
  const itemCount = fields.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title", "Cutting Register")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Register Header Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="form_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form Number</FormLabel>
                    <FormControl>
                      <Input placeholder="CUT-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="register_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Register Date</FormLabel>
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
                name="zone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zone</FormLabel>
                    <FormControl>
                      <Input placeholder="Eastern Zone" {...field} />
                    </FormControl>
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
                name="forest_classification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forest Classification</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select classification" />
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
                name="block_plot_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Block Plot Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Block A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="block_plot_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Block Plot Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Natural Forest" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cutting_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cutting Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Northern slope" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="community_representative_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Representative</FormLabel>
                    <FormControl>
                      <Input placeholder="Ram Prasad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="forest_officer_name"
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
                    <Textarea placeholder="Add notes about cutting operation..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cutting Items Section */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Cutting Items</h3>
                <div className="text-sm text-gray-600">
                  <p>Total Volume: {totalVolume.toFixed(3)} m³</p>
                  <p>Item Count: {itemCount}</p>
                </div>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="bg-gray-50">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`cutting_items_data.${index}.serial_number`}
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
                          name={`cutting_items_data.${index}.entry_time`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Entry Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`cutting_items_data.${index}.plot_number`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Plot Number</FormLabel>
                              <FormControl>
                                <Input placeholder="P101" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`cutting_items_data.${index}.quota_number`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quota Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Q001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`cutting_items_data.${index}.species`}
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
                          name={`cutting_items_data.${index}.size_measurement`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Size Measurement</FormLabel>
                              <FormControl>
                                <Input placeholder="45.5cm x 15.2m" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`cutting_items_data.${index}.volume_cubic_m`}
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
                          name={`cutting_items_data.${index}.comments`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Comments</FormLabel>
                              <FormControl>
                                <Input placeholder="First batch" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`cutting_items_data.${index}.remarks`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Remarks</FormLabel>
                              <FormControl>
                                <Input placeholder="Quality timber" {...field} />
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
                    entry_time: "09:00:00",
                    plot_number: `P${101 + fields.length}`,
                    quota_number: `Q${String(fields.length + 1).padStart(3, "0")}`,
                    species: undefined,
                    size_measurement: "",
                    volume_cubic_m: 0,
                    comments: "",
                    remarks: "",
                  })
                }
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Cutting Item
              </Button>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Spinner className="mr-2" />}
                Create Cutting Register
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
