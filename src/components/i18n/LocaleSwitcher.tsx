"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function LocaleSwitcher() {
  const t = useTranslations("locale");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(value: string) {
    router.replace(pathname, { locale: value as "en" | "ne" });
  }

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger aria-label={t("switchLanguage")} className="w-full">
        <SelectValue placeholder={t("switchLanguage")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{t("english")}</SelectItem>
        <SelectItem value="ne">{t("nepali")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
