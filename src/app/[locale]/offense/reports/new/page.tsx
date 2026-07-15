"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
import { useCreateOffenseReport } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import MemberSelect from "@/components/members/MemberSelect";

const formSchema = z.object({
  accused_name: z.string().min(1, "Accused name is required"),
  offense_type: z.string().min(1, "Offense type is required"),
  description: z.string().min(1, "Description is required"),
  report_date: z.string().min(1, "Report date is required"),
  status: z.enum(["reported", "investigating", "resolved", "escalated_to_court"]),
  damage_value: z.string().refine((v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0), "Must be 0 or greater"),
  fine_amount: z.string().refine((v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0), "Must be 0 or greater"),
  reported_by: z.string().optional(),
  informant: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function FileOffenseReport() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createReport = useCreateOffenseReport();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accused_name: "",
      offense_type: "",
      description: "",
      report_date: new Date().toISOString().split("T")[0],
      status: "reported",
      damage_value: "",
      fine_amount: "",
      reported_by: "",
      informant: "",
    },
  });

  function onSubmit(values: FormValues) {
    createReport.mutate(
      {
        data: {
          accused_name: values.accused_name,
          offense_type: values.offense_type,
          description: values.description,
          report_date: values.report_date,
          status: values.status,
          damage_value: values.damage_value || null,
          fine_amount: values.fine_amount || null,
          reported_by: values.reported_by ? Number(values.reported_by) : null,
          informant: values.informant ? Number(values.informant) : null,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Offense report filed" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/offense/reports/"] });
          router.push("/offense/reports");
        },
        onError: () => {
          toast({ title: "Failed to file offense report", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">File Offense Report</h1>
        <p className="text-muted-foreground mt-2">Record a new forest offense or violation.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Report Details</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="accused_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accused Name</FormLabel>
                    <FormControl><Input placeholder="e.g. Ram Bahadur" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="offense_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Offense Type</FormLabel>
                      <FormControl><Input placeholder="e.g. Illegal logging" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="report_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="Describe the incident" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="damage_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Damage Value (optional)</FormLabel>
                      <FormControl><Input type="number" min={0} step="0.01" inputMode="decimal" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fine_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fine Amount (optional)</FormLabel>
                      <FormControl><Input type="number" min={0} step="0.01" inputMode="decimal" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="reported_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reported By (optional)</FormLabel>
                      <FormControl>
                        <MemberSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select member who reported"
                          allowClear
                          clearLabel="Unknown"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="informant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Informant (optional)</FormLabel>
                      <FormControl>
                        <MemberSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select informant"
                          allowClear
                          clearLabel="Unknown"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={createReport.isPending}>
                  {createReport.isPending ? "Filing..." : "File Report"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/offense/reports")}>Cancel</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><FileOffenseReport /></AppLayout></AuthGuard>;
}
