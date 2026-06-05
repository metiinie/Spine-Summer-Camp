"use client";

import { useState } from "react";
import { Search, CheckCircle2, Clock, Upload, XCircle, AlertCircle } from "lucide-react";

const STATUS_TIMELINE = [
  { key: "PENDING_PAYMENT", label: "Submitted", icon: CheckCircle2 },
  { key: "RECEIPT_UPLOADED", label: "Receipt Uploaded", icon: Upload },
  { key: "UNDER_REVIEW", label: "Under Review", icon: Clock },
];

const STATUS_ORDER = ["PENDING_PAYMENT", "RECEIPT_UPLOADED", "UNDER_REVIEW", "APPROVED", "REJECTED"];

interface RegistrationResult {
  referenceNumber: string;
  status: string;
  session: string;
  amount: string;
  createdAt: string;
  camper?: { firstName: string; lastName: string };
  rejectionReason?: string | null;
}

export default function StatusPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setSearched(true);
    try {
      const res = await fetch(`/api/registrations/status?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok || !data) {
        setError("No registration found with that email or reference number.");
      } else {
        setResult(data);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const statusIndex = result ? STATUS_ORDER.indexOf(result.status) : -1;
  const isApproved = result?.status === "APPROVED";
  const isRejected = result?.status === "REJECTED";

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 pt-24 pb-16">
      <div className="max-w-lg mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Check Registration Status</h1>
          <p className="text-slate-500">Enter your email address or reference number to check your status.</p>
        </div>

        <form onSubmit={handleSearch} className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Email Address or Reference Number</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="email@example.com or SCAMP-2026-XXXXX"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? <Clock className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </button>
          </div>
        </form>

        {searched && error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {result && (
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
            <div className="mb-6">
              <p className="text-sm text-slate-500 mb-1">Camper</p>
              <p className="font-bold text-slate-900 text-xl">{result.camper?.firstName} {result.camper?.lastName}</p>
              <p className="text-sm text-slate-500 mt-1 font-mono">{result.referenceNumber}</p>
            </div>

            {/* Timeline */}
            <div className="space-y-4 mb-6">
              {STATUS_TIMELINE.map((s, i) => {
                const isComplete = statusIndex >= STATUS_ORDER.indexOf(s.key) && !isRejected;
                const isCurrent = result.status === s.key;
                const Icon = s.icon;
                return (
                  <div key={s.key} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isComplete ? "bg-emerald-100 text-emerald-600" : isCurrent ? "bg-sky-100 text-sky-600 ring-4 ring-sky-200" : "bg-slate-100 text-slate-300"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {i < STATUS_TIMELINE.length - 1 && (
                        <div className={`w-0.5 h-8 mt-1 ${isComplete ? "bg-emerald-300" : "bg-slate-200"}`} />
                      )}
                    </div>
                    <div className="pt-2">
                      <p className={`font-semibold ${isComplete ? "text-slate-900" : "text-slate-400"}`}>{s.label}</p>
                    </div>
                  </div>
                );
              })}

              {/* Final status */}
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isApproved ? "bg-emerald-500 text-white" : isRejected ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-300"}`}>
                  {isRejected ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>
                <p className={`font-semibold ${isApproved ? "text-emerald-700" : isRejected ? "text-red-600" : "text-slate-400"}`}>
                  {isApproved ? "Approved ✓" : isRejected ? "Rejected" : "Decision Pending"}
                </p>
              </div>
            </div>

            {isApproved && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-emerald-700 font-semibold">🎉 Congratulations! Your registration is confirmed.</p>
                <p className="text-emerald-600 text-sm mt-1">Camp starts July 8, 2026. We look forward to seeing your child!</p>
              </div>
            )}
            {isRejected && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 font-semibold">Registration was not approved.</p>
                {result.rejectionReason && <p className="text-red-600 text-sm mt-1">Reason: {result.rejectionReason}</p>}
                <p className="text-red-500 text-sm mt-2">Please contact us or re-apply if you believe this is an error.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
