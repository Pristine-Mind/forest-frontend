"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
import { useCreatePatrolLog, useListUsers, useListOffenseReports } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  watcher: z.string().min(1, "Watcher is required"),
  patrol_date: z.string().min(1, "Patrol date is required"),
  notes: z.string().optional(),
  offense: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function displayUserName(u: { first_name?: string; last_name?: string; email: string }) {
  return u.first_name || u.last_name ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() : u.email;
}

function LogPatrol() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createLog = useCreatePatrolLog();
  const { data: users } = useListUsers({ limit: 200 });
  const { data: offenses } = useListOffenseReports({ limit: 100 });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      watcher: "",
      patrol_date: new Date().toISOString().split("T")[0],
      notes: "",
      offense: "",
    },
  });

  function onSubmit(values: FormValues) {
    createLog.mutate(
      {
        data: {
          watcher: Number(values.watcher),
          patrol_date: values.patrol_date,
          notes: values.notes || undefined,
          offense: values.offense ? Number(values.offense) : null,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Patrol log recorded" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/offense/patrol-logs/"] });
          router.push("/offense/patrol-logs");
        },
        onError: () => {
          toast({ title: "Failed to record patrol log", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Log Patrol</h1>
        <p className="text-muted-foreground mt-2">Record a patrol round and any observations.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Patrol Details</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="watcher"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Watcher</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select watcher" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {users?.results.map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>{displayUserName(u)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patrol_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patrol Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="offense"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Linked Offense (optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select offense" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {offenses?.results.map((o) => (
                          <SelectItem key={o.id} value={String(o.id)}>#{o.id} — {o.accused_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl><Textarea placeholder="Observations during patrol" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={createLog.isPending}>
                  {createLog.isPending ? "Saving..." : "Log Patrol"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/offense/patrol-logs")}>Cancel</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><LogPatrol /></AppLayout></AuthGuard>;
}
