"use client";

import { useRouter } from "@/i18n/routing";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { TreeCountForm } from "@/components/forest/TreeCountForm";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useListForestBlocks, useListSpecies, useCreateTreeCount } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

/**
 * New Pole Count Page
 * Uses the same form as TreeCount since they have identical structure
 */
function NewPoleCount() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: blocksData } = useListForestBlocks();
  const { data: speciesData } = useListSpecies();
  const createMutation = useCreateTreeCount();

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      // Using tree count creation - pole counts use same structure
      await createMutation.mutateAsync({
        data: {
          block: parseInt(data.block),
          species: parseInt(data.species),
          plot_number: data.plot_number,
          tree_number: data.tree_number,
          girth_cm: parseFloat(data.girth_cm),
          height_m: parseFloat(data.height_m),
          tree_class: data.tree_class,
          survey_date: data.survey_date,
          is_harvestable: data.is_harvestable === true,
          notes: data.notes,
        },
      });
      
      toast({
        title: "Success",
        description: "Pole count created successfully",
      });
      
      await queryClient.invalidateQueries({ queryKey: ["/api/forest/tree-counts/"] });
      router.push("/forest/pole-counts");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create pole count",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <AuthGuard>
        <div className="space-y-8 max-w-4xl">
          <div>
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/forest/pole-counts">← Back</Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">New Pole Count</h1>
            <p className="text-muted-foreground mt-2">Record pole measurements and inventory</p>
          </div>

          <TreeCountForm 
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

export default NewPoleCount;
