"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: "default" | "success" | "warning" | "info";
  icon?: React.ReactNode;
}

export function StatCard({
  title,
  value,
  subtitle,
  variant = "default",
  icon,
}: StatCardProps) {
  const variantStyles = {
    default: "bg-slate-50 border-slate-200",
    success: "bg-green-50 border-green-200",
    warning: "bg-amber-50 border-amber-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <Card className={variantStyles[variant]}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && <div className="text-lg">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface DetailRowProps {
  label: string;
  value: string | number | React.ReactNode;
  highlight?: boolean;
}

export function DetailRow({
  label,
  value,
  highlight = false,
}: DetailRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span
        className={`font-semibold ${
          highlight ? "text-blue-600" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
