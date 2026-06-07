import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import {
  Sun,
  Star,
  Clock,
  Users,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Phone,
  Gift,
  MapPin,
  Calendar,
  Tag,
} from "lucide-react";
import { FirstVisitRedirect } from "@/components/FirstVisitRedirect";

interface HomePageProps {
  params: { locale: string };
}

export default async function HomePage({ params: { locale } }: HomePageProps) {
  const t = await getTranslations({ locale, namespace: "hero" });
  const tSessions = await getTranslations({ locale, namespace: "sessions" });
  const tFaq = await getTranslations({ locale, namespace: "faq" });

  const halfDayFeatures: string[] = tSessions.raw("halfDay.features") as string[];
  const fullDayFeatures: string[] = tSessions.raw("fullDay.features") as string[];
  const faqItems: { question: string; answer: string }[] = tFaq.raw("items") as { question: string; answer: string }[];

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <FirstVisitRedirect />
      {/* Hero */}
      <section className="relative pt-28 pb-24 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-10 -left-20 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-20 -right-20 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 text-sm font-semibold mb-6 border border-sky-200 dark:border-sky-800">
            <Sparkles className="w-4 h-4" />
            {t("badge")}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-slate-100 mb-6 leading-tight tracking-tight">
            {t("title").split(" ").slice(0, -1).join(" ")}{" "}
            <span className="bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent">
              {t("title").split(" ").slice(-1)[0]}
            </span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 dark:text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            {t("subtitle")}
          </p>

          {/* Partner logos with names */}
          <div className="flex flex-wrap justify-center items-center gap-6 mb-10">
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image src="/logo-1.png" alt="Spine Consultancy" fill className="object-contain" />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-none mb-0.5">Organized by</p>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">Spine Consultancy</p>
              </div>
            </div>
            <div className="text-slate-300 dark:text-slate-600 font-light text-xl">×</div>
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image src="/logo-2.png" alt="Ghion Hotel" fill className="object-contain" />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-none mb-0.5">Hosted at</p>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">Ghion Hotel</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/register`}
              className="group inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              {t("cta")}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href={`/activities`}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-semibold border-2 border-slate-200 dark:border-slate-700 hover:border-sky-300 hover:text-sky-600 transition-all duration-200"
            >
              {t("aboutUs")}
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center mt-16 animate-bounce">
          <ChevronDown className="w-6 h-6 text-slate-400 dark:text-slate-500" />
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-5 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: Users, label: "Ages 4–16", value: "All Welcome" },
            { icon: Clock, label: "6 Weeks", value: "July–August" },
            { icon: Star, label: "Activities", value: "20+ Daily" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <div className="w-7 h-7 rounded-full bg-sky-50 flex items-center justify-center mb-0.5">
                <Icon className="w-3.5 h-3.5 text-sky-500" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sessions */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {tSessions("title")}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{tSessions("subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Half Day */}
            <div className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-transparent hover:border-sky-300 shadow-md hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 text-xs font-semibold mb-3">
                  <Sun className="w-3 h-3" />
                  {tSessions("halfDay.session")}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-0.5">{tSessions("halfDay.title")}</h3>
                <p className="text-sky-600 text-sm font-semibold mb-0.5">{tSessions("halfDay.hours")}</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-4">
                  {tSessions("halfDay.price")} <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">ETB</span>
                </p>
                <ul className="space-y-2 mb-6">
                  {halfDayFeatures.map((f: string) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-sky-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/register`}
                  className="block w-full text-center py-2.5 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition-colors"
                >
                  {tSessions("title")}
                </Link>
              </div>
            </div>

            {/* Full Day */}
            <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border-2 border-emerald-400/30 hover:border-emerald-400 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-900 text-xs font-bold">
                Most Popular
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/50 text-emerald-400 text-xs font-semibold mb-3">
                <Star className="w-3 h-3" />
                {tSessions("fullDay.session")}
              </div>
              <h3 className="text-lg font-bold text-white mb-0.5">{tSessions("fullDay.title")}</h3>
              <p className="text-emerald-400 text-sm font-semibold mb-0.5">{tSessions("fullDay.hours")}</p>
              <p className="text-2xl font-extrabold text-white mb-4">
                {tSessions("fullDay.price")} <span className="text-sm font-semibold text-slate-400">ETB</span>
              </p>
              <ul className="space-y-2 mb-6">
                {fullDayFeatures.map((f: string) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/register`}
                className="block w-full text-center py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                {tSessions("title")}
              </Link>
            </div>
          </div>

          {/* Discounts & QR Code */}
          <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-slate-100 dark:border-slate-800 shadow-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-3">
                  <Gift className="w-3.5 h-3.5" />
                  {tSessions("discounts.title")}
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    {tSessions("discounts.twoKids")}
                  </li>
                  <li className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    {tSessions("discounts.threeKids")}
                  </li>
                  <li className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    {tSessions("discounts.fiveKids")}
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">
                  Scan to watch video
                </p>
                <div className="bg-white p-1.5 rounded-lg shadow-sm mb-1.5">
                  <Image src="/qrcode.png" alt="Scan to watch video" width={90} height={90} className="object-contain" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Spine Summer Camp
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {tFaq("title")}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-lg">{tFaq("subtitle")}</p>
          </div>
          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 overflow-hidden"
              >
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer font-semibold text-slate-800 dark:text-slate-100 select-none list-none">
                  {item.question}
                  <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <p className="px-6 pb-5 text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-relaxed border-t border-slate-200 dark:border-slate-700 pt-4">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-sky-500 to-emerald-500">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to join the adventure?
          </h2>
          <p className="text-sky-100 text-lg mb-8">
            Spots are limited — secure your child&apos;s place today.
          </p>
          <Link
            href={`/register`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 text-sky-600 text-lg font-bold hover:scale-105 transition-transform shadow-lg"
          >
            {t("cta")}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-14 text-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {/* Location & Dates */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-800 rounded-lg text-sky-400 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-1">Location</p>
                  <p>Ghion Hotel</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-800 rounded-lg text-sky-400 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-1">Dates</p>
                  <p>July 1 – August 15</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-800 rounded-lg text-sky-400 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-1">Ages</p>
                  <p>4 to 16 years old</p>
                </div>
              </div>
            </div>

            {/* Packages */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-800 rounded-lg text-emerald-400 mt-0.5">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-1">Packages</p>
                  <p>Half Day — 26,000 BIRR</p>
                  <p>Full Day — 40,000 BIRR</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-800 rounded-lg text-emerald-400 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-1">Discounts</p>
                  <p>2 Kids — 20% off</p>
                  <p>3 Kids — 40% off</p>
                  <p>5 Kids — 1 Free</p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-800 rounded-lg text-sky-400 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-1">Contact</p>
                  <p>0995173291</p>
                  <p>0995172939</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 text-center">
            <p className="text-slate-500">© 2026 Spine Summer Camp. All rights reserved.</p>
            <p className="text-slate-600 mt-1">Addis Ababa, Ethiopia</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
