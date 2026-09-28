"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/stores/auth-store";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  ApiError,
  useChangePassword,
  type ChangePasswordPayload,
} from "@/lib/api/change-password";

type Errors = Partial<Record<keyof ChangePasswordPayload, string>>;

const toMessage = (v?: string[] | string) => (Array.isArray(v) ? v[0] : v);

export default function ChangePasswordPage() {
  const t = useTranslations("changePassword");
  const router = useRouter();
  const { toast } = useToast();
  const { user, setAuth } = useAuthStore();
  const changePassword = useChangePassword();

  const [form, setForm] = useState<ChangePasswordPayload>({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<Errors>({});

  const update = (field: keyof ChangePasswordPayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Quick client-side checks; the server remains the source of truth
    const clientErrors: Errors = {};
    if (form.new_password.length < 8) clientErrors.new_password = t("tooShort");
    if (form.new_password !== form.confirm_password)
      clientErrors.confirm_password = t("mismatch");
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return;
    }

    changePassword.mutate(form, {
      onSuccess: (data) => {
        // Server rotated the token; keep the user logged in with the new one
        if (user) setAuth(data.token, user);
        setForm({ old_password: "", new_password: "", confirm_password: "" });
        toast({ title: t("success") });
        router.push("/dashboard");
      },
      onError: (err) => {
        if (err instanceof ApiError && err.status === 400) {
          setErrors({
            old_password: toMessage(err.data.old_password),
            new_password: toMessage(err.data.new_password),
            confirm_password: toMessage(err.data.confirm_password),
          });
          return;
        }
        toast({ title: t("failed"), variant: "destructive" });
      },
    });
  };

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="space-y-3 items-center text-center pb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">{t("title")}</CardTitle>
          <CardDescription className="text-base">{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="old_password">{t("currentPassword")}</Label>
              <PasswordInput
                id="old_password"
                required
                autoComplete="current-password"
                value={form.old_password}
                onChange={update("old_password")}
                aria-invalid={!!errors.old_password}
                showLabel={t("show")}
                hideLabel={t("hide")}
              />
              {errors.old_password && (
                <p className="text-sm text-destructive">{errors.old_password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">{t("newPassword")}</Label>
              <PasswordInput
                id="new_password"
                required
                autoComplete="new-password"
                value={form.new_password}
                onChange={update("new_password")}
                aria-invalid={!!errors.new_password}
                showLabel={t("show")}
                hideLabel={t("hide")}
              />
              {errors.new_password && (
                <p className="text-sm text-destructive">{errors.new_password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">{t("confirmPassword")}</Label>
              <PasswordInput
                id="confirm_password"
                required
                autoComplete="new-password"
                value={form.confirm_password}
                onChange={update("confirm_password")}
                aria-invalid={!!errors.confirm_password}
                showLabel={t("show")}
                hideLabel={t("hide")}
              />
              {errors.confirm_password && (
                <p className="text-sm text-destructive">{errors.confirm_password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={changePassword.isPending}
            >
              {changePassword.isPending ? t("saving") : t("submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
