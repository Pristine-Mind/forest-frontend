"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
import { useCreateHarvestRequest, useListMembers, useListSpecies } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z
  .object({
    source_type: z.enum(["member_requested", "forest_initiated"]),
    member: z.string().optional(),
    operation_name: z.string().optional(),
    species: z.string().min(1, "Species is required"),
    quantity: z
      .string()
      .min(1, "Quantity is required")
      .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be a positive number"),
    requested_date: z.string().min(1, "Requested date is required"),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.source_type === "member_requested") {
      if (!data.member) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Member is required", path: ["member"] });
      }
      if (data.operation_name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Operation name must be blank for member-requested harvests",
          path: ["operation_name"],
        });
      }
    } else {
      if (data.member) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Member must be blank for forest-initiated harvests",
          path: ["member"],
        });
      }
      if (!data.operation_name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Operation name is required for forest-initiated harvests",
          path: ["operation_name"],
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

function HarvestRequestNew() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createHarvestRequest = useCreateHarvestRequest();
  const { user } = useAuthStore();
  const isMemberRole = user?.role === "member";

  const { data: members } = useListMembers({ membership_status: "active", limit: 100 });
  const { data: species } = useListSpecies({ limit: 100 });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      source_type: "member_requested",
      member: "",
      operation_name: "",
      species: "",
      quantity: "",
      requested_date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const sourceType = form.watch("source_type");

  function onSubmit(values: FormValues) {
    createHarvestRequest.mutate(
      {
        data: {
          source_type: values.source_type,
          member: !isMemberRole && values.source_type === "member_requested" ? Number(values.member) : undefined,
          operation_name: values.source_type === "forest_initiated" ? values.operation_name : undefined,
          species: Number(values.species),
          quantity: values.quantity,
          requested_date: values.requested_date,
          notes: values.notes || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Harvest request submitted successfully" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/harvest/requests/"] });
          router.push("/harvest");
        },
        onError: (error: any) => {
          const data = error?.response?.data;
          const detail = data?.member?.[0] ?? data?.operation_name?.[0] ?? data?.detail;
          toast({
            title: "Failed to submit harvest request",
            description: detail ?? "Please check the form and try again.",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Harvest Request</h1>
        <p className="text-muted-foreground mt-2">
          {isMemberRole
            ? "Submit a harvest request for your own use."
            : "Submit a member-requested or forest-initiated harvest request."}
        </p>
      </div>
      <Card>
        <CardHeader><CardTitle>Request Details</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!isMemberRole && (
                <FormField control={form.control} name="source_type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="member_requested">Member Requested</SelectItem>
                        <SelectItem value="forest_initiated">Forest Initiated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

              {!isMemberRole && sourceType === "member_requested" && (
                <FormField control={form.control} name="member" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select an active member" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {members?.results.map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>{m.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Only active members can submit harvest requests.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

              {sourceType === "forest_initiated" && (
                <FormField control={form.control} name="operation_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operation Name</FormLabel>
                    <FormControl><Input placeholder="e.g. Block 3 thinning operation" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

              <FormField control={form.control} name="species" render={({ field }) => (
                <FormItem>
                  <FormLabel>Species</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a species" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {species?.results.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.species_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="quantity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl><Input type="number" min={0.01} step="0.01" inputMode="decimal" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="requested_date" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requested Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={createHarvestRequest.isPending}>
                  {createHarvestRequest.isPending ? "Submitting..." : "Submit Request"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/harvest")}>Cancel</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><HarvestRequestNew /></AppLayout></AuthGuard>;
}
