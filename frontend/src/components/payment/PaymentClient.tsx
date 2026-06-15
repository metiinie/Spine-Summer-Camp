"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react";
import { PAYMENT_CONFIG } from "@/lib/constants";
import { useTranslations } from "next-intl";

interface PaymentClientProps {
  registration: {
    id: string;
    referenceNumber: string;
    amount: number | string;
    session: string;
    status: string;
    receiptUrl: string | null;
    camper: { firstName: string; lastName: string } | null;
  };
}

export function PaymentClient({ registration }: PaymentClientProps) {
  const t = useTranslations("payment");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(!!registration.receiptUrl);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const copyRef = () => {
    navigator.clipboard.writeText(registration.referenceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError(t("fileTooLarge"));
      return;
    }
    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
      setError(t("invalidFileType"));
      return;
    }
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("registrationId", registration.id);
      formData.append("referenceNumber", registration.referenceNumber);
      const res = await fetch("/api/upload-receipt", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("uploadFailed"));
      setUploaded(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const sessionLabel = registration.session === "HALF_DAY" ? t("halfDay") : t("fullDay");
  const amount = Number(registration.amount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 pt-24 pb-16">
      <div className="max-w-xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t("submittedTitle")}</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {t("submittedSubtitle").replace("{firstName}", registration.camper?.firstName || "")}
          </p>
        </div>

        {/* Reference Number */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-100 dark:border-slate-800 mb-4">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">{t("referenceTitle")}</p>
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700">
            <span className="font-mono text-xl font-bold text-slate-900 dark:text-slate-100">{registration.referenceNumber}</span>
            <button onClick={copyRef} className="p-2 text-slate-400 hover:text-sky-500 transition ml-2">
              {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">{t("saveNumber")}</p>
        </div>

        {/* Payment Instructions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-100 dark:border-slate-800 mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">{t("instructions")}</h2>
          <div className="space-y-3">
            {[
              { label: t("bank"), value: PAYMENT_CONFIG.bankName },
              { label: t("accountNumber"), value: PAYMENT_CONFIG.accountNumber },
              { label: t("accountName"), value: PAYMENT_CONFIG.accountName },
              { label: t("sessionLabel"), value: sessionLabel },
              { label: t("amount"), value: `${amount.toLocaleString()} ETB`, highlight: true },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
                <span className={`font-semibold ${highlight ? "text-emerald-600 dark:text-emerald-400 text-lg" : "text-slate-800 dark:text-slate-100"}`}>{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              {t("importantNote")}
            </p>
          </div>
        </div>

        {/* Upload Receipt */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-100 dark:border-slate-800 mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{t("uploadTitle")}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t("uploadSubtitle")}</p>

          {uploaded ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-emerald-700 dark:text-emerald-400">{t("uploaded")}</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-500">{t("reviewNote")}</p>
              </div>
            </div>
          ) : (
            <>
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragOver ? "border-sky-400 bg-sky-50 dark:bg-sky-900/20" : "border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                }`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleFile(file);
                }}
              >
                <Upload className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {uploading ? t("uploading") : t("uploadSubtitle")}
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500">{t("clickToBrowse")}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{t("uploadFormats")}</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              {uploading && (
                <div className="mt-3 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 animate-pulse rounded-full" style={{ width: "70%" }} />
                </div>
              )}
              {error && (
                <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Confirmation Note */}
        <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-2xl p-5 text-center">
          <p className="text-sky-700 dark:text-sky-400 text-sm leading-relaxed">
            🕐 {t("confirmationNote")}
          </p>
        </div>
      </div>
    </div>
  );
}
