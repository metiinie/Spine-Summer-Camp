"use client";

import { useState } from "react";
import { Search, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

type Status = "PENDING_PAYMENT" | "RECEIPT_UPLOADED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

interface RegistrationStatus {
  referenceNumber: string;
  status: Status;
  session: string;
  amount: string;
  createdAt: string;
  rejectionReason?: string | null;
  camper: {
    firstName: string;
    lastName: string;
  } | null;
}

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  PENDING_PAYMENT: {
    label: "Pending Payment",
    icon: Clock,
    color: "text-amber-700 dark:text-amber-300",
    bgColor: "bg-amber-100 dark:bg-amber-900/50 border-amber-200 dark:border-amber-800",
  },
  RECEIPT_UPLOADED: {
    label: "Receipt Uploaded",
    icon: AlertCircle,
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-100 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    icon: Search,
    color: "text-purple-700 dark:text-purple-300",
    bgColor: "bg-purple-100 dark:bg-purple-900/50 border-purple-200 dark:border-purple-800",
  },
  APPROVED: {
    label: "Approved ✓",
    icon: CheckCircle2,
    color: "text-emerald-700 dark:text-emerald-300",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/50 border-red-200 dark:border-red-800",
  },
};

export default function CheckStatusPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<RegistrationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError("Please enter a reference number or email");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const res = await fetch(`/api/registrations/status?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration not found");
        setStatus(null);
      } else {
        setStatus(data);
        setError(null);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = status ? STATUS_CONFIG[status.status] : null;
  const StatusIcon = statusConfig?.icon;

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 pt-20 md:pt-28 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Check Registration Status
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
            Enter your reference number or email to check your registration status
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleCheck} className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SCAMP-XXXXXX or your email"
              className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm md:text-base focus:border-sky-400 dark:focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 md:py-4 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white text-sm md:text-base font-bold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? "Checking..." : "Check Status"}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-700 dark:text-red-400 text-sm md:text-base font-medium">{error}</p>
          </div>
        )}

        {/* Status Result */}
        {status && statusConfig && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-xl p-6 md:p-8">
            {/* Status Badge */}
            <div className="flex items-center justify-center mb-6">
              <div className={`inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full border-2 ${statusConfig.bgColor} ${statusConfig.color}`}>
                {StatusIcon && <StatusIcon className="w-5 h-5" />}
                <span className="font-bold text-sm md:text-base">{statusConfig.label}</span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <DetailRow label="Reference Number" value={status.referenceNumber} />
              {status.camper && (
                <DetailRow
                  label="Camper Name"
                  value={`${status.camper.firstName} ${status.camper.lastName}`}
                />
              )}
              <DetailRow
                label="Session"
                value={status.session === "HALF_DAY" ? "Session 1 – Half Day" : "Session 2 – Full Day"}
              />
              <DetailRow label="Amount" value={`${Number(status.amount).toLocaleString()} ETB`} />
              <DetailRow
                label="Registration Date"
                value={new Date(status.createdAt).toLocaleDateString()}
              />
            </div>

            {/* Rejection Reason */}
            {status.status === "REJECTED" && status.rejectionReason && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-xs md:text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
                  Rejection Reason
                </p>
                <p className="text-sm md:text-base text-red-600 dark:text-red-400">{status.rejectionReason}</p>
              </div>
            )}

            {/* Payment Instructions */}
            {status.status === "PENDING_PAYMENT" && (
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-xs md:text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2">
                  Payment Instructions
                </p>
                <p className="text-sm md:text-base text-amber-600 dark:text-amber-400">
                  Please complete your payment and upload your receipt to proceed with your registration.
                </p>
              </div>
            )}

            {/* Approval Message */}
            {status.status === "APPROVED" && (
              <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <p className="text-xs md:text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                  ✓ Congratulations!
                </p>
                <p className="text-sm md:text-base text-emerald-600 dark:text-emerald-400">
                  Your registration has been approved. We look forward to seeing you at camp!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium mb-1 sm:mb-0">
        {label}
      </span>
      <span className="text-slate-900 dark:text-slate-100 text-sm md:text-base font-semibold">
        {value}
      </span>
    </div>
  );
}
