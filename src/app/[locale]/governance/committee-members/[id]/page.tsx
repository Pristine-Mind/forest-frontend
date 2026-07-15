"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { use, useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { useRouter } from "@/i18n/routing";
import {
  useGetCommitteeMember,
  useDeleteCommitteeMember,
} from "@/lib/api";
import {
  CommitteeMemberWithPhoto,
  useUpdateCommitteeMemberWithPhoto,
} from "@/lib/api/committee";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  const { data: cm, isLoading } = useGetCommitteeMember(id);
  const updateMember = useUpdateCommitteeMemberWithPhoto();
  const deleteMember = useDeleteCommitteeMember();

  const [position, setPosition] = useState<string>("member");
  const [status, setStatus] = useState<string>("active");
  const [photo, setPhoto] = useState<File | undefined>(undefined);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const member = cm as CommitteeMemberWithPhoto | undefined;

  // Update state when data loads
  useEffect(() => {
    if (member && !isInitialized) {
      setPosition(member.position);
      setStatus(member.status);
      setPhotoPreview(member.photo ?? undefined);
      setIsInitialized(true);
    }
  }, [member, isInitialized]);

  if (isLoading) return <div>Loading...</div>;
  if (!member) return <div>Committee member not found.</div>;

  function handlePhotoChange(file?: File) {
    setPhoto(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    } else {
      setPhotoPreview(member?.photo ?? undefined);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const data: { position: any; status: any; photo?: File } = {
      position: position as any,
      status: status as any,
    };
    if (photo) {
      data.photo = photo;
    }

    updateMember.mutate(
      { id, data },
      {
        onSuccess: () => {
          toast({ title: "Committee member updated" });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/governance/committee-members/"] });
          queryClient.invalidateQueries({ queryKey: [`/api/v1/governance/committee-members/${id}/`] });
          queryClient.invalidateQueries({ queryKey: ["/api/v1/governance/committee-members/quota_status/"] });
          setPhoto(undefined);
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

          {canWrite && (
            <form onSubmit={handleSubmit} className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium">Update Position / Status / Photo</h3>

              <div className="space-y-2">
                <label className="text-sm font-medium">Photo</label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border">
                    {photoPreview && <AvatarImage src={photoPreview} alt={member.member_name ?? ""} />}
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(member.member_name)}
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoChange(e.target.files?.[0])}
                    className="max-w-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Position (पद)</label>
                <Select
                  value={position}
                  onValueChange={(value) => {
                    if (value && value.trim() !== "") {
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
                    if (value && value.trim() !== "") {
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
