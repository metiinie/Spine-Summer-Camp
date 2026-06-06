import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ThemeProvider } from "@/components/ThemeProvider";
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
  const navMessages = (messages as Record<string, Record<string, string>>)?.nav || {};

  const translations = {
    home: navMessages.home || "Home",
    activities: navMessages.activities || "Activities",
    register: navMessages.register || "Register",
    status: navMessages.status || "Check Status",
    language: navMessages.language || (locale === "en" ? "EN" : "አማ"),
  };

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased bg-white dark:bg-slate-950 transition-colors">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextIntlClientProvider messages={messages}>
            <PublicHeader locale={locale} translations={translations} />
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
