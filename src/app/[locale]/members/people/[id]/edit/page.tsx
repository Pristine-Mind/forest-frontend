"use client";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
import { use } from "react";
import { useGetMember, useGetHousehold } from "@/lib/api/members";
import { customFetch } from "@/lib/api/custom-fetch";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";

function MemberEditInner({ id }: { id: number }) {
  const t = useTranslations("members.people");
  const tCommon = useTranslations("common");
  const tForms = useTranslations("forms");
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: member, isLoading: memberLoading } = useGetMember(id);
  const { data: household, isLoading: householdLoading } = useGetHousehold(member?.household || 0, {
      enabled: !!member?.household,
      queryKey: []
  });
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const formSchema = z.object({
    full_name: z.string().min(1, tForms("required")),
    relation: z.string().min(1, tForms("required")),
    photo: z.instanceof(File).optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      relation: "",
      photo: undefined,
    },
  });

  // Reset form when member data loads
  useEffect(() => {
    if (member) {
      form.reset({
        full_name: member.full_name,
        relation: member.relation || "",
        photo: undefined,
      });
      setPhotoFile(null);
    }
  }, [member, form.reset]);

  async function onSubmit(values: FormValues) {
    setIsUpdating(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('full_name', values.full_name);
      formData.append('relation', values.relation);
      
      // Only append photo if a new file was selected
      if (photoFile) {
        formData.append('member_photo', photoFile);
      }

      // Use customFetch directly
      const response = await customFetch(`/api/v1/members/members/${id}/`, {
        method: 'PATCH',
        body: formData,
      });

      // customFetch might return parsed data directly
      // If it's a Response object, check if it's ok
      if (response instanceof Response) {
        if (!response.ok) {
          let errorMessage = t("toastFailedDesc");
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.full_name?.[0] || errorData.relation?.[0] || errorData.member_photo?.[0] || errorMessage;
          } catch {
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        // If Response, parse it
        await response.json();
      }

      toast({ title: t("toastUpdated") || "Member updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/members/members/"] });
      queryClient.invalidateQueries({ queryKey: [`/api/v1/members/members/${id}/`] });
      queryClient.invalidateQueries({ queryKey: [`/api/v1/members/households/${member?.household}/`] });
      router.push(`/members/${member?.household}`);
    } catch (error: any) {
      toast({
        title: t("toastFailed"),
        description: error?.message || t("toastFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  if (memberLoading || householdLoading) {
    return <div className="flex items-center justify-center p-8"><Spinner /></div>;
  }

  if (!member) {
    return <div className="max-w-2xl mx-auto text-center py-12 text-muted-foreground">
      {t("notFound") || "Member not found"}
    </div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("editTitle") || "Edit Member"}</h1>
        <p className="text-muted-foreground mt-2">
          {household ? (
            <>{t("editingMemberOfHousehold", { name: household.household_head_name })}</>
          ) : (
            t("editingMember")
          )}
        </p>
      </div>
      <Card>
        <CardHeader><CardTitle>{t("formTitle")}</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="full_name" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fullName")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="relation" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("relation")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Son, Daughter, Spouse, etc." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="photo" render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Photo</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPhotoFile(file);
                            onChange(file);
                          } else {
                            setPhotoFile(null);
                            onChange(undefined);
                          }
                        }} 
                        {...field} 
                      />
                      {value && <div className="text-sm text-muted-foreground">Selected: {(value as File).name}</div>}
                      {!value && member?.member_photo && (
                        <div className="text-sm text-muted-foreground">
                          Current photo: <a href={member.member_photo} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View</a>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Leave empty to keep current photo
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Member"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push(`/members/${member?.household}`)}
                  disabled={isUpdating}
                >
                  {tCommon("cancel")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function MemberEditGuard({ id }: { id: number }) {
  const t = useTranslations("members.people");

  if (!id || Number.isNaN(id)) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 text-muted-foreground">
        {t("invalidId") || "Invalid member ID"}
      </div>
    );
  }

  return <MemberEditInner id={id} />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const memberId = Number(id);

  return (
    <AuthGuard>
      <AppLayout>
        <MemberEditGuard id={memberId} />
      </AppLayout>
    </AuthGuard>
  );
}
