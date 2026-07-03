"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { use, useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { useRouter } from "@/i18n/routing";
import {
  useGetCommitteeMember,
  useUpdateCommitteeMember,
  useDeleteCommitteeMember,
} from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const POSITION_LABELS: Record<string, string> = {
  chair: "अध्यक्ष — Chair",
  vice_chair: "उपाध्यक्ष — Vice Chair",
  secretary: "सचिव — Secretary",
  joint_secretary: "सह-सचिव — Joint Secretary",
  treasurer: "कोषाध्यक्ष — Treasurer",
  member: "सदस्य — Member",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  active: "default",
  vacant: "secondary",
  removed: "destructive",
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function CommitteeMemberDetail({ id }: { id: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { can } = useAuthStore();
  const canWrite = can(WRITE_ROLES);

  const { data: cm, isLoading } = useGetCommitteeMember(id);
  const updateMember = useUpdateCommitteeMember();
  const deleteMember = useDeleteCommitteeMember();

  const [position, setPosition] = useState<string>("member");
  const [status, setStatus] = useState<string>("active");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Update state when data loads
  useEffect(() => {
    if (cm && !isInitialized) {
      console.log("Setting position to:", cm.position);
      console.log("Setting status to:", cm.status);
      setPosition(cm.position);
      setStatus(cm.status);
      setIsInitialized(true);
    }
  }, [cm, isInitialized]);

  if (isLoading) return <div>Loading...</div>;
  if (!cm) return <div>Committee member not found.</div>;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    
    updateMember.mutate(
      { id, data: { position: position as any, status: status as any } },
      {
        onSuccess: () => {
          toast({ title: "Committee member updated" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/governance/committee-members/"] });
          queryClient.invalidateQueries({ queryKey: [`/api/v1/governance/committee-members/${id}/`] });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/governance/committee-members/quota_status/"] });
          setIsSubmitting(false);
        },
        onError: () => {
          toast({ title: "Failed to update committee member", variant: "destructive" });
          setIsSubmitting(false);
        },
      }
    );
  }

  function handleDelete() {
    if (!confirm("Are you sure you want to remove this committee member?")) return;
    deleteMember.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Committee member removed" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/governance/committee-members/"] });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/governance/committee-members/quota_status/"] });
          router.push("/governance/committee-members");
        },
        onError: () => {
          toast({ title: "Failed to remove committee member", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{cm.member_name}</h1>
          <p className="text-muted-foreground mt-2">{POSITION_LABELS[cm.position] ?? cm.position}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/governance/committee-members">Back to Members</Link>
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Member Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gender</p>
              <p className="capitalize">{cm.gender}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Caste / Ethnicity</p>
              <p>{cm.caste_ethnicity || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Term Start</p>
              <p>{formatDate(cm.term_start)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Term End</p>
              <p>{formatDate(cm.term_end)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={STATUS_VARIANT[cm.status] ?? "secondary"} className="capitalize">
                {cm.status}
              </Badge>
            </div>
          </div>

          {canWrite && (
            <form onSubmit={handleSubmit} className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium">Update Position / Status</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Position (पद)</label>
                <Select 
                  value={position} 
                  onValueChange={(value) => {
                    // Only update if value is not empty
                    if (value && value.trim() !== "") {
                      console.log("Position changed to:", value);
                      setPosition(value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(POSITION_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={status} 
                  onValueChange={(value) => {
                    // Only update if value is not empty
                    if (value && value.trim() !== "") {
                      console.log("Status changed to:", value);
                      setStatus(value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="vacant">Vacant</SelectItem>
                    <SelectItem value="removed">Removed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete} 
                  disabled={deleteMember.isPending}
                >
                  {deleteMember.isPending ? "Removing..." : "Remove"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AuthGuard>
      <AppLayout>
        <CommitteeMemberDetail id={Number(id)} />
      </AppLayout>
    </AuthGuard>
  );
}
