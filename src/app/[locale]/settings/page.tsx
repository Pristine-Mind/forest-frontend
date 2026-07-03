"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  useListPriceRates,
  useCreatePriceRate,
  useUpdatePriceRate,
  useDeletePriceRate,
  useListVisitorFeeRates,
  useCreateVisitorFeeRate,
  useUpdateVisitorFeeRate,
  useDeleteVisitorFeeRate,
  useListFundAllocationRules,
  useCreateFundAllocationRule,
  useUpdateFundAllocationRule,
  useDeleteFundAllocationRule,
  useListBankAccounts,
  useCreateBankAccount,
  useUpdateBankAccount,
  useDeleteBankAccount,
  useListSpecies,
  getListPriceRatesQueryKey,
  getListVisitorFeeRatesQueryKey,
  getListFundAllocationRulesQueryKey,
  getListBankAccountsQueryKey,
  type PriceRate,
  type VisitorFeeRate,
  type FundAllocationRule,
  type BankAccount,
} from "@/lib/api";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Settings2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// ─── Price Rate Form ────────────────────────────────────────────────────────

const priceRateSchema = z.object({
  species: z.coerce.number().min(1, "Species is required"),
  grade: z.string().min(1, "Grade is required"),
  buyer_type: z.enum(["member", "outsider"]),
  rate_per_unit: z.string().min(1, "Rate is required"),
  effective_from: z.string().min(1, "Effective date is required"),
});

type PriceRateFormValues = z.infer<typeof priceRateSchema>;

