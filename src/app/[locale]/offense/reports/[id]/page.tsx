"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { use, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { useRouter } from "@/i18n/routing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetOffenseReport,
  useUpdateOffenseReport,
  useDeleteOffenseReport,
  useResolveOffenseReport,
  useListUsers,
} from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  reported: "destructive",
  investigating: "default",
  resolved: "secondary",
  escalated_to_court: "outline",
};

const updateSchema = z.object({
  status: z.enum(["reported", "investigating", "resolved", "escalated_to_court"]),
  damage_value: z.string().refine((v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0), "Must be 0 or greater"),
  fine_amount: z.string().refine((v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0), "Must be 0 or greater"),
});

type UpdateFormValues = z.infer<typeof updateSchema>;

const resolveSchema = z.object({
  resolution: z.enum(["fine_paid", "escalated", "dismissed"]),
  informant_id: z.string().optional(),
});

type ResolveFormValues = z.infer<typeof resolveSchema>;

function displayUserName(u: { first_name?: string; last_name?: string; email: string }) {
  return u.first_name || u.last_name ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() : u.email;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function OffenseReportDetail({ id }: { id: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { can } = useAuthStore();
  const canWrite = can(WRITE_ROLES);

  const { data: report, isLoading } = useGetOffenseReport(id);
  const updateReport = useUpdateOffenseReport();
  const deleteReport = useDeleteOffenseReport();
  const resolveReport = useResolveOffenseReport();
  const { data: users } = useListUsers({ limit: 200 });

  const updateForm = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: { status: "reported", damage_value: "", fine_amount: "" },
  });

  const resolveForm = useForm<ResolveFormValues>({
    resolver: zodResolver(resolveSchema),
    defaultValues: { resolution: "fine_paid", informant_id: "" },
  });

  useEffect(() => {
    if (report) {
      updateForm.reset({
        status: report.status,
        damage_value: report.damage_value ?? "",
        fine_amount: report.fine_amount ?? "",
      });
    }
  }, [report, updateForm]);

  if (isLoading) return <div>Loading...</div>;
  if (!report) return <div>Offense report not found.</div>;

  function onUpdateSubmit(values: UpdateFormValues) {
    updateReport.mutate(
      {
        id,
        data: {
          status: values.status,
          damage_value: values.damage_value || null,
          fine_amount: values.fine_amount || null,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Offense report updated" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/offense/reports/"] });
          queryClient.invalidateQueries({ queryKey: [`/api/v1/offense/reports/${id}/`] });
        },
        onError: () => {
          toast({ title: "Failed to update report", variant: "destructive" });
        },
      }
    );
  }

  function onResolveSubmit(values: ResolveFormValues) {
    resolveReport.mutate(
      {
        id,
        data: {
          resolution: values.resolution,
          informant_id: values.informant_id ? Number(values.informant_id) : null,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Offense resolved" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/offense/reports/"] });
          queryClient.invalidateQueries({ queryKey: [`/api/v1/offense/reports/${id}/`] });
        },
        onError: () => {
          toast({ title: "Failed to resolve offense", variant: "destructive" });
        },
      }
    );
  }

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this offense report?")) return;
    deleteReport.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Offense report deleted" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/offense/reports/"] });
          router.push("/offense/reports");
        },
        onError: () => {
          toast({ title: "Failed to delete report", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report #{report.id}</h1>
          <p className="text-muted-foreground mt-2">{report.accused_name}</p>
        </div>
        <Button variant="outline" asChild><Link href="/offense/reports">Back to Reports</Link></Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Incident Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Accused</p>
              <p>{report.accused_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <p>{report.offense_type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Report Date</p>
              <p>{formatDate(report.report_date)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={STATUS_VARIANT[report.status] ?? "secondary"} className="capitalize whitespace-nowrap mt-1">
                {report.status.replace(/_/g, " ")}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Damage Value</p>
              <p className="font-mono">{report.damage_value ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fine Amount</p>
              <p className="font-mono">{report.fine_amount ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resolution</p>
              <p className="capitalize">{report.resolution?.replace(/_/g, " ") ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Evidence / Hearings</p>
              <p>{report.evidence_count ?? 0} / {report.hearings_count ?? 0}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p>{report.description}</p>
            </div>
          </div>

          {canWrite && (
            <div className="border-t pt-6 space-y-6">
              <Form {...updateForm}>
                <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
                  <h3 className="text-lg font-medium">Update Report</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={updateForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="reported">Reported</SelectItem>
                              <SelectItem value="investigating">Investigating</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="escalated_to_court">Escalated to Court</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={updateForm.control}
                      name="damage_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Damage Value</FormLabel>
                          <FormControl><Input type="number" min={0} step="0.01" inputMode="decimal" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={updateForm.control}
                      name="fine_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fine Amount</FormLabel>
                          <FormControl><Input type="number" min={0} step="0.01" inputMode="decimal" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit" disabled={updateReport.isPending}>
                      {updateReport.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteReport.isPending}>
                      {deleteReport.isPending ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </form>
              </Form>

              <Form {...resolveForm}>
                <form onSubmit={resolveForm.handleSubmit(onResolveSubmit)} className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-medium">Resolve Offense</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={resolveForm.control}
                      name="resolution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resolution</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="fine_paid">Fine Paid</SelectItem>
                              <SelectItem value="escalated">Escalated</SelectItem>
                              <SelectItem value="dismissed">Dismissed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={resolveForm.control}
                      name="informant_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Informant Reward (optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select informant" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="">No informant</SelectItem>
                              {users?.results.map((u) => (
                                <SelectItem key={u.id} value={String(u.id)}>{displayUserName(u)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={resolveReport.isPending}>
                    {resolveReport.isPending ? "Resolving..." : "Resolve"}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AuthGuard>
      <AppLayout>
        <OffenseReportDetail id={Number(id)} />
      </AppLayout>
    </AuthGuard>
  );
}
