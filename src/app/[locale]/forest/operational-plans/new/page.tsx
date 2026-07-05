"use client";

import { useRouter } from "@/i18n/routing";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { OperationalPlanForm } from "@/components/forest/OperationalPlanForm";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useCreateOperationalPlan } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

/**
 * New Operational Plan Page
 */
function NewOperationalPlan() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  const createMutation = useCreateOperationalPlan();

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      await createMutation.mutateAsync({
        data: {
          valid_from: data.valid_from,
          valid_to: data.valid_to,
          approved_harvest_limit: data.approved_harvest_limit,
          description: data.description,
        },
      });
      
      toast({
        title: "Success",
        description: "Operational plan created successfully",
      });
      
      await queryClient.invalidateQueries({ queryKey: ["/api/forest/operational-plans/"] });
      router.push("/forest/operational-plans");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create operational plan",
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
              <Link href="/forest/operational-plans">← Back</Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">New Operational Plan</h1>
            <p className="text-muted-foreground mt-2">Create a new forest management plan</p>
          </div>

          <OperationalPlanForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </AuthGuard>
    </AppLayout>
  );
}

export default NewOperationalPlan;
