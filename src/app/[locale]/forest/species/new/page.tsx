"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useRouter } from "@/i18n/routing";
import { useCreateSpecies } from "@/lib/api";
import { SpeciesForm } from "@/components/forest/SpeciesForm";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

function SpeciesNew() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createSpecies = useCreateSpecies();

  const handleSubmit = async (data: any) => {
    createSpecies.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Species added successfully" });
        queryClient.invalidateQueries({ queryKey: ["/api/v1/forest/species/"] });
        router.push("/forest");
      },
      onError: (error: any) => {
        const detail = error?.response?.data?.species_name?.[0];
        toast({
          title: "Failed to add species",
          description: detail ?? "Please check the form and try again.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/forest">← Back</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Species</h1>
        <p className="text-muted-foreground mt-2">Register a new tree species with scientific and local names.</p>
      </div>

      <SpeciesForm
        onSubmit={handleSubmit}
        isLoading={createSpecies.isPending}
      />
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><SpeciesNew /></AppLayout></AuthGuard>;
}