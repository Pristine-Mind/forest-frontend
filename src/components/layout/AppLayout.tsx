"use client";
import { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/lib/api";
import {
  Trees, Users, Sprout, Axe, Package,
  Map, ReceiptText, ShieldCheck, Banknote,
  Leaf, Gavel, BarChart3, LogOut, Menu, Settings2, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";

const NAV_ITEMS = [
  { href: "/dashboard", labelKey: "dashboard", icon: BarChart3 },
  { href: "/members", labelKey: "members", icon: Users },
  { href: "/forest", labelKey: "forestResources", icon: Trees },
  { href: "/harvest", labelKey: "harvesting", icon: Axe },
  { href: "/inventory", labelKey: "inventory", icon: Package },
  { href: "/forms", labelKey: "forms", icon: FileText },
  { href: "/visitors", labelKey: "visitors", icon: Map },
  { href: "/billing", labelKey: "billing", icon: ReceiptText },
  { href: "/governance", labelKey: "governance", icon: ShieldCheck },
  { href: "/fund", labelKey: "fundManagement", icon: Banknote },
  { href: "/livelihood", labelKey: "livelihood", icon: Leaf },
  { href: "/offense", labelKey: "offenseTracking", icon: Gavel },
  { href: "/bank-transactions", labelKey: "bank-transactions", icon: Banknote },
  { href: "/timber-log", labelKey: "timber-log", icon: Trees },
  { href: "/reports", labelKey: "reports", icon: BarChart3 },
  { href: "/settings", labelKey: "settings", icon: Settings2 },
];

function NavLinks() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  return (
    <div className="flex flex-col gap-1 w-full">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link key={item.href} href={item.href}>
            <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer text-sm font-medium
              ${isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}>
              <item.icon className="h-5 w-5 opacity-90" />
              <span>{t(item.labelKey)}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        clearAuth();
        router.push("/login");
      },
      onError: () => {
        clearAuth();
        router.push("/login");
      },
    });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-2">
          <Trees className="h-6 w-6 text-primary-foreground" />
          <span className="font-semibold text-lg">CFUG System</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] bg-sidebar border-r-sidebar-border p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-8 mt-4 text-sidebar-foreground">
              <Trees className="h-6 w-6 text-primary-foreground" />
              <span className="font-semibold text-lg">CFUG System</span>
            </div>
            <div className="flex-1 overflow-y-auto"><NavLinks /></div>
            <div className="mt-auto pt-4 border-t border-sidebar-border text-sidebar-foreground space-y-3">
              <div className="px-2">
                <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-sidebar-foreground/60">{user?.role}</p>
              </div>
              <div className="px-2">
                <LocaleSwitcher />
              </div>
              <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />{t("auth.logout")}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border flex-shrink-0">
        <div className="p-6 flex items-center gap-3 text-sidebar-foreground">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Trees className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-lg leading-tight block">Forest</span>
            <span className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider block">Management</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2"><NavLinks /></div>
        <div className="p-4 border-t border-sidebar-border text-sidebar-foreground space-y-3">
          <div className="px-2">
            <p className="text-sm font-medium truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate capitalize">{user?.role?.replace(/_/g, " ")}</p>
          </div>
          <div className="px-2">
            <LocaleSwitcher />
          </div>
          <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />{t("auth.logout")}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
