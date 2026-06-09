import { Calendar, User, Users } from "lucide-react";

type Status = "PENDING_PAYMENT" | "RECEIPT_UPLOADED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

interface Registration {
  id: string;
  referenceNumber: string;
  status: Status;
  session: string;
  amount: string;
  createdAt: string;
  camper: { firstName: string; lastName: string } | null;
  parent: { primaryName: string } | null;
}

interface RegistrationCardProps {
  registration: Registration;
  onView: () => void;
}

const STATUS_COLORS: Record<Status, string> = {
  PENDING_PAYMENT: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  RECEIPT_UPLOADED: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  UNDER_REVIEW: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  APPROVED: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  REJECTED: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
};

const STATUS_LABELS: Record<Status, string> = {
  PENDING_PAYMENT: "Pending Payment",
  RECEIPT_UPLOADED: "Receipt Uploaded",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function RegistrationCard({ registration, onView }: RegistrationCardProps) {
  return (
    <div
      data-testid="registration-card"
      onClick={onView}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-lg hover:border-sky-300 dark:hover:border-sky-700 transition-all duration-200 cursor-pointer active:scale-[0.98]"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">
            {registration.camper
              ? `${registration.camper.firstName} ${registration.camper.lastName}`
              : "–"}
          </h3>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {registration.referenceNumber}
          </p>
        </div>
        <div>
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
              STATUS_COLORS[registration.status]
            }`}
          >
            {STATUS_LABELS[registration.status]}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        {/* Session */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              registration.session === "HALF_DAY"
                ? "bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300"
                : "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
            }`}
          >
            {registration.session === "HALF_DAY" ? "Half Day" : "Full Day"}
          </span>
        </div>

        {/* Parent */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <span className="text-slate-600 dark:text-slate-400 truncate">
            {registration.parent?.primaryName || "–"}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <span className="text-slate-500 dark:text-slate-400 text-xs">
            {new Date(registration.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Tap indicator */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <p className="text-xs text-sky-600 dark:text-sky-400 font-medium text-center">
          Tap to view details →
        </p>
      </div>
    </div>
  );
}
