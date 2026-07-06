// components/forms/FellingRegisterForm.tsx
"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Trash2 } from "lucide-react";
import type { FellingRegisterPayload } from "@/lib/api-forms";

interface Species {
  id: number;
  species_name: string;
}

const entrySchema = z.object({
  entry_date: z.string().min(1, "Date is required"),
  entry_time: z.string().optional(),
  rawana_number: z.string().optional(),
  golia_number: z.string().optional(),
  species: z.coerce.number().min(1, "Species is required"),
  measurement_size: z.string().optional(),
  volume_cubic_feet: z.string().optional(),
  firewood_chatta: z.string().optional(),
  remarks: z.string().optional(),
});

const fellingRegisterSchema = z.object({
  area: z.string().optional(),
  district: z.string().min(1, "District is required"),
  sub_division: z.string().optional(),
  block_name_and_type: z.string().optional(),
  felling_location: z.string().optional(),
  cutting_agency_name: z.string().optional(),
  tree_count: z.coerce.number().optional(),
  felling_sawing_deadline: z.string().optional(),
  dispatch_deadline: z.string().optional(),
  cfug_rep_name: z.string().optional(),
  cfug_rep_position: z.string().optional(),
  cfug_rep_signed_date: z.string().optional(),
  forest_rep_name: z.string().optional(),
  forest_rep_position: z.string().optional(),
  forest_rep_signed_date: z.string().optional(),
  entries: z.array(entrySchema).min(1, "Add at least one entry"),
});

export type FellingRegisterFormValues = z.infer<typeof fellingRegisterSchema>;

interface FellingRegisterFormProps {
  onSubmit: (data: FellingRegisterPayload) => Promise<void> | void;
  isLoading: boolean;
  species: Species[];
}

const emptyEntry: FellingRegisterFormValues["entries"][number] = {
  entry_date: new Date().toISOString().slice(0, 10),
  entry_time: "",
  rawana_number: "",
  golia_number: "",
  species: 0,
  measurement_size: "",
  volume_cubic_feet: "",
  firewood_chatta: "",
  remarks: "",
};

export function FellingRegisterForm({ onSubmit, isLoading, species }: FellingRegisterFormProps) {
  const form = useForm<FellingRegisterFormValues>({
    resolver: zodResolver(fellingRegisterSchema),
    defaultValues: {
      area: "",
      district: "",
      sub_division: "",
      block_name_and_type: "",
      felling_location: "",
      cutting_agency_name: "",
      tree_count: undefined,
      felling_sawing_deadline: "",
      dispatch_deadline: "",
      cfug_rep_name: "",
      cfug_rep_position: "",
      cfug_rep_signed_date: "",
      forest_rep_name: "",
      forest_rep_position: "",
      forest_rep_signed_date: "",
      entries: [emptyEntry],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entries",
  });

  const handleSubmit = async (values: FellingRegisterFormValues) => {
    await onSubmit(values as FellingRegisterPayload);
    form.reset({ ...form.getValues(), entries: [emptyEntry] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Felling Register (अनुसूची-८)</CardTitle>
        <CardDescription>
          Record site details, then add one row per tree/log cut and measured.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* ── Site details ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area (क्षेत्र)</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-area" />
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
                    <FormLabel>District (जिल्ला)</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-district" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sub_division"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-division (सब-डिभिजन)</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-sub-division" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="block_name_and_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Block/Plot name & type (खण्ड/प्लटको नाम र किसिम)</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-block-name-type" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="felling_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Felling location (घाटगद्दीको स्थान)</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-felling-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cutting_agency_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cutting agency (कटान गर्ने निकायको नाम)</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-cutting-agency" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tree_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tree count (रुख संख्या)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={0} data-testid="input-tree-count" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="felling_sawing_deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Felling/sawing deadline (कटान चिरान म्याद)</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" data-testid="input-felling-deadline" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dispatch_deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dispatch deadline (निकासी म्याद)</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" data-testid="input-dispatch-deadline" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ── Signatories ────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  सामुदायिक वनको प्रतिनिधि
                </h3>
                <FormField
                  control={form.control}
                  name="cfug_rep_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-cfug-rep-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cfug_rep_position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-cfug-rep-position" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cfug_rep_signed_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-cfug-rep-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">वन प्रतिनिधि</h3>
                <FormField
                  control={form.control}
                  name="forest_rep_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-forest-rep-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="forest_rep_position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-forest-rep-position" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="forest_rep_signed_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-forest-rep-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ── Entries (dynamic rows) ─────────────────────────────────── */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Felling Entries (घाटगद्दी विवरण)</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append(emptyEntry)}
                  data-testid="button-add-entry"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Row
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-md border p-4 space-y-3"
                    data-testid={`entry-row-${index}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Row {index + 1}
                      </span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="text-destructive hover:text-destructive"
                          data-testid={`button-remove-entry-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <FormField
                        control={form.control}
                        name={`entries.${index}.entry_date`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date (मिति)</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" data-testid={`input-entry-date-${index}`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`entries.${index}.entry_time`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time (समय)</FormLabel>
                            <FormControl>
                              <Input {...field} type="time" data-testid={`input-entry-time-${index}`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`entries.${index}.rawana_number`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rawana No. (रमाना नं.)</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid={`input-rawana-${index}`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`entries.${index}.golia_number`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Golia No. (गोलिया नं.)</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid={`input-golia-${index}`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`entries.${index}.species`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Species (जात)</FormLabel>
                            <Select
                              value={field.value ? String(field.value) : ""}
                              onValueChange={(v) => field.onChange(Number(v))}
                            >
                              <FormControl>
                                <SelectTrigger data-testid={`select-species-${index}`}>
                                  <SelectValue placeholder="Select species" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {species.map((s) => (
                                  <SelectItem key={s.id} value={String(s.id)}>
                                    {s.species_name}
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
                        name={`entries.${index}.measurement_size`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Size (नाप साइज)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. 12in x 8ft" data-testid={`input-size-${index}`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`entries.${index}.volume_cubic_feet`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Volume cu.ft. (आयतन)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="0.00" data-testid={`input-volume-${index}`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`entries.${index}.firewood_chatta`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Firewood chatta (दाउरा)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="0.00" data-testid={`input-firewood-${index}`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`entries.${index}.remarks`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Remarks (कैफियत)</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} data-testid={`input-remarks-${index}`} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>

              {form.formState.errors.entries?.message && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.entries.message as string}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              data-testid="button-save-felling-register"
            >
              {isLoading ? "Saving..." : "Save Register"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
