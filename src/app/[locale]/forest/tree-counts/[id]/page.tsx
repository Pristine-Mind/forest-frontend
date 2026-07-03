"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Link } from "@/i18n/routing";
import { useGetTreeCount, useUpdateTreeCount } from "@/lib/api";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { use, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const adjustSchema = z.object({
  total_count: z.coerce.number().int().min(0, "Must be 0 or greater"),
  adjustment_reason: z
    .string()
    .min(1, "Please explain the reason for this adjustment"),
});

type AdjustValues = z.infer<typeof adjustSchema>;

function formatDateTime(value?: string | null) {
  if (!value) return "N/A";

  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleString();
}

function TreeCountDetail({ id }: { id: number }) {
  const { toast } = useToast();
  const { can } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: treeCount, isLoading } = useGetTreeCount(id);
  const updateTreeCount = useUpdateTreeCount();

  const form = useForm<AdjustValues>({
    resolver: zodResolver(adjustSchema),
    values: {
      total_count: treeCount?.total_count ?? 0,
      adjustment_reason: "",
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!treeCount) {
    return <div>Tree count entry not found.</div>;
  }

  function onSubmit(values: AdjustValues) {
    updateTreeCount.mutate(
      {
        id,
        data: values,
      },
      {
        onSuccess: () => {
          toast({
            title: "Tree count adjusted successfully",
          });

          queryClient.invalidateQueries({
            queryKey: ["/api/v1/forest/tree-counts/"],
          });

          queryClient.invalidateQueries({
            queryKey: [`/api/v1/forest/tree-counts/${id}/`],
          });

          form.resetField("adjustment_reason");
        },
        onError: () => {
          toast({
            title: "Failed to adjust tree count",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {treeCount.species_name}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {treeCount.block_name ?? "All blocks"}
          </p>
        </div>

        <div className="flex gap-2">
          {can(WRITE_ROLES) && (
            <Button asChild>
              <Link href={`/forest/tree-counts/${id}/edit`}>Edit</Link>
            </Button>
          )}

          <Button variant="outline" asChild>
            <Link href="/forest/tree-counts">
              Back to Tree Counts
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Counts</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-semibold">
                  {treeCount.total_count}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Harvested
                </p>
                <p className="text-2xl font-semibold">
                  {treeCount.harvested_count}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Remaining
                </p>
                <p className="text-2xl font-semibold">
                  {treeCount.remaining_count}
                </p>
              </div>
            </div>

            <div className="border-t pt-2">
              <p className="text-sm font-medium text-muted-foreground">
                Last Updated
              </p>
              <p>{formatDateTime(treeCount.last_updated)}</p>
            </div>

            {treeCount.adjustment_reason && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Last Recorded Reason
                </p>
                <p>{treeCount.adjustment_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adjust Baseline Count</CardTitle>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="total_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Total Count</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adjustment_reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Adjustment</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g. Corrected after re-inventory"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={updateTreeCount.isPending}
                >
                  {updateTreeCount.isPending
                    ? "Saving..."
                    : "Apply Adjustment"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adjustment History</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            History tracking isn&apos;t available yet — the backend endpoint
            for it hasn&apos;t been added. This section will list past
            adjustments and harvest-linked changes once that&apos;s in place.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <AuthGuard>
      <AppLayout>
        <TreeCountDetail id={Number(id)} />
      </AppLayout>
    </AuthGuard>
  );
}
