"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react";
import { PAYMENT_CONFIG } from "@/lib/constants";

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
      setError("File is too large. Maximum size is 5MB.");
      return;
    }
    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
      setError("Invalid file type. Please upload JPG, PNG, or PDF.");
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
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setUploaded(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const sessionLabel = registration.session === "HALF_DAY" ? "Session 1 – Half Day" : "Session 2 – Full Day";
  const amount = Number(registration.amount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 pt-24 pb-16">
      <div className="max-w-xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Registration Submitted!</h1>
          <p className="text-slate-500">
            {registration.camper?.firstName}, your registration has been received. Complete your payment below to secure your spot.
          </p>
        </div>

        {/* Reference Number */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 mb-4">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Your Reference Number</p>
          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
            <span className="font-mono text-xl font-bold text-slate-900">{registration.referenceNumber}</span>
            <button onClick={copyRef} className="p-2 text-slate-400 hover:text-sky-500 transition ml-2">
              {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">Save this number to check your registration status</p>
        </div>

        {/* Payment Instructions */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 mb-4">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Payment Instructions</h2>
          <div className="space-y-3">
            {[
              { label: "Bank", value: PAYMENT_CONFIG.bankName },
              { label: "Account Number", value: PAYMENT_CONFIG.accountNumber },
              { label: "Account Name", value: PAYMENT_CONFIG.accountName },
              { label: "Session", value: sessionLabel },
              { label: "Amount to Pay", value: `${amount.toLocaleString()} ETB`, highlight: true },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-500">{label}</span>
                <span className={`font-semibold ${highlight ? "text-emerald-600 text-lg" : "text-slate-800"}`}>{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-700">
              <strong>Important:</strong> Transfer the exact amount shown. Include your reference number in the memo/description field if possible.
            </p>
          </div>
        </div>

        {/* Upload Receipt */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 mb-4">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Upload Payment Receipt</h2>
          <p className="text-sm text-slate-500 mb-4">After making the payment, upload your receipt here.</p>

          {uploaded ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-emerald-700">Receipt uploaded successfully!</p>
                <p className="text-sm text-emerald-600">We will review and confirm within 24 hours.</p>
              </div>
            </div>
          ) : (
            <>
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragOver ? "border-sky-400 bg-sky-50" : "border-slate-200 hover:border-sky-300 hover:bg-sky-50"
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
                <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-slate-600 mb-1">
                  {uploading ? "Uploading..." : "Drag & drop your receipt here"}
                </p>
                <p className="text-sm text-slate-400">or click to browse files</p>
                <p className="text-xs text-slate-400 mt-2">JPG, PNG, PDF (max 5MB)</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              {uploading && (
                <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 animate-pulse rounded-full" style={{ width: "70%" }} />
                </div>
              )}
              {error && (
                <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Confirmation Note */}
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 text-center">
          <p className="text-sky-700 text-sm leading-relaxed">
            🕐 We will review your payment and confirm your registration <strong>within 24 hours</strong>. A confirmation email will be sent to the address you provided.
          </p>
        </div>
      </div>
    </div>
  );
}
