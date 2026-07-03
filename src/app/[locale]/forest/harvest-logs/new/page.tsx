"use client";

import { useRouter } from "@/i18n/routing";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { HarvestLogForm } from "@/components/forest/HarvestLogForm";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";

/**
 * New Harvest Log Page
 */
function NewHarvestLog() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8005";
      const response = await fetch(`${apiBaseUrl}/api/v1/forest/harvest-logs/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`,
        },
        body: JSON.stringify({
          tree_record: data.tree_record,
          harvest_date: data.harvest_date,
          harvest_quantity_cubic_m: parseFloat(data.harvest_quantity_cubic_m),
          reference_harvest_request: data.reference_harvest_request,
          notes: data.notes,
        }),
      });
      
      if (!response.ok) throw new Error("Failed to create harvest log");
      
      toast({
        title: "Success",
        description: "Harvest log created successfully",
      });
      
      await queryClient.invalidateQueries({ queryKey: ["/harvest-logs/"] });
      router.push("/forest/harvest-logs");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create harvest log",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <AuthGuard>
        <div className="space-y-8 max-w-2xl">
          <div>
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/forest/harvest-logs">← Back</Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">New Harvest Log</h1>
            <p className="text-muted-foreground mt-2">Record a tree harvest</p>
          </div>

          <HarvestLogForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </AuthGuard>
    </AppLayout>
  );
}

export default NewHarvestLog;
