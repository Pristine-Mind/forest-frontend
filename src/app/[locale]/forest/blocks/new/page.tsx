"use client";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";
import { useCreateForestBlock } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

function ForestBlockNew() {
  const t = useTranslations("forest.blocks");
  const tCommon = useTranslations("common");
  const tForms = useTranslations("forms");
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createBlock = useCreateForestBlock();

  const formSchema = z.object({
    block_name: z.string().min(1, tForms("required")),
    total_area_ha: z
      .string()
      .min(1, tForms("required"))
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, tForms("invalidNumber")),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { block_name: "", total_area_ha: "" },
  });

  function onSubmit(values: FormValues) {
    createBlock.mutate({ data: { ...values, total_area_ha: parseFloat(values.total_area_ha) } }, {
      onSuccess: () => {
        toast({ title: t("toastCreated") });
        queryClient.invalidateQueries({ queryKey: ["/api/v1/forest/blocks/"] });
        router.push("/forest");
      },
      onError: () => toast({ title: t("toastFailed"), variant: "destructive" }),
    });
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("newTitle")}</h1>
        <p className="text-muted-foreground mt-2">{t("newSubtitle")}</p>
      </div>
      <Card>
        <CardHeader><CardTitle>{t("formTitle")}</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="block_name" render={({ field }) => (
                <FormItem><FormLabel>{t("blockNameLabel")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="total_area_ha" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("areaLabel")}</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="0.01" inputMode="decimal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={createBlock.isPending}>
                  {createBlock.isPending ? t("creating") : t("create")}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/forest")}>{tCommon("cancel")}</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><ForestBlockNew /></AppLayout></AuthGuard>;
}
