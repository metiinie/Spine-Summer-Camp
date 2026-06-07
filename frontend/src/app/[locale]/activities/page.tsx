import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Sparkles, MapPin, Calendar, Users, Phone, Tag } from "lucide-react";

export default async function ActivitiesPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "activitiesPage" });
  
  const activities = t.raw("items") as { title: string; description: string; image: string }[];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 text-sm font-semibold mb-6 border border-sky-200 dark:border-sky-800">
            <Sparkles className="w-4 h-4" />
            {t("title")}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-4">
            {t("title")}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-6">
            {t("subtitle")}
          </p>
          <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl mx-auto">
            {t.rich('aboutText', {
              spine: (chunks) => <span className="text-sky-600 dark:text-sky-400 font-extrabold">{chunks}</span>,
              ghion: (chunks) => <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{chunks}</span>
            })}
          </p>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {t("programsTitle")}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {activities.map((activity, idx) => (
            <div key={idx} className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-sky-300 dark:hover:border-sky-700 transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative h-60 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Image
                  src={activity.image}
                  alt={activity.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-6 relative">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {activity.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {activity.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Camp Info Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-sky-100 dark:bg-sky-900/50 rounded-xl text-sky-600 dark:text-sky-400">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Location</h3>
                <p className="text-slate-600 dark:text-slate-400">{t("info.location")}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-sky-100 dark:bg-sky-900/50 rounded-xl text-sky-600 dark:text-sky-400">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Dates</h3>
                <p className="text-slate-600 dark:text-slate-400">{t("info.dates")}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-sky-100 dark:bg-sky-900/50 rounded-xl text-sky-600 dark:text-sky-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Ages</h3>
                <p className="text-slate-600 dark:text-slate-400">{t("info.ages")}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-sky-100 dark:bg-sky-900/50 rounded-xl text-sky-600 dark:text-sky-400">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Contact</h3>
                <p className="text-slate-600 dark:text-slate-400">{t("info.contact")}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-sky-100 dark:bg-sky-900/50 rounded-xl text-sky-600 dark:text-sky-400">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Packages</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs whitespace-pre-line">{t("info.packages")}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-sky-100 dark:bg-sky-900/50 rounded-xl text-sky-600 dark:text-sky-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Discounts</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs whitespace-pre-line">{t("info.discounts")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
