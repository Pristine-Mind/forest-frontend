"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useAuthStore } from "@/stores/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!isAuthenticated() && pathname !== "/login") {
      router.replace("/login");
    } else if (isAuthenticated() && pathname === "/") {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, pathname, router]);

  // On server render or before client mount, render children to avoid hydration mismatch
  if (!isMounted) {
    return <>{children}</>;
  }

  // After client mount, check authentication
  if (!isAuthenticated() && pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
}
