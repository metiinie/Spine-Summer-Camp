import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  Sun,
  Star,
  Clock,
  Users,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

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
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      {/* Hero */}
      <section className="relative pt-28 pb-24 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-10 -left-20 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-20 -right-20 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 text-sky-700 text-sm font-semibold mb-6 border border-sky-200">
            <Sparkles className="w-4 h-4" />
            {t("badge")}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
            {t("title").split(" ").slice(0, -1).join(" ")}{" "}
            <span className="bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent">
              {t("title").split(" ").slice(-1)[0]}
            </span>
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-4 leading-relaxed">
            {t("subtitle")}
          </p>

          <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold text-lg mb-10">
            <Sun className="w-5 h-5" />
            {t("dates")}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/register`}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white text-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              {t("cta")}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href={`/status`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-slate-700 text-lg font-semibold border-2 border-slate-200 hover:border-sky-300 hover:text-sky-600 transition-all duration-200"
            >
              {t("checkStatus")}
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center mt-16 animate-bounce">
          <ChevronDown className="w-6 h-6 text-slate-400" />
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-8 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-3 gap-6 text-center">
          {[
            { icon: Users, label: "Ages 6–14", value: "All Welcome" },
            { icon: Clock, label: "6 Weeks", value: "July–August" },
            { icon: Star, label: "Activities", value: "20+ Daily" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center mb-1">
                <Icon className="w-5 h-5 text-sky-500" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sessions */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              {tSessions("title")}
            </h2>
            <p className="text-slate-500 text-lg">{tSessions("subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Half Day */}
            <div className="group relative bg-white rounded-3xl p-8 border-2 border-transparent hover:border-sky-300 shadow-md hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-sm font-semibold mb-4">
                  <Sun className="w-3.5 h-3.5" />
                  {tSessions("halfDay.session")}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">{tSessions("halfDay.title")}</h3>
                <p className="text-sky-600 font-semibold mb-1">{tSessions("halfDay.hours")}</p>
                <p className="text-3xl font-extrabold text-slate-900 mb-6">
                  4,500 <span className="text-lg font-semibold text-slate-500">ETB</span>
                </p>
                <ul className="space-y-3 mb-8">
                  {halfDayFeatures.map((f: string) => (
                    <li key={f} className="flex items-center gap-3 text-slate-600">
                      <CheckCircle2 className="w-5 h-5 text-sky-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/register`}
                  className="block w-full text-center py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors"
                >
                  {tSessions("title")}
                </Link>
              </div>
            </div>

            {/* Full Day */}
            <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border-2 border-emerald-400/30 hover:border-emerald-400 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-400 text-slate-900 text-xs font-bold">
                Most Popular
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/50 text-emerald-400 text-sm font-semibold mb-4">
                <Star className="w-3.5 h-3.5" />
                {tSessions("fullDay.session")}
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{tSessions("fullDay.title")}</h3>
              <p className="text-emerald-400 font-semibold mb-1">{tSessions("fullDay.hours")}</p>
              <p className="text-3xl font-extrabold text-white mb-6">
                7,500 <span className="text-lg font-semibold text-slate-400">ETB</span>
              </p>
              <ul className="space-y-3 mb-8">
                {fullDayFeatures.map((f: string) => (
                  <li key={f} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/register`}
                className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold hover:opacity-90 transition-opacity"
              >
                {tSessions("title")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              {tFaq("title")}
            </h2>
            <p className="text-slate-500 text-lg">{tFaq("subtitle")}</p>
          </div>
          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden"
              >
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer font-semibold text-slate-800 select-none list-none">
                  {item.question}
                  <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <p className="px-6 pb-5 text-slate-600 leading-relaxed border-t border-slate-200 pt-4">
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
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-sky-600 text-lg font-bold hover:scale-105 transition-transform shadow-lg"
          >
            {t("cta")}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 text-center text-sm">
        <p>© 2026 Spine Summer Camp. All rights reserved.</p>
        <p className="mt-1">Addis Ababa, Ethiopia</p>
      </footer>
    </main>
  );
}
