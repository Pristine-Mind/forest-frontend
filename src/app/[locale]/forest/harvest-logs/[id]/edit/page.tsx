"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { HarvestLogForm } from "@/components/forest/HarvestLogForm";
import { useToast } from "@/hooks/use-toast";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Edit Harvest Log Page
 */
function EditHarvestLog({
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
        const response = await fetch(`${apiBaseUrl}/api/v1/forest/harvest-logs/${id}/`, {
          headers: {
            "Authorization": `Token ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch harvest log");
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        toast({
          title: "Error",
          description: err?.message || "Failed to load harvest log",
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
      const response = await fetch(`${apiBaseUrl}/api/v1/forest/harvest-logs/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`,
        },
        body: JSON.stringify({
          tree_record: formData.tree_record,
          harvest_date: formData.harvest_date,
          harvest_quantity_cubic_m: parseFloat(formData.harvest_quantity_cubic_m),
          reference_harvest_request: formData.reference_harvest_request,
          notes: formData.notes,
        }),
      });

      if (!response.ok) throw new Error("Failed to update harvest log");

      toast({
        title: "Success",
        description: "Harvest log updated successfully",
      });

      await queryClient.invalidateQueries({ queryKey: ["/harvest-logs/"] });
      router.push(`/forest/harvest-logs/${id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update harvest log",
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
              <Link href={`/forest/harvest-logs/${id}`}>← Back</Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Edit Harvest Log</h1>
            <p className="text-muted-foreground mt-2">Update harvest log information</p>
          </div>

          <HarvestLogForm onSubmit={handleSubmit} isLoading={isSaving} initialData={data} />
        </div>
      </AuthGuard>
    </AppLayout>
  );
}

export default EditHarvestLog;
