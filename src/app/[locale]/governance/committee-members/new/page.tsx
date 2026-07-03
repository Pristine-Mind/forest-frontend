"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
import { useCreateCommitteeMember, useListMembers } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  member: z.string().min(1, "Member is required"),
  position: z.enum(["chair", "vice_chair", "secretary", "joint_secretary", "treasurer", "member"]),
  gender: z.string().min(1, "Gender is required"),
  caste_ethnicity: z.string().optional(),
  term_start: z.string().min(1, "Term start is required"),
  term_end: z.string().min(1, "Term end is required"),
  status: z.enum(["active", "vacant", "removed"]),
}).refine((data) => data.term_end >= data.term_start, {
  message: "Term end must be on or after term start",
  path: ["term_end"],
});

type FormValues = z.infer<typeof formSchema>;

function AddCommitteeMember() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMember = useCreateCommitteeMember();
  const { data: members } = useListMembers({ membership_status: "active", limit: 100 });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      member: "",
      position: "member",
      gender: "",
      caste_ethnicity: "",
      term_start: "",
      term_end: "",
      status: "active",
    },
  });

  function onSubmit(values: FormValues) {
    createMember.mutate(
      {
        data: {
          member: Number(values.member),
          position: values.position,
          gender: values.gender,
          caste_ethnicity: values.caste_ethnicity || undefined,
          term_start: values.term_start,
          term_end: values.term_end,
          status: values.status,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Committee member added" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/governance/committee-members/"] });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/governance/committee-members/quota_status/"] });
          router.push("/governance/committee-members");
        },
        onError: () => {
          toast({ title: "Failed to add committee member", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Committee Member</h1>
        <p className="text-muted-foreground mt-2">Assign a member to a committee position.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Member Details</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="member"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {members?.results.map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>{m.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="chair">Chair</SelectItem>
                        <SelectItem value="vice_chair">Vice Chair</SelectItem>
                        <SelectItem value="secretary">Secretary</SelectItem>
                        <SelectItem value="joint_secretary">Joint Secretary</SelectItem>
                        <SelectItem value="treasurer">Treasurer</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caste_ethnicity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caste / Ethnicity</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select caste / ethnicity" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="brahmin">Brahmin</SelectItem>
                          <SelectItem value="chhetri">Chhetri</SelectItem>
                          <SelectItem value="janajati">Janajati</SelectItem>
                          <SelectItem value="newar">Newar</SelectItem>
                          <SelectItem value="madhesi">Madhesi</SelectItem>
                          <SelectItem value="dalit">Dalit</SelectItem>
                          <SelectItem value="muslim">Muslim</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="term_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Term Start</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="term_end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Term End</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="vacant">Vacant</SelectItem>
                        <SelectItem value="removed">Removed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={createMember.isPending}>
                  {createMember.isPending ? "Adding..." : "Add Member"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/governance/committee-members")}>Cancel</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><AddCommitteeMember /></AppLayout></AuthGuard>;
}
