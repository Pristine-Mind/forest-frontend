"use client";

import { useRouter } from "@/i18n/routing";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { WildlifeSpeciesForm } from "@/components/forest/WildlifeSpeciesForm";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";

/**
 * New Wildlife Species Page
 */
function NewWildlifeSpecies() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8005";
      const response = await fetch(`${apiBaseUrl}/api/v1/forest/wildlife-species/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error("Failed to create wildlife species");
      
      toast({
        title: "Success",
        description: "Wildlife species created successfully",
      });
      
      await queryClient.invalidateQueries({ queryKey: ["/wildlife-species/"] });
      router.push("/forest/wildlife-species");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create wildlife species",
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
              <Link href="/forest/wildlife-species">← Back</Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">New Wildlife Species</h1>
            <p className="text-muted-foreground mt-2">Register a new wildlife species</p>
          </div>

          <WildlifeSpeciesForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </AuthGuard>
    </AppLayout>
  );
}

export default NewWildlifeSpecies;
