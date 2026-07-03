"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
import { useCreateOfficialGuest } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  visitor_name: z.string().min(1, "Visitor name is required"),
  designation: z.string().min(1, "Designation is required"),
  visit_start_date: z.string().min(1, "Start date is required"),
  visit_end_date: z.string().min(1, "End date is required"),
  comments_or_guidance: z.string().optional(),
}).refine((data) => data.visit_end_date >= data.visit_start_date, {
  message: "End date must be on or after start date",
  path: ["visit_end_date"],
});

type FormValues = z.infer<typeof formSchema>;

function AddOfficialGuest() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createGuest = useCreateOfficialGuest();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visitor_name: "",
      designation: "",
      visit_start_date: "",
      visit_end_date: "",
      comments_or_guidance: "",
    },
  });

  function onSubmit(values: FormValues) {
    createGuest.mutate(
      {
        data: {
          visitor_name: values.visitor_name,
          designation: values.designation,
          visit_start_date: values.visit_start_date,
          visit_end_date: values.visit_end_date,
          comments_or_guidance: values.comments_or_guidance || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Official guest added successfully" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/visitors/official-guests/"] });
          router.push("/visitors/official-guests");
        },
        onError: () => {
          toast({ title: "Failed to add official guest", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Official Guest</h1>
        <p className="text-muted-foreground mt-2">Record a visit by an official or distinguished guest.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Guest Details</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="visitor_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visitor Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="visit_start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visit Start Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="visit_end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visit End Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="comments_or_guidance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comments / Guidance</FormLabel>
                    <FormControl><Textarea placeholder="Notes from the visit" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={createGuest.isPending}>
                  {createGuest.isPending ? "Adding..." : "Add Guest"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/visitors/official-guests")}>Cancel</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><AddOfficialGuest /></AppLayout></AuthGuard>;
}
