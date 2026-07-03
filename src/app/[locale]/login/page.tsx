"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useLogin } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { Trees } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";

export default function Login() {
  const t = useTranslations("auth");
  const tLogin = useTranslations("login");
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { data: { email, password } },
      {
        onSuccess: (data) => {
          setAuth(data.token, data.user);
          router.push("/dashboard");
        },
        onError: () => {
          toast({ title: t("loginFailed"), variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="space-y-3 items-center text-center pb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Trees className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">{tLogin("title")}</CardTitle>
          <CardDescription className="text-base">{t("enterCredentials")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={tLogin("emailPlaceholder")} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={tLogin("passwordPlaceholder")} className="h-11" />
            </div>
            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={login.isPending}>
              {login.isPending ? t("loggingIn") : t("login")}
            </Button>
            <div className="pt-2">
              <LocaleSwitcher />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
