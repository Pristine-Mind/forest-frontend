"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useRouter } from "@/i18n/routing";
import { useCreateTreeCount, useListSpecies, useListForestBlocks } from "@/lib/api";
import { TreeCountForm } from "@/components/forest/TreeCountForm";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

function TreeCountNew() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createTreeCount = useCreateTreeCount();
  const { data: speciesData } = useListSpecies({ limit: 100 });
  const { data: blocksData } = useListForestBlocks({ limit: 100 });

  const handleSubmit = async (data: any) => {
    createTreeCount.mutate(
      { data },
      {
        onSuccess: () => {
          toast({ title: "Tree count created successfully" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/forest/tree-counts/"] });
          router.push("/forest/tree-counts");
        },
        onError: (error: any) => {
          const detail = error?.response?.data?.non_field_errors?.[0] || error?.response?.data?.detail?.[0];
          toast({
            title: "Failed to create tree count",
            description: detail ?? "Please check the form and try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/forest/tree-counts">← Back</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Tree Count</h1>
        <p className="text-muted-foreground mt-2">Record detailed tree measurements including girth, height, and classification.</p>
      </div>

      <TreeCountForm
        blocks={blocksData?.results ?? []}
        species={speciesData?.results ?? []}
        onSubmit={handleSubmit}
        isLoading={createTreeCount.isPending}
      />
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><TreeCountNew /></AppLayout></AuthGuard>;
}
