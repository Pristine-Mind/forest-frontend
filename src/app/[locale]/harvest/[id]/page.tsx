"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { use, useState } from "react";
import { Link } from "@/i18n/routing";
import { useRouter } from "@/i18n/routing";
import {
  useGetHarvestRequest,
  useApproveHarvestRequest,
  useRejectHarvestRequest,
  useUpdateHarvestRequest,
  useDeleteHarvestRequest,
} from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

function formatDate(value?: string | null) {
  if (!value) return "N/A";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

function HarvestRequestDetail({ id }: { id: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { can } = useAuthStore();
  const canManage = can(WRITE_ROLES);

  const { data: hr, isLoading } = useGetHarvestRequest(id);
  const approve = useApproveHarvestRequest();
  const reject = useRejectHarvestRequest();
  const update = useUpdateHarvestRequest();
  const remove = useDeleteHarvestRequest();

  const [rejectNotes, setRejectNotes] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editNotes, setEditNotes] = useState("");

  if (isLoading) return <div>Loading...</div>;
  if (!hr) return <div>Harvest request not found.</div>;

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["/api/v1/harvest/requests/"] });
    queryClient.invalidateQueries({ queryKey: [`/api/v1/harvest/requests/${id}/`] });
  }

  function handleApprove() {
    approve.mutate({ id }, {
      onSuccess: () => { toast({ title: "Harvest request approved" }); invalidate(); },
      onError: (error: any) => toast({
        title: "Failed to approve",
        description: error?.response?.data?.detail,
        variant: "destructive",
      }),
    });
  }

  function handleReject() {
    if (!rejectNotes.trim()) {
      toast({ title: "Notes are required to reject a request", variant: "destructive" });
      return;
    }
    reject.mutate({ id, data: { notes: rejectNotes } }, {
      onSuccess: () => { toast({ title: "Harvest request rejected" }); invalidate(); },
      onError: () => toast({ title: "Failed to reject", variant: "destructive" }),
    });
  }

  function handleSaveEdit() {
    update.mutate(
      { id, data: { quantity: editQuantity || undefined, notes: editNotes || undefined } },
      {
        onSuccess: () => { toast({ title: "Harvest request updated" }); invalidate(); },
        onError: () => toast({ title: "Failed to update", variant: "destructive" }),
      }
    );
  }

  function handleDelete() {
    if (!window.confirm("Delete this harvest request? This cannot be undone.")) return;
    remove.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Harvest request deleted" });
        queryClient.invalidateQueries({ queryKey: ["/api/v1/harvest/requests/"] });
        router.push("/harvest");
      },
      onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{hr.species_name}</h1>
          <p className="text-muted-foreground mt-2 capitalize">{hr.source_type.replace("_", " ")}</p>
        </div>
        <Button variant="outline" asChild><Link href="/harvest">Back to Harvest Requests</Link></Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Request Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {hr.source_type === "member_requested" ? "Member" : "Operation"}
              </p>
              <p>{hr.source_type === "member_requested" ? hr.member_name ?? "N/A" : hr.operation_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={STATUS_VARIANT[hr.status] ?? "secondary"} className="capitalize">{hr.status}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Quantity</p>
              <p>{hr.quantity}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Requested Date</p>
              <p>{formatDate(hr.requested_date)}</p>
            </div>
            {hr.approved_by_name && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {hr.status === "rejected" ? "Rejected By" : "Approved By"}
                </p>
                <p>{hr.approved_by_name}</p>
              </div>
            )}
          </div>
          {hr.notes && (
            <div className="pt-2 border-t">
              <p className="text-sm font-medium text-muted-foreground">Notes</p>
              <p>{hr.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {canManage && hr.status === "pending" && (
        <Card>
          <CardHeader><CardTitle>Review Request</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleApprove} disabled={approve.isPending}>
              {approve.isPending ? "Approving..." : "Approve"}
            </Button>
            <div className="space-y-2 pt-2 border-t">
              <Textarea
                placeholder="Reason for rejection (required)"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
              />
              <Button variant="destructive" onClick={handleReject} disabled={reject.isPending}>
                {reject.isPending ? "Rejecting..." : "Reject"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {canManage && hr.status === "pending" && (
        <Card>
          <CardHeader><CardTitle>Edit Quantity / Notes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="number"
              min={0.01}
              step="0.01"
              placeholder={`Current: ${hr.quantity}`}
              value={editQuantity}
              onChange={(e) => setEditQuantity(e.target.value)}
            />
            <Textarea
              placeholder="Update notes"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
            <Button onClick={handleSaveEdit} disabled={update.isPending}>
              {update.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      )}

      {canManage && (
        <Card>
          <CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle></CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleDelete} disabled={remove.isPending}>
              {remove.isPending ? "Deleting..." : "Delete Request"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AuthGuard><AppLayout><HarvestRequestDetail id={Number(id)} /></AppLayout></AuthGuard>;
}
