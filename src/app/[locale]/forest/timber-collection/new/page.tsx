"use client";

import { useRouter } from "@/i18n/routing";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { TimberCollectionForm } from "@/components/forest/TimberCollectionForm";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useListForestBlocks, useListSpecies } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";

/**
 * New Timber Collection Page
 */
function NewTimberCollection() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const { data: blocksData } = useListForestBlocks();
  const { data: speciesData } = useListSpecies();

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8005";
      const response = await fetch(`${apiBaseUrl}/api/v1/forest/timber-collection/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`,
        },
        body: JSON.stringify({
          block: data.block,
          species: data.species,
          wood_volume: parseFloat(data.wood_volume),
          firewood: parseFloat(data.firewood),
        }),
      });
      
      if (!response.ok) throw new Error("Failed to create timber collection");
      
      toast({
        title: "Success",
        description: "Timber collection created successfully",
      });
      
      await queryClient.invalidateQueries({ queryKey: ["/timber-collection/"] });
      router.push("/forest/timber-collection");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create timber collection",
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
              <Link href="/forest/timber-collection">← Back</Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">New Timber Collection</h1>
            <p className="text-muted-foreground mt-2">Record timber collection data</p>
          </div>

          <TimberCollectionForm 
            blocks={blocksData?.results} 
            species={speciesData?.results} 
            onSubmit={handleSubmit} 
            isLoading={isLoading} 
          />
        </div>
      </AuthGuard>
    </AppLayout>
  );
}

export default NewTimberCollection;
