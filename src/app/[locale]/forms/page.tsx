"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clipboard } from "lucide-react";

export default function FormsPage() {
  const router = useRouter();
  const locale = useLocale();

  const forms = [
    {
      title: "Survey Forms",
      description: "Create and manage tree survey forms with multiple tree items",
      icon: FileText,
      href: `/${locale}/forms/survey`,
      color: "bg-blue-50",
    },
    {
      title: "Cutting Registers",
      description: "Create and manage cutting registers with multiple cutting items",
      icon: Clipboard,
      href: `/${locale}/forms/cutting`,
      color: "bg-green-50",
    },
    {
      title: "Felling Registers",
      description: "Create and manage felling registers with multiple felling items",
      icon: Clipboard,
      href: `/${locale}/forms/felling-register`,
      color: "bg-yellow-50",
    },
    {
      title: "Forest Product Receipts",
      description: "Create and manage forest product receipts with multiple receipt items",
      icon: Clipboard,
      href: `/${locale}/forms/forest-product-receipts`,
      color: "bg-purple-50",
    },
  ];

  return (
    <AuthGuard>
      <AppLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Forms Management</h1>
        <p className="text-gray-600 mt-2">
          Create and manage survey forms, cutting registers, and felling registers with nested items support
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {forms.map((form) => {
          const Icon = form.icon;
          return (
            <Card
              key={form.href}
              className={`cursor-pointer hover:shadow-lg transition-shadow ${form.color}`}
              onClick={() => router.push(form.href)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{form.title}</CardTitle>
                    <CardDescription className="mt-2">{form.description}</CardDescription>
                  </div>
                  <Icon className="w-8 h-8 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push(form.href)}>
                  Open {form.title}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
      </AppLayout>
    </AuthGuard>
  );
}
