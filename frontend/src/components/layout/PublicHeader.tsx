"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Globe, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface PublicHeaderProps {
  locale: string;
  translations: {
    home: string;
    activities: string;
    register: string;
    status: string;
    language: string;
  };
}

export function PublicHeader({ locale, translations }: PublicHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const otherLocale = locale === "en" ? "am" : "en";
  const otherLocaleLabel = locale === "en" ? "አማ" : "EN";

  const switchLanguage = () => {
    document.cookie = `NEXT_LOCALE=${otherLocale}; path=/; max-age=31536000`;
    router.refresh();
  };

  const navLinks = [
    { href: `/`, label: translations.home },
    { href: `/register`, label: translations.register },
    { href: `/activities`, label: translations.activities },
    { href: `/status`, label: translations.status },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/`} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform overflow-hidden p-1 border border-slate-100 dark:border-slate-800">
              <div className="relative w-full h-full">
                <Image src="/logo-1.png" alt="Spine" fill className="object-contain" />
              </div>
            </div>
            <span className="font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight">
              Spine
              <span className="text-sky-500"> Camp</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-sky-600 dark:text-sky-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={switchLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 hover:border-sky-300 dark:hover:border-sky-600 hover:text-sky-700 dark:hover:text-sky-400 transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              {otherLocaleLabel}
            </button>
            <Link
              href={`/register`}
              className="hidden sm:block px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              {translations.register}
            </Link>
            <button
              className="md:hidden text-slate-600 dark:text-slate-300"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
          <nav className="flex flex-col px-4 py-3 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={`/register`}
              onClick={() => setMobileOpen(false)}
              className="mt-1 px-3 py-2 rounded-lg text-sm font-semibold text-center bg-gradient-to-r from-sky-500 to-emerald-500 text-white"
            >
              {translations.register}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
