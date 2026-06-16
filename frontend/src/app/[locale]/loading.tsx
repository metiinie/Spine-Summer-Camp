import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-sky-400/30 animate-pulse"></div>
          <Loader2 className="w-12 h-12 text-sky-500 animate-spin relative z-10" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
