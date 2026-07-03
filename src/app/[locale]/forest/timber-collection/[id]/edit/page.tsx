"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { TimberCollectionForm } from "@/components/forest/TimberCollectionForm";
import { useToast } from "@/hooks/use-toast";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useListForestBlocks, useListSpecies } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Edit Timber Collection Page
 */
function EditTimberCollection({
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
  const [data, setData] = useState<any>(null);

  const { data: blocksData } = useListForestBlocks();
  const { data: speciesData } = useListSpecies();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8005";
        const response = await fetch(`${apiBaseUrl}/api/v1/forest/timber-collection/${id}/`, {
          headers: {
            "Authorization": `Token ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch timber collection");
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        toast({
          title: "Error",
          description: err?.message || "Failed to load timber collection",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    if (id && token) fetchData();
  }, [id, token, toast]);

  const handleSubmit = async (formData: any) => {
    try {
      setIsSaving(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8005";
      const response = await fetch(`${apiBaseUrl}/api/v1/forest/timber-collection/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`,
        },
        body: JSON.stringify({
          block: formData.block,
          species: formData.species,
          wood_volume: parseFloat(formData.wood_volume),
          firewood: parseFloat(formData.firewood),
        }),
      });

      if (!response.ok) throw new Error("Failed to update timber collection");

      toast({
        title: "Success",
        description: "Timber collection updated successfully",
      });

      await queryClient.invalidateQueries({ queryKey: ["/timber-collection/"] });
      router.push(`/forest/timber-collection/${id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update timber collection",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <AppLayout><div>Loading...</div></AppLayout>;
  if (!data) return <AppLayout><div>Not found</div></AppLayout>;

  return (
    <AppLayout>
      <AuthGuard>
        <div className="space-y-8 max-w-2xl">
          <div>
            <Button variant="ghost" asChild className="mb-4">
              <Link href={`/forest/timber-collection/${id}`}>← Back</Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Edit Timber Collection</h1>
            <p className="text-muted-foreground mt-2">Update timber collection data</p>
          </div>

          <TimberCollectionForm
            blocks={blocksData?.results ?? []}
            species={speciesData?.results ?? []}
            onSubmit={handleSubmit}
            isLoading={isSaving}
            initialData={data}
          />
        </div>
      </AuthGuard>
    </AppLayout>
  );
}

export default EditTimberCollection;
