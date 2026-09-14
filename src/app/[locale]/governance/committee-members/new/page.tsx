"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useRouter } from "@/i18n/routing";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@/lib/api/custom-fetch";
import { CommitteeMemberForm } from "@/components/forms/CommitteeMemberForm";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage, is403Error, get403ErrorMessage } from "@/lib/error-handler";
import type { CommitteeMemberInput } from "@/schemas/committee-member.schema";

function AddCommitteeMember() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

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

  async function onSubmit(data: CommitteeMemberInput) {
    if (!data.member) {
      throw new Error('Please select a member');
    }

    setIsLoading(true);
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
        '/api/v1/governance/committee-members/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          responseType: 'json',
        }
      );

      toast({ title: "Committee member added" });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/governance/committee-members/"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/governance/committee-members/quota_status/"] });
      router.push("/governance/committee-members");
    } catch (error) {
      if (is403Error(error)) {
        const message = get403ErrorMessage("committee_member_create");
        toast({ title: "Permission Denied", description: message, variant: "destructive" });
      } else {
        const errorMsg = getErrorMessage(error);
        toast({ title: "Failed to add committee member", description: errorMsg, variant: "destructive" });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Committee Member</h1>
        <p className="text-muted-foreground mt-2">Assign a household or member to a committee position.</p>
      </div>
      <CommitteeMemberForm
        onSubmit={onSubmit}
        isLoading={isLoading}
        subcommittees={subcommittees}
      />
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><AddCommitteeMember /></AppLayout></AuthGuard>;
}
