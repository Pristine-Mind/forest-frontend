"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { WildlifeSpeciesForm } from "@/components/forest/WildlifeSpeciesForm";
import { useToast } from "@/hooks/use-toast";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Edit Wildlife Species Page
 */
function EditWildlifeSpecies({
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8005";
        const response = await fetch(`${apiBaseUrl}/api/v1/forest/wildlife-species/${id}/`, {
          headers: {
            "Authorization": `Token ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch wildlife species");
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        toast({
          title: "Error",
          description: err?.message || "Failed to load wildlife species",
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
      const response = await fetch(`${apiBaseUrl}/api/v1/forest/wildlife-species/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update wildlife species");

      toast({
        title: "Success",
        description: "Wildlife species updated successfully",
      });

      await queryClient.invalidateQueries({ queryKey: ["/wildlife-species/"] });
      router.push(`/forest/wildlife-species/${id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update wildlife species",
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
              <Link href={`/forest/wildlife-species/${id}`}>← Back</Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Edit Wildlife Species</h1>
            <p className="text-muted-foreground mt-2">Update wildlife species information</p>
          </div>

          <WildlifeSpeciesForm onSubmit={handleSubmit} isLoading={isSaving} initialData={data} />
        </div>
      </AuthGuard>
    </AppLayout>
  );
}

export default EditWildlifeSpecies;
