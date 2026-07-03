"use client";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";

export default function Page() {
  const t = useTranslations("billing");
  const { can } = useAuthStore();
  const canWrite = can(WRITE_ROLES);

  return (
    <AuthGuard>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground mt-2">
              {t("subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("feeCollections.cardTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("feeCollections.cardDescription")}
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link href="/billing/fee-collections">{t("feeCollections.viewCollections")}</Link>
                  </Button>
                  {canWrite && (
                    <Button asChild>
                      <Link href="/billing/fee-collections/new">{t("feeCollections.recordPayment")}</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("receipts.cardTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("receipts.cardDescription")}
                </p>
                <Button asChild variant="outline">
                  <Link href="/billing/receipts">{t("receipts.viewReceipts")}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
