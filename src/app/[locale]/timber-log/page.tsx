"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import * as React from "react"
import {
  useListTimberLogEntries,
  useCreateTimberLogEntry,
  useUpdateTimberLogEntry,
  useDeleteTimberLogEntry,
  getListTimberLogEntriesQueryKey,
  useListSpecies,
} from "@/lib/api";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Trees,
} from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// ─── Form Schema ─────────────────────────────────────────────────────────────

const timberLogEntrySchema = z.object({
  species: z.coerce.number().min(1, "Species is required"),
  tree_no: z.string().min(1, "Tree number is required"),
  tree_golia_no: z.string().optional(),
  golia_no: z.string().min(1, "Golia number is required"),
  girth_inch: z.coerce.number().gt(0, "Girth must be greater than 0"),
  length_feet: z.coerce.number().gt(0, "Length must be greater than 0"),
  volume_cubic_feet: z.coerce.number().gt(0, "Volume must be greater than 0"),
  total_pieces: z.coerce.number().min(0, "Total pieces must be 0 or greater"),
  timber1_pieces: z.coerce.number().min(0, "Timber 1 pieces must be 0 or greater"),
  timber1_diameter_1_inch: z.coerce.number().min(0, "Diameter must be 0 or greater"),
  timber1_diameter_2_inch: z.coerce.number().min(0, "Diameter must be 0 or greater"),
  timber2_pieces: z.coerce.number().min(0, "Timber 2 pieces must be 0 or greater"),
  timber2_diameter_1_inch: z.coerce.number().min(0, "Diameter must be 0 or greater"),
  timber2_diameter_2_inch: z.coerce.number().min(0, "Diameter must be 0 or greater"),
  avg_diameter_length_1_feet: z.coerce.number().min(0, "Must be 0 or greater").optional(),
  avg_diameter_length_2_feet: z.coerce.number().min(0, "Must be 0 or greater").optional(),
  sawn_volume_cft: z.coerce.number().min(0, "Must be 0 or greater").optional(),
  wastage_percent: z.coerce.number().min(0, "Wastage must be 0 or greater"),
  net_volume_cft: z.coerce.number().min(0, "Net volume must be 0 or greater").optional(),
  grade: z.enum(["A", "B", "C"], {
    required_error: "Grade is required",
  }),
});

type TimberLogEntryFormValues = z.infer<typeof timberLogEntrySchema>;

