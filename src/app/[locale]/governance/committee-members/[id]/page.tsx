"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { use, useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { useRouter } from "@/i18n/routing";
import { useGetCommitteeMember, useDeleteCommitteeMember } from "@/lib/api";
import { CommitteeMemberForm } from "@/components/forms/CommitteeMemberForm";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuthStore, WRITE_ROLES, APPROVAL_ROLES } from "@/stores/auth-store";
import { getErrorMessage, is403Error, get403ErrorMessage } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@/lib/api/custom-fetch";
import type { CommitteeMemberInput } from "@/schemas/committee-member.schema";

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

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function CommitteeMemberDetail({ id }: { id: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { can } = useAuthStore();
  const canWrite = can(WRITE_ROLES);

  const { data: member, isLoading } = useGetCommitteeMember(id);
  const deleteMember = useDeleteCommitteeMember();
  const [isLoading2, setIsLoading2] = useState(false);

  // Fetch available sub-committees
  const { data: subcommittees = [] } = useQuery({
    queryKey: ['subcommittees'],
    queryFn: async () => {
      try {
        const response = await customFetch<{ results?: Array<{ id: number; name: string }> }>(
          '/api/v1/governance/subcommittees/',
          {
            method: 'GET',
            responseType: 'json',
          }
        );
        return response.results || [];
      } catch (error) {
        console.error('Failed to fetch subcommittees:', error);
        return [];
      }
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (!member) return <div>Committee member not found.</div>;

  async function handleSubmit(data: CommitteeMemberInput) {
    if (!data.member) {
      throw new Error('Please select a member');
    }

    setIsLoading2(true);
    try {
      const payload = {
        content_type: data.member.content_type,
        object_id: data.member.object_id,
        position: data.position,
        gender: data.gender,
        caste_ethnicity: data.caste_ethnicity || '',
        term_start: data.term_start,
        term_end: data.term_end,
        status: data.status,
        subcommittees: data.subcommittees || [],
      };

      await customFetch(
        `/api/v1/governance/committee-members/${id}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          responseType: 'json',
        }
      );

      toast({ title: "Committee member updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/governance/committee-members/"] });
      queryClient.invalidateQueries({ queryKey: [`/api/v1/governance/committee-members/${id}/`] });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/governance/committee-members/quota_status/"] });
    } catch (error) {
      if (is403Error(error)) {
        const message = get403ErrorMessage("committee_member_update");
        toast({ title: "Permission Denied", description: message, variant: "destructive" });
      } else {
        const errorMsg = getErrorMessage(error);
        toast({ title: "Failed to update committee member", description: errorMsg, variant: "destructive" });
      }
      throw error;
    } finally {
      setIsLoading2(false);
    }
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
        onError: (error) => {
          if (is403Error(error)) {
            const message = get403ErrorMessage("committee_member_delete");
            toast({ title: "Permission Denied", description: message, variant: "destructive" });
          } else {
            const errorMsg = getErrorMessage(error);
            toast({ title: "Failed to remove committee member", description: errorMsg, variant: "destructive" });
          }
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border">
            {member.photo && <AvatarImage src={member.photo} alt={member.member_name ?? ""} />}
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {getInitials(member.member_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{member.member_name}</h1>
            <p className="text-muted-foreground mt-1">{POSITION_LABELS[member.position] ?? member.position}</p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/governance/committee-members">Back to Members</Link>
        </Button>
      </div>

      {!canWrite ? (
        <Card>
          <CardHeader><CardTitle>Member Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gender</p>
                <p className="capitalize">{member.gender}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Caste / Ethnicity</p>
                <p>{member.caste_ethnicity || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Term Start</p>
                <p>{formatDate(member.term_start)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Term End</p>
                <p>{formatDate(member.term_end)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={STATUS_VARIANT[member.status] ?? "secondary"} className="capitalize">
                  {member.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <CommitteeMemberForm
            initialValues={{
              member: {
                id: member.object_id,
                name: member.member_name,
                type: member.member_type,
                content_type: member.member_type,
                object_id: member.object_id,
              },
              position: member.position as any,
              gender: member.gender,
              caste_ethnicity: member.caste_ethnicity || '',
              term_start: member.term_start,
              term_end: member.term_end,
              status: member.status as any,
              subcommittees: member.subcommittees || [],
            }}
            onSubmit={handleSubmit}
            isLoading={isLoading2}
            subcommittees={subcommittees}
          />
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMember.isPending}
              >
                {deleteMember.isPending ? "Removing..." : "Remove Committee Member"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
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
