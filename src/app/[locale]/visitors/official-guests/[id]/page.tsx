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
  useGetOfficialGuest,
  useUpdateOfficialGuest,
  useDeleteOfficialGuest,
} from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
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

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function OfficialGuestDetail({ id }: { id: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { can } = useAuthStore();
  const canWrite = can(WRITE_ROLES);

  const { data: guest, isLoading } = useGetOfficialGuest(id);
  const updateGuest = useUpdateOfficialGuest();
  const deleteGuest = useDeleteOfficialGuest();

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

  useEffect(() => {
    if (guest) {
      form.reset({
        visitor_name: guest.visitor_name,
        designation: guest.designation,
        visit_start_date: guest.visit_start_date,
        visit_end_date: guest.visit_end_date,
        comments_or_guidance: guest.comments_or_guidance ?? "",
      });
    }
  }, [guest, form]);

  if (isLoading) return <div>Loading...</div>;
  if (!guest) return <div>Official guest not found.</div>;

  function onSubmit(values: FormValues) {
    updateGuest.mutate(
      {
        id,
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
          toast({ title: "Official guest updated" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/visitors/official-guests/"] });
          queryClient.invalidateQueries({ queryKey: [`/api/v1/visitors/official-guests/${id}/`] });
        },
        onError: () => {
          toast({ title: "Failed to update official guest", variant: "destructive" });
        },
      }
    );
  }

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this official guest record?")) return;
    deleteGuest.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Official guest deleted" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/visitors/official-guests/"] });
          router.push("/visitors/official-guests");
        },
        onError: () => {
          toast({ title: "Failed to delete official guest", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{guest.visitor_name}</h1>
          <p className="text-muted-foreground mt-2">{guest.designation}</p>
        </div>
        <Button variant="outline" asChild><Link href="/visitors/official-guests">Back to Guests</Link></Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Guest Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Visit Start</p>
              <p>{formatDate(guest.visit_start_date)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Visit End</p>
              <p>{formatDate(guest.visit_end_date)}</p>
            </div>
            {guest.comments_or_guidance && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Comments / Guidance</p>
                <p>{guest.comments_or_guidance}</p>
              </div>
            )}
          </div>

          {canWrite && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-medium">Edit Details</h3>
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
                  <Button type="submit" disabled={updateGuest.isPending}>
                    {updateGuest.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteGuest.isPending}>
                    {deleteGuest.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </form>
            </Form>
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
        <OfficialGuestDetail id={Number(id)} />
      </AppLayout>
    </AuthGuard>
  );
}
