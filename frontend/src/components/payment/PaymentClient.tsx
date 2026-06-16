"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle2, AlertCircle, Copy, Check, Building2 } from "lucide-react";
import { PAYMENT_ACCOUNTS } from "@/lib/constants";
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
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = (text: string, type: "ref" | number) => {
    navigator.clipboard.writeText(text);
    if (type === "ref") {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } else {
      setCopiedAccount(type);
      setTimeout(() => setCopiedAccount(null), 2000);
    }
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

  // Bank brand colors for visual distinction
  const bankStyles = [
    {
      gradient: "from-yellow-500 to-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-200 dark:border-amber-800/50",
      badge: "bg-amber-500",
      text: "text-amber-700 dark:text-amber-300",
      accent: "text-amber-600 dark:text-amber-400",
    },
    {
      gradient: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-200 dark:border-blue-800/50",
      badge: "bg-blue-500",
      text: "text-blue-700 dark:text-blue-300",
      accent: "text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">

        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 mb-5">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
            {t("submittedTitle")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto">
            {t("submittedSubtitle").replace("{firstName}", registration.camper?.firstName || "")}
          </p>
        </div>

        {/* Reference Number Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-slate-800 mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{t("referenceTitle")}</p>
          <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/80 rounded-xl px-5 py-4 border border-slate-200 dark:border-slate-700">
            <span className="font-mono text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-wide">
              {registration.referenceNumber}
            </span>
            <button
              onClick={() => copyToClipboard(registration.referenceNumber, "ref")}
              className="p-2.5 rounded-lg bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 text-slate-400 hover:text-sky-500 hover:border-sky-300 transition-all ml-3"
              title="Copy reference number"
            >
              {copiedRef ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-3">{t("saveNumber")}</p>
        </div>

        {/* Session & Amount Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t("sessionLabel")}</p>
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{sessionLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t("amount")}</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {amount.toLocaleString()} <span className="text-base font-semibold">ETB</span>
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-sm">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t("instructions")}</h2>
          </div>

          <div className="grid gap-4">
            {PAYMENT_ACCOUNTS.map((account, idx) => {
              const style = bankStyles[idx] || bankStyles[0];
              return (
                <div
                  key={idx}
                  className={`relative overflow-hidden rounded-2xl ${style.bg} border ${style.border} shadow-md transition-all hover:shadow-lg`}
                >
                  {/* Numbered Badge */}
                  <div className={`absolute top-0 left-0 ${style.badge} text-white text-sm font-bold w-9 h-9 flex items-center justify-center rounded-br-xl rounded-tl-2xl shadow-sm`}>
                    {idx + 1}
                  </div>

                  <div className="pt-5 pb-5 px-5 pl-14">
                    {/* Bank Name Header */}
                    <h3 className={`text-lg font-bold ${style.text} mb-4`}>
                      {account.bankName}
                    </h3>

                    {/* Account Details */}
                    <div className="space-y-3">
                      {/* Account Name */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400">{t("accountName")}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                          {account.accountName}
                        </span>
                      </div>

                      {/* Account Number with Copy */}
                      <div className="flex items-center justify-between bg-white/70 dark:bg-slate-800/70 rounded-xl px-4 py-3 border border-slate-200/50 dark:border-slate-700/50">
                        <div>
                          <span className="text-xs text-slate-400 block mb-0.5">{t("accountNumber")}</span>
                          <span className="font-mono text-base font-bold text-slate-900 dark:text-slate-100 tracking-wider">
                            {account.accountNumber}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(account.accountNumber, idx)}
                          className="p-2 rounded-lg bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 text-slate-400 hover:text-sky-500 hover:border-sky-300 transition-all ml-3 flex-shrink-0"
                          title={`Copy ${account.bankName} account number`}
                        >
                          {copiedAccount === idx
                            ? <Check className="w-4 h-4 text-emerald-500" />
                            : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Important Note */}
          <div className="mt-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3">
            <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
            <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
              {t("importantNote")}
            </p>
          </div>
        </div>

        {/* Upload Receipt */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-slate-800 mb-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{t("uploadTitle")}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t("uploadSubtitle")}</p>

          {uploaded ? (
            <div className="flex items-center gap-3 p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-7 h-7 text-emerald-500 flex-shrink-0" />
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