function TimberLogEntryForm({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues?: Partial<TimberLogEntryFormValues>;
  onSubmit: (data: TimberLogEntryFormValues) => void;
  isPending: boolean;
}) {
  const { data: speciesData } = useListSpecies({ limit: 1000 });

  const form = useForm<TimberLogEntryFormValues>({
    resolver: zodResolver(timberLogEntrySchema),
    defaultValues: {
      species: defaultValues?.species ?? 0,
      tree_no: defaultValues?.tree_no ?? "",
      tree_golia_no: defaultValues?.tree_golia_no ?? "",
      golia_no: defaultValues?.golia_no ?? "",
      girth_inch: defaultValues?.girth_inch ?? undefined,
      length_feet: defaultValues?.length_feet ?? undefined,
      volume_cubic_feet: defaultValues?.volume_cubic_feet ?? undefined,
      total_pieces: defaultValues?.total_pieces ?? 0,
      timber1_pieces: defaultValues?.timber1_pieces ?? 0,
      timber1_diameter_1_inch: defaultValues?.timber1_diameter_1_inch ?? 0,
      timber1_diameter_2_inch: defaultValues?.timber1_diameter_2_inch ?? 0,
      timber2_pieces: defaultValues?.timber2_pieces ?? 0,
      timber2_diameter_1_inch: defaultValues?.timber2_diameter_1_inch ?? 0,
      timber2_diameter_2_inch: defaultValues?.timber2_diameter_2_inch ?? 0,
      avg_diameter_length_1_feet: defaultValues?.avg_diameter_length_1_feet ?? undefined,
      avg_diameter_length_2_feet: defaultValues?.avg_diameter_length_2_feet ?? undefined,
      sawn_volume_cft: defaultValues?.sawn_volume_cft ?? undefined,
      wastage_percent: defaultValues?.wastage_percent ?? 0,
      net_volume_cft: defaultValues?.net_volume_cft ?? undefined,
      grade: defaultValues?.grade ?? "A",
    },
  });

  // Watch girth and length fields for auto-calculation
  const girthInch = form.watch("girth_inch");
  const lengthFeet = form.watch("length_feet");

  // Auto-calculate volume when girth or length changes
  React.useEffect(() => {
    if (girthInch && lengthFeet && girthInch > 0 && lengthFeet > 0) {
      const volume = (girthInch * girthInch * lengthFeet) / 2304;
      form.setValue("volume_cubic_feet", Number(volume.toFixed(2)));
    } else {
      form.setValue("volume_cubic_feet", undefined);
    }
  }, [girthInch, lengthFeet, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="species"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Species</FormLabel>
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <FormControl>
                    <SelectTrigger data-testid="select-species">
                      <SelectValue placeholder="Select species" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {speciesData?.results.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.local_name}
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
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger data-testid="select-grade">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="tree_no"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tree No.</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. T-001" data-testid="input-tree-no" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tree_golia_no"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tree's Log No.</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. TL-001" data-testid="input-tree-golia-no" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="golia_no"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Log (Golia) No.</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. G-001" data-testid="input-golia-no" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="girth_inch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Girth (inch)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    placeholder="0.00" 
                    data-testid="input-girth"
                    onChange={(e) => {
                      field.onChange(e);
                      // Volume will be auto-calculated via useEffect
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="length_feet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Length (ft)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    placeholder="0.00" 
                    data-testid="input-length"
                    onChange={(e) => {
                      field.onChange(e);
                      // Volume will be auto-calculated via useEffect
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="volume_cubic_feet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volume (cu.ft) <span className="text-xs text-muted-foreground">(auto-calculated)</span></FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    placeholder="Auto-calculated" 
                    data-testid="input-volume"
                    readOnly
                    className="bg-muted"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="total_pieces"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Pieces</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="0" placeholder="0" data-testid="input-total-pieces" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="wastage_percent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wastage (%)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" min="0" placeholder="0.00" data-testid="input-wastage" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="net_volume_cft"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Net Volume (Cft)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" min="0" placeholder="0.00" data-testid="input-net-volume" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4 border rounded-lg p-4">
            <h4 className="font-medium text-sm">Timber No. 1</h4>
            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="timber1_pieces"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Pieces</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" placeholder="0" data-testid="input-timber1-pieces" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timber1_diameter_1_inch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Dia 1 (inch)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" placeholder="0.00" data-testid="input-timber1-dia1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timber1_diameter_2_inch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Dia 2 (inch)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" placeholder="0.00" data-testid="input-timber1-dia2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4 border rounded-lg p-4">
            <h4 className="font-medium text-sm">Timber No. 2</h4>
            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="timber2_pieces"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Pieces</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" placeholder="0" data-testid="input-timber2-pieces" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timber2_diameter_1_inch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Dia 1 (inch)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" placeholder="0.00" data-testid="input-timber2-dia1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timber2_diameter_2_inch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Dia 2 (inch)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" placeholder="0.00" data-testid="input-timber2-dia2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="avg_diameter_length_1_feet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avg. Dia Length 1 (ft)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" min="0" placeholder="0.00" data-testid="input-avg-dia1" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="avg_diameter_length_2_feet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avg. Dia Length 2 (ft)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" min="0" placeholder="0.00" data-testid="input-avg-dia2" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sawn_volume_cft"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sawn Volume (Cft)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" min="0" placeholder="0.00" data-testid="input-sawn-volume" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full"
          data-testid="button-save-timber-log"
        >
          {isPending ? "Saving..." : "Save Entry"}
        </Button>
      </form>
    </Form>
  );
}


function TimberLogEntryViewDialog({ entry }: { entry: any }) {
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Timber Log Entry Details</DialogTitle>
      </DialogHeader>
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-4 border-b pb-2">
          <div>
            <span className="text-muted-foreground block">Species</span>
            <span className="font-medium">{entry.species_name || `#${entry.species}`}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Grade</span>
            <Badge variant="outline">{entry.grade}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-b pb-2">
          <div>
            <span className="text-muted-foreground block">Tree No.</span>
            <span className="font-medium">{entry.tree_no}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Tree's Log No.</span>
            <span className="font-medium">{entry.tree_golia_no || "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Log (Golia) No.</span>
            <span className="font-medium">{entry.golia_no}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-b pb-2">
          <div>
            <span className="text-muted-foreground block">Girth (inch)</span>
            <span className="font-medium">{entry.girth_inch}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Length (ft)</span>
            <span className="font-medium">{entry.length_feet}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Volume (cu.ft)</span>
            <span className="font-medium">{entry.volume_cubic_feet}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-b pb-2">
          <div>
            <span className="text-muted-foreground block">Total Pieces</span>
            <span className="font-medium">{entry.total_pieces}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Wastage (%)</span>
            <span className="font-medium">{entry.wastage_percent}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Net Volume (Cft)</span>
            <span className="font-medium">{entry.net_volume_cft || "—"}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b pb-2">
          <div>
            <span className="text-muted-foreground block">Avg. Dia Length 1 (ft)</span>
            <span className="font-medium">{entry.avg_diameter_length_1_feet || "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Avg. Dia Length 2 (ft)</span>
            <span className="font-medium">{entry.avg_diameter_length_2_feet || "—"}</span>
          </div>
        </div>

        <div className="border-b pb-2">
          <span className="text-muted-foreground block">Sawn Volume (Cft)</span>
          <span className="font-medium">{entry.sawn_volume_cft || "—"}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-muted-foreground block">Created</span>
            <span className="text-xs">{entry.created_at?.slice(0, 10)}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Updated</span>
            <span className="text-xs">{entry.updated_at?.slice(0, 10)}</span>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

// ─── Main Tab / Page Content ─────────────────────────────────────────────────

function TimberLogEntriesContent() {
  const { can } = useAuthStore();
  const canWrite = can(WRITE_ROLES);

  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [viewItem, setViewItem] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");

  const { data, isLoading } = useListTimberLogEntries(
    searchTerm ? { search: searchTerm } : undefined,
  );
  const { data: speciesData } = useListSpecies({ limit: 1000 });

  const createMutation = useCreateTimberLogEntry();
  const updateMutation = useUpdateTimberLogEntry();
  const deleteMutation = useDeleteTimberLogEntry();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListTimberLogEntriesQueryKey() });

  const speciesNameById = useMemo(() => {
    const map = new Map<number, string>();
    speciesData?.results.forEach((s) => map.set(s.id, s.local_name));
    return map;
  }, [speciesData]);

  const filteredResults = useMemo(() => {
    const results = data?.results ?? [];
    if (gradeFilter === "all") return results;
    return results.filter((t) => t.grade === gradeFilter);
  }, [data, gradeFilter]);

  const handleCreate = (values: TimberLogEntryFormValues) => {
    createMutation.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast.success("Timber log entry created");
          setCreateOpen(false);
          invalidate();
        },
        onError: () => toast.error("Failed to create entry"),
      },
    );
  };

  const handleUpdate = (values: TimberLogEntryFormValues) => {
    if (!editItem) return;
    updateMutation.mutate(
      { id: editItem.id, data: values },
      {
        onSuccess: () => {
          toast.success("Timber log entry updated");
          setEditItem(null);
          invalidate();
        },
        onError: () => toast.error("Failed to update entry"),
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Timber log entry deleted");
          invalidate();
        },
        onError: () => toast.error("Failed to delete entry"),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Trees className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timber Log Entries</h1>
          <p className="text-muted-foreground mt-1">
            Manage timber log entries including tree details, measurements, and grading.
          </p>
        </div>
      </div>

      {!canWrite && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You have read-only access. Contact a committee officer to record or edit entries.
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Timber Log Entries</CardTitle>
            <CardDescription>All recorded timber log entries with details.</CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              placeholder="Search by tree or golia no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48"
              data-testid="input-search"
            />
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-36" data-testid="select-filter-grade">
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="A">Grade A</SelectItem>
                <SelectItem value="B">Grade B</SelectItem>
                <SelectItem value="C">Grade C</SelectItem>
              </SelectContent>
            </Select>
            {canWrite && (
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-add-entry">
                    <Plus className="h-4 w-4 mr-1" /> New Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>New Timber Log Entry</DialogTitle>
                  </DialogHeader>
                  <TimberLogEntryForm
                    onSubmit={handleCreate}
                    isPending={createMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tree No.</TableHead>
                    <TableHead>Golia No.</TableHead>
                    <TableHead>Species</TableHead>
                    <TableHead>Girth (inch)</TableHead>
                    <TableHead>Length (ft)</TableHead>
                    <TableHead>Volume (cu.ft)</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No timber log entries found.
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredResults.map((t) => (
                    <TableRow key={t.id} data-testid={`row-entry-${t.id}`}>
                      <TableCell className="font-medium">{t.tree_no}</TableCell>
                      <TableCell>{t.golia_no}</TableCell>
                      <TableCell>{t.species_name || speciesNameById.get(t.species) || `#${t.species}`}</TableCell>
                      <TableCell>{t.girth_inch}</TableCell>
                      <TableCell>{t.length_feet}</TableCell>
                      <TableCell>{t.volume_cubic_feet}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            t.grade === "A" ? "default" :
                            t.grade === "B" ? "secondary" : "outline"
                          }
                        >
                          {t.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog
                            open={viewItem?.id === t.id}
                            onOpenChange={(open) => !open && setViewItem(null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewItem(t)}
                                data-testid={`button-view-${t.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            {viewItem?.id === t.id && <TimberLogEntryViewDialog entry={t} />}
                          </Dialog>

                          {canWrite && (
                            <>
                              <Dialog
                                open={editItem?.id === t.id}
                                onOpenChange={(open) => !open && setEditItem(null)}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditItem(t)}
                                    data-testid={`button-edit-${t.id}`}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Edit Timber Log Entry</DialogTitle>
                                  </DialogHeader>
                                  <TimberLogEntryForm
                                    defaultValues={t}
                                    onSubmit={handleUpdate}
                                    isPending={updateMutation.isPending}
                                  />
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    data-testid={`button-delete-${t.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently remove the timber log entry for{" "}
                                      <strong>Tree #{t.tree_no}</strong> with{" "}
                                      <strong>Golia #{t.golia_no}</strong>.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(t.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <AppLayout>
        <TimberLogEntriesContent />
      </AppLayout>
    </AuthGuard>
  );
}
