"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { TreeCountForm } from "@/components/forest/TreeCountForm";
import { useToast } from "@/hooks/use-toast";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { useGetTreeCount, useUpdateTreeCount, useListForestBlocks, useListSpecies } from "@/lib/api";

/**
 * Edit Tree Count Page
 */
function EditTreeCount({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { data } = useGetTreeCount(Number(id));
  const updateTreeCount = useUpdateTreeCount();
  const { data: blocksData } = useListForestBlocks();
  const { data: speciesData } = useListSpecies();

  const handleSubmit = async (formData: any) => {
    try {
      setIsSaving(true);
      updateTreeCount.mutate(
        {
          id: Number(id),
          data: formData,
        },
        {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Tree count updated successfully",
            });
            queryClient.invalidateQueries({ queryKey: ["/tree-counts/"] });
            router.push(`/forest/tree-counts/${id}`);
          },
          onError: (error: any) => {
            toast({
              title: "Error",
              description: error?.message || "Failed to update tree count",
              variant: "destructive",
            });
          },
        }
      );
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (data) {
      setIsLoading(false);
    }
  }, [data]);

  if (isLoading) return <AppLayout><div>Loading...</div></AppLayout>;
  if (!data) return <AppLayout><div>Not found</div></AppLayout>;

  return (
    <AppLayout>
      <AuthGuard>
        <div className="space-y-8 max-w-3xl">
          <div>
            <Button variant="ghost" asChild className="mb-4">
              <Link href={`/forest/tree-counts/${id}`}>← Back</Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Edit Tree Count</h1>
            <p className="text-muted-foreground mt-2">Update tree measurements and classification</p>
          </div>

          <TreeCountForm
            initialData={data}
            blocks={blocksData?.results ?? []}
            species={speciesData?.results ?? []}
            onSubmit={handleSubmit}
            isLoading={isSaving}
          />
        </div>
      </AuthGuard>
    </AppLayout>
  );
}

export default EditTreeCount;
