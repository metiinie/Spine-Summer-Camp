import { getTranslations } from "next-intl/server";
import { PublicHeader } from "@/components/layout/PublicHeader";

interface HeaderWrapperProps {
  locale: string;
}

export async function HeaderWrapper({ locale }: HeaderWrapperProps) {
  const t = await getTranslations({ locale, namespace: "nav" });
  const translations = {
    home: t("home"),
    register: t("register"),
    status: t("status"),
    language: t("language"),
  };
  return <PublicHeader locale={locale} translations={translations} />;
}
