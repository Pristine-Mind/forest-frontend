"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { use } from "react";
import { Link } from "@/i18n/routing";
import { useRouter } from "@/i18n/routing";
import { useGetSpecies, useUpdateSpecies } from "@/lib/api";
import { SpeciesForm } from "@/components/forest/SpeciesForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

function SpeciesEdit({ id }: { id: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: species, isLoading } = useGetSpecies(id);
  const updateSpecies = useUpdateSpecies();

  const handleSubmit = async (data: any) => {
    updateSpecies.mutate(
      { id, data },
      {
        onSuccess: () => {
          toast({ title: "Species updated successfully" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/forest/species/"] });
          router.push(`/forest/species/${id}`);
        },
        onError: (error: any) => {
          const detail = error?.response?.data?.species_name?.[0];
          toast({
            title: "Failed to update species",
            description: detail ?? "Please check the form and try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (isLoading) return <div>Loading...</div>;
  if (!species) return <div>Species not found.</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/forest/species/${id}`}>← Back</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Species</h1>
        <p className="text-muted-foreground mt-2">Update tree species information</p>
      </div>

      <SpeciesForm
        initialData={species}
        onSubmit={handleSubmit}
        isLoading={updateSpecies.isPending}
      />
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AuthGuard><AppLayout><SpeciesEdit id={Number(id)} /></AppLayout></AuthGuard>;
}
