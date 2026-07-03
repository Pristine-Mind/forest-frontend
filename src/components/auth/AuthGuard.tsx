"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useAuthStore } from "@/stores/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated() && pathname !== "/login") {
      router.replace("/login");
    } else if (isAuthenticated() && pathname === "/") {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, pathname, router]);

  if (!isAuthenticated() && pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
}