function PriceRateForm({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues?: Partial<PriceRateFormValues>;
  onSubmit: (data: PriceRateFormValues) => void;
  isPending: boolean;
}) {
  const { data: speciesData } = useListSpecies();
  const form = useForm<PriceRateFormValues>({
    resolver: zodResolver(priceRateSchema),
    defaultValues: {
      species: defaultValues?.species ?? 0,
      grade: defaultValues?.grade ?? "",
      buyer_type: defaultValues?.buyer_type ?? "member",
      rate_per_unit: defaultValues?.rate_per_unit ?? "",
      effective_from: defaultValues?.effective_from ?? new Date().toISOString().slice(0, 10),
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="species"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Species</FormLabel>
              <Select
                value={String(field.value)}
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
          name="grade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grade</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. A, B, C" data-testid="input-grade" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="buyer_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Buyer Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger data-testid="select-buyer-type">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="outsider">Outsider</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rate_per_unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rate per Unit</FormLabel>
              <FormControl>
                <Input {...field} placeholder="0.00" data-testid="input-rate-per-unit" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="effective_from"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Effective From</FormLabel>
              <FormControl>
                <Input {...field} type="date" data-testid="input-effective-from" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full" data-testid="button-save-price-rate">
          {isPending ? "Saving..." : "Save Rate"}
        </Button>
      </form>
    </Form>
  );
}

// ─── Price Rates Tab ────────────────────────────────────────────────────────

function PriceRatesTab({ canWrite }: { canWrite: boolean }) {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<PriceRate | null>(null);

  const { data, isLoading } = useListPriceRates();
  const createMutation = useCreatePriceRate();
  const updateMutation = useUpdatePriceRate();
  const deleteMutation = useDeletePriceRate();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListPriceRatesQueryKey() });

  const handleCreate = (values: PriceRateFormValues) => {
    createMutation.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast.success("Price rate created");
          setCreateOpen(false);
          invalidate();
        },
        onError: () => toast.error("Failed to create price rate"),
      },
    );
  };

  const handleUpdate = (values: PriceRateFormValues) => {
    if (!editItem) return;
    updateMutation.mutate(
      { id: editItem.id, data: { rate_per_unit: values.rate_per_unit, effective_from: values.effective_from } },
      {
        onSuccess: () => {
          toast.success("Price rate updated");
          setEditItem(null);
          invalidate();
        },
        onError: () => toast.error("Failed to update price rate"),
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Price rate deleted");
          invalidate();
        },
        onError: () => toast.error("Failed to delete price rate"),
      },
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Timber Price Rates</CardTitle>
          <CardDescription>
            Per-species, per-grade rates for member and outsider buyers.
          </CardDescription>
        </div>
        {canWrite && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-price-rate">
                <Plus className="h-4 w-4 mr-1" /> Add Rate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Price Rate</DialogTitle>
              </DialogHeader>
              <PriceRateForm
                onSubmit={handleCreate}
                isPending={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Species</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Buyer Type</TableHead>
                <TableHead>Rate / Unit</TableHead>
                <TableHead>Effective From</TableHead>
                {canWrite && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No price rates configured yet.
                  </TableCell>
                </TableRow>
              )}
              {data?.results.map((rate) => (
                <TableRow key={rate.id} data-testid={`row-price-rate-${rate.id}`}>
                  <TableCell className="font-medium">{rate.species_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{rate.grade}</Badge>
                  </TableCell>
                  <TableCell className="capitalize">{rate.buyer_type}</TableCell>
                  <TableCell className="font-mono">Rs. {rate.rate_per_unit}</TableCell>
                  <TableCell>{rate.effective_from}</TableCell>
                  {canWrite && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog
                          open={editItem?.id === rate.id}
                          onOpenChange={(open) => !open && setEditItem(null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditItem(rate)}
                              data-testid={`button-edit-price-rate-${rate.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Price Rate</DialogTitle>
                            </DialogHeader>
                            <PriceRateForm
                              defaultValues={rate}
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
                              data-testid={`button-delete-price-rate-${rate.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Price Rate?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove the rate for{" "}
                                <strong>{rate.species_name}</strong> grade{" "}
                                <strong>{rate.grade}</strong> ({rate.buyer_type}).
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(rate.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Visitor Fee Rates Tab ───────────────────────────────────────────────────

const feeRateSchema = z.object({
  visit_purpose: z.enum(["general_visit", "study_research"]),
  fee_per_visitor_per_day: z.string().min(1, "Fee is required"),
});

type FeeRateFormValues = z.infer<typeof feeRateSchema>;

function VisitorFeeRatesTab({ canWrite }: { canWrite: boolean }) {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<VisitorFeeRate | null>(null);

  const { data, isLoading } = useListVisitorFeeRates();
  const createMutation = useCreateVisitorFeeRate();
  const updateMutation = useUpdateVisitorFeeRate();
  const deleteMutation = useDeleteVisitorFeeRate();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListVisitorFeeRatesQueryKey() });

  const handleCreate = (values: FeeRateFormValues) => {
    createMutation.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast.success("Visitor fee rate created");
          setCreateOpen(false);
          invalidate();
        },
        onError: () => toast.error("Failed to create fee rate"),
      },
    );
  };

  const handleUpdate = (values: FeeRateFormValues) => {
    if (!editItem) return;
    updateMutation.mutate(
      { id: editItem.id, data: { fee_per_visitor_per_day: values.fee_per_visitor_per_day } },
      {
        onSuccess: () => {
          toast.success("Fee rate updated");
          setEditItem(null);
          invalidate();
        },
        onError: () => toast.error("Failed to update fee rate"),
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Fee rate deleted");
          invalidate();
        },
        onError: () => toast.error("Failed to delete fee rate"),
      },
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Visitor Fee Rates</CardTitle>
          <CardDescription>
            Daily fee per visitor for each visit purpose type.
          </CardDescription>
        </div>
        {canWrite && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-visitor-fee-rate">
                <Plus className="h-4 w-4 mr-1" /> Add Rate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Visitor Fee Rate</DialogTitle>
              </DialogHeader>
              <FeeRateForm
                onSubmit={handleCreate}
                isPending={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visit Purpose</TableHead>
                <TableHead>Fee per Visitor / Day</TableHead>
                <TableHead>Last Updated</TableHead>
                {canWrite && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No visitor fee rates configured yet.
                  </TableCell>
                </TableRow>
              )}
              {data?.results.map((rate) => (
                <TableRow key={rate.id} data-testid={`row-visitor-fee-rate-${rate.id}`}>
                  <TableCell className="font-medium capitalize">
                    {rate.visit_purpose.replace("_", " ")}
                  </TableCell>
                  <TableCell className="font-mono">Rs. {rate.fee_per_visitor_per_day}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{rate.updated_at?.slice(0, 10)}</TableCell>
                  {canWrite && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog
                          open={editItem?.id === rate.id}
                          onOpenChange={(open) => !open && setEditItem(null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditItem(rate)}
                              data-testid={`button-edit-visitor-fee-rate-${rate.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Visitor Fee Rate</DialogTitle>
                            </DialogHeader>
                            <FeeRateForm
                              defaultValues={rate}
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
                              data-testid={`button-delete-visitor-fee-rate-${rate.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Fee Rate?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Remove the fee rate for{" "}
                                <strong>{rate.visit_purpose.replace("_", " ")}</strong>?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(rate.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function FeeRateForm({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues?: Partial<FeeRateFormValues>;
  onSubmit: (data: FeeRateFormValues) => void;
  isPending: boolean;
}) {
  const form = useForm<FeeRateFormValues>({
    resolver: zodResolver(feeRateSchema),
    defaultValues: {
      visit_purpose: defaultValues?.visit_purpose ?? "general_visit",
      fee_per_visitor_per_day: defaultValues?.fee_per_visitor_per_day ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="visit_purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visit Purpose</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger data-testid="select-visit-purpose">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="general_visit">General Visit</SelectItem>
                  <SelectItem value="study_research">Study / Research</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fee_per_visitor_per_day"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fee per Visitor per Day (Rs.)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="0.00" data-testid="input-fee-per-visitor" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full" data-testid="button-save-fee-rate">
          {isPending ? "Saving..." : "Save Fee Rate"}
        </Button>
      </form>
    </Form>
  );
}

// ─── Fund Allocation Rules Tab ───────────────────────────────────────────────

const allocationSchema = z.object({
  forest_dev_min_percent: z.string().min(1, "Required"),
  poor_targeted_min_percent: z.string().min(1, "Required"),
  effective_from: z.string().min(1, "Required"),
});

type AllocationFormValues = z.infer<typeof allocationSchema>;

function FundAllocationTab({ canWrite }: { canWrite: boolean }) {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<FundAllocationRule | null>(null);

  const { data, isLoading } = useListFundAllocationRules();
  const createMutation = useCreateFundAllocationRule();
  const updateMutation = useUpdateFundAllocationRule();
  const deleteMutation = useDeleteFundAllocationRule();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListFundAllocationRulesQueryKey() });

  const handleCreate = (values: AllocationFormValues) => {
    createMutation.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast.success("Allocation rule created");
          setCreateOpen(false);
          invalidate();
        },
        onError: () => toast.error("Failed to create rule"),
      },
    );
  };

  const handleUpdate = (values: AllocationFormValues) => {
    if (!editItem) return;
    updateMutation.mutate(
      { id: editItem.id, data: values },
      {
        onSuccess: () => {
          toast.success("Allocation rule updated");
          setEditItem(null);
          invalidate();
        },
        onError: () => toast.error("Failed to update rule"),
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Allocation rule deleted");
          invalidate();
        },
        onError: () => toast.error("Failed to delete rule"),
      },
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Fund Allocation Rules</CardTitle>
          <CardDescription>
            Minimum percentage allocations for forest development and poverty-targeted programs.
          </CardDescription>
        </div>
        {canWrite && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-allocation-rule">
                <Plus className="h-4 w-4 mr-1" /> New Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Allocation Rule</DialogTitle>
              </DialogHeader>
              <AllocationForm
                onSubmit={handleCreate}
                isPending={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Effective From</TableHead>
                <TableHead>Forest Dev. Min %</TableHead>
                <TableHead>Poor-Targeted Min %</TableHead>
                {canWrite && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No allocation rules configured.
                  </TableCell>
                </TableRow>
              )}
              {data?.results.map((rule) => (
                <TableRow key={rule.id} data-testid={`row-allocation-rule-${rule.id}`}>
                  <TableCell className="font-medium">{rule.effective_from}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{rule.forest_dev_min_percent}%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{rule.poor_targeted_min_percent}%</Badge>
                  </TableCell>
                  {canWrite && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog
                          open={editItem?.id === rule.id}
                          onOpenChange={(open) => !open && setEditItem(null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditItem(rule)}
                              data-testid={`button-edit-allocation-rule-${rule.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Allocation Rule</DialogTitle>
                            </DialogHeader>
                            <AllocationForm
                              defaultValues={rule}
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
                              data-testid={`button-delete-allocation-rule-${rule.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Allocation Rule?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Remove the rule effective{" "}
                                <strong>{rule.effective_from}</strong>?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(rule.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function AllocationForm({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues?: Partial<AllocationFormValues>;
  onSubmit: (data: AllocationFormValues) => void;
  isPending: boolean;
}) {
  const form = useForm<AllocationFormValues>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      forest_dev_min_percent: defaultValues?.forest_dev_min_percent ?? "",
      poor_targeted_min_percent: defaultValues?.poor_targeted_min_percent ?? "",
      effective_from: defaultValues?.effective_from ?? new Date().toISOString().slice(0, 10),
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="forest_dev_min_percent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Forest Development Min % of Revenue</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. 25" data-testid="input-forest-dev-percent" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="poor_targeted_min_percent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Poor-Targeted Program Min %</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. 35" data-testid="input-poor-targeted-percent" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="effective_from"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Effective From</FormLabel>
              <FormControl>
                <Input {...field} type="date" data-testid="input-allocation-effective-from" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full" data-testid="button-save-allocation-rule">
          {isPending ? "Saving..." : "Save Rule"}
        </Button>
      </form>
    </Form>
  );
}

// ─── Bank Accounts Tab ───────────────────────────────────────────────────────

const bankAccountSchema = z.object({
  bank_name: z.string().min(1, "Bank name is required"),
  account_number: z.string().min(1, "Account number is required"),
  min_signatures_required: z.coerce.number().min(1, "At least 1 signature required"),
});

type BankAccountFormValues = z.infer<typeof bankAccountSchema>;

function BankAccountsTab({ canWrite }: { canWrite: boolean }) {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<BankAccount | null>(null);

  const { data, isLoading } = useListBankAccounts();
  const createMutation = useCreateBankAccount();
  const updateMutation = useUpdateBankAccount();
  const deleteMutation = useDeleteBankAccount();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListBankAccountsQueryKey() });

  const handleCreate = (values: BankAccountFormValues) => {
    createMutation.mutate(
      { data: { ...values, signatories: [] } },
      {
        onSuccess: () => {
          toast.success("Bank account added");
          setCreateOpen(false);
          invalidate();
        },
        onError: () => toast.error("Failed to add bank account"),
      },
    );
  };

  const handleUpdate = (values: BankAccountFormValues) => {
    if (!editItem) return;
    updateMutation.mutate(
      { id: editItem.id, data: values },
      {
        onSuccess: () => {
          toast.success("Bank account updated");
          setEditItem(null);
          invalidate();
        },
        onError: () => toast.error("Failed to update bank account"),
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Bank account removed");
          invalidate();
        },
        onError: () => toast.error("Failed to remove bank account"),
      },
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Bank Accounts</CardTitle>
          <CardDescription>
            Registered CFUG bank accounts and signatory requirements.
          </CardDescription>
        </div>
        {canWrite && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-bank-account">
                <Plus className="h-4 w-4 mr-1" /> Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Bank Account</DialogTitle>
              </DialogHeader>
              <BankAccountForm
                onSubmit={handleCreate}
                isPending={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bank Name</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Min. Signatures</TableHead>
                {canWrite && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No bank accounts registered yet.
                  </TableCell>
                </TableRow>
              )}
              {data?.results.map((account) => (
                <TableRow key={account.id} data-testid={`row-bank-account-${account.id}`}>
                  <TableCell className="font-medium">{account.bank_name}</TableCell>
                  <TableCell className="font-mono text-sm">{account.account_number}</TableCell>
                  <TableCell>
                    <Badge>{account.min_signatures_required} required</Badge>
                  </TableCell>
                  {canWrite && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog
                          open={editItem?.id === account.id}
                          onOpenChange={(open) => !open && setEditItem(null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditItem(account)}
                              data-testid={`button-edit-bank-account-${account.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Bank Account</DialogTitle>
                            </DialogHeader>
                            <BankAccountForm
                              defaultValues={account}
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
                              data-testid={`button-delete-bank-account-${account.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Bank Account?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Remove <strong>{account.bank_name}</strong> —{" "}
                                <span className="font-mono">{account.account_number}</span>?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(account.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function BankAccountForm({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues?: Partial<BankAccountFormValues>;
  onSubmit: (data: BankAccountFormValues) => void;
  isPending: boolean;
}) {
  const form = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      bank_name: defaultValues?.bank_name ?? "",
      account_number: defaultValues?.account_number ?? "",
      min_signatures_required: defaultValues?.min_signatures_required ?? 2,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="bank_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Nepal Bank Limited" data-testid="input-bank-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="account_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. 0123456789" data-testid="input-account-number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="min_signatures_required"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Signatures Required</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={1}
                  placeholder="2"
                  data-testid="input-min-signatures"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full" data-testid="button-save-bank-account">
          {isPending ? "Saving..." : "Save Account"}
        </Button>
      </form>
    </Form>
  );
}

// ─── Main Settings Page ──────────────────────────────────────────────────────

function Settings() {
  const { can } = useAuthStore();
  const canWrite = can(WRITE_ROLES);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Settings2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure price rates, visitor fees, fund allocation rules, and bank accounts.
          </p>
        </div>
      </div>

      {!canWrite && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You have read-only access. Contact a committee officer to make changes.
        </div>
      )}

      <Tabs defaultValue="price-rates">
        <TabsList className="grid w-full grid-cols-4" data-testid="settings-tabs">
          <TabsTrigger value="price-rates" data-testid="tab-price-rates">Price Rates</TabsTrigger>
          <TabsTrigger value="visitor-fees" data-testid="tab-visitor-fees">Visitor Fees</TabsTrigger>
          <TabsTrigger value="fund-allocation" data-testid="tab-fund-allocation">Fund Allocation</TabsTrigger>
          <TabsTrigger value="bank-accounts" data-testid="tab-bank-accounts">Bank Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="price-rates" className="mt-6">
          <PriceRatesTab canWrite={canWrite} />
        </TabsContent>

        <TabsContent value="visitor-fees" className="mt-6">
          <VisitorFeeRatesTab canWrite={canWrite} />
        </TabsContent>

        <TabsContent value="fund-allocation" className="mt-6">
          <FundAllocationTab canWrite={canWrite} />
        </TabsContent>

        <TabsContent value="bank-accounts" className="mt-6">
          <BankAccountsTab canWrite={canWrite} />
        </TabsContent>
      </Tabs>
    </div>
  );
}


export default function Page() {
  return <AuthGuard><AppLayout><Settings /></AppLayout></AuthGuard>;
}
