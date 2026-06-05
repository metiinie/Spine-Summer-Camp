import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import { PublicHeader } from "@/components/layout/PublicHeader";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Spine Summer Camp 2026 | ቀለም የክረምት ካምፕ",
  description: "Register your child for Spine Summer Camp 2026. July 8 – August 22, Addis Ababa. Bilingual registration in English and Amharic.",
  keywords: ["summer camp", "Ethiopia", "Addis Ababa", "kids", "ካምፕ"],
};

export default async function LocaleLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  if (!["en", "am"].includes(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const navMessages = (messages as any)?.nav || {};

  const translations = {
    home: navMessages.home || "Home",
    register: navMessages.register || "Register",
    status: navMessages.status || "Check Status",
    language: navMessages.language || (locale === "en" ? "EN" : "አማ"),
  };

  return (
    <html lang={locale} className={inter.variable}>
      <body className="font-sans antialiased bg-white">
        <NextIntlClientProvider messages={messages}>
          <PublicHeader locale={locale} translations={translations} />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
