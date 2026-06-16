import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
