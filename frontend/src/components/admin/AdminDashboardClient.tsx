"use client";

import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Download,
  LogOut,
  Sun,
  Eye,
  X,
} from "lucide-react";
import { RegistrationCard } from "./RegistrationCard";

type Status = "PENDING_PAYMENT" | "RECEIPT_UPLOADED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

interface Registration {
  id: string;
  referenceNumber: string;
  status: Status;
  session: string;
  amount: string;
  receiptUrl: string | null;
  adminNote: string | null;
  rejectionReason: string | null;
  createdAt: string;
  camper: { firstName: string; lastName: string; gender: string; gradeLevel: string; schoolName: string; tShirtSize: string; dateOfBirth: string } | null;
  parent: { primaryName: string; primaryEmail: string; primaryPhone: string; primaryRelationship: string; subCity: string; district: string } | null;
  medicalInfo: { allergies: string | null; conditions: string | null; dietary: string | null } | null;
  waiver: { liabilityRelease: boolean; mediaRelease: boolean; parentSignature: string } | null;
}

const STATUS_COLORS: Record<Status, string> = {
  PENDING_PAYMENT: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  RECEIPT_UPLOADED: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  UNDER_REVIEW: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  APPROVED: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  REJECTED: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 dark:text-red-400 border-red-200 dark:border-red-800",
};

const STATUS_LABELS: Record<Status, string> = {
  PENDING_PAYMENT: "Pending Payment",
  RECEIPT_UPLOADED: "Receipt Uploaded",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function AdminDashboardClient() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Registration | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/registrations?${params}`);
      
      if (!res.ok) {
        console.error('Failed to fetch registrations:', res.status);
        setRegistrations([]);
        setLoading(false);
        return;
      }
      
      const response = await res.json();
      
      // Backend returns { data: [], meta: {} } structure
      if (response.data && Array.isArray(response.data)) {
        setRegistrations(response.data);
      } else if (Array.isArray(response)) {
        // Fallback if backend returns array directly
        setRegistrations(response);
      } else {
        console.error('Invalid data format received:', response);
        setRegistrations([]);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setRegistrations([]);
    }
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => {
    setCurrentPage(1);
    const timeout = setTimeout(fetchRegistrations, 300);
    return () => clearTimeout(timeout);
  }, [fetchRegistrations, statusFilter, search]);

  const handleAction = async (action: "approve" | "reject") => {
    if (!selected) return;
    if (action === "reject" && !rejectReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: selected.id,
          action,
          rejectionReason: action === "reject" ? rejectReason : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected(null);
        setRejectReason("");
        setShowRejectInput(false);
        fetchRegistrations();
      }
    } catch {}
    setActionLoading(false);
  };

  const handleSaveNote = async () => {
    if (!selected) return;
    setNoteLoading(true);
    try {
      await fetch("/api/admin/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: selected.id, adminNote }),
      });
      setSelected((prev) => prev ? { ...prev, adminNote } : null);
      fetchRegistrations();
    } catch {}
    setNoteLoading(false);
  };

  useEffect(() => {
    if (selected) setAdminNote(selected.adminNote || "");
  }, [selected]);


  // Compute total counts from already-fetched registrations
  const totalCounts = {
    total: registrations.length,
    pending: registrations.filter((r) => ["PENDING_PAYMENT","RECEIPT_UPLOADED","UNDER_REVIEW"].includes(r.status)).length,
    approved: registrations.filter((r) => r.status === "APPROVED").length,
    rejected: registrations.filter((r) => r.status === "REJECTED").length,
  };

  const totalPages = Math.ceil(registrations.length / itemsPerPage);
  const paginatedRegistrations = registrations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 dark:text-slate-100 leading-tight">Admin Dashboard</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Spine Summer Camp 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/api/admin/export"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </a>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: totalCounts.total, icon: Users, color: "text-slate-700 dark:text-slate-300", bg: "bg-slate-100 dark:bg-slate-800" },
            { label: "Pending Review", value: totalCounts.pending, icon: Clock, color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-100 dark:bg-amber-900/50" },
            { label: "Approved", value: totalCounts.approved, icon: CheckCircle2, color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-900/50" },
            { label: "Rejected", value: totalCounts.rejected, icon: XCircle, color: "text-red-700 dark:text-red-400 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mb-4">
          <div className="p-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search by name or reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-sky-400 dark:focus:border-sky-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="PENDING_PAYMENT">Pending Payment</option>
                <option value="RECEIPT_UPLOADED">Receipt Uploaded</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table View - Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
                <tr>
                  {["#", "Camper Name", "Parent", "Session", "Date", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">Loading...</td></tr>
                ) : registrations.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">No registrations found.</td></tr>
                ) : (
                  paginatedRegistrations.map((reg, i) => (
                    <tr key={reg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-900 cursor-pointer transition" onClick={() => setSelected(reg)}>
                      <td className="px-4 py-3 text-slate-400 dark:text-slate-500 font-mono text-xs">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        {reg.camper ? `${reg.camper.firstName} ${reg.camper.lastName}` : "–"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 dark:text-slate-500">{reg.parent?.primaryName || "–"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${reg.session === "HALF_DAY" ? "bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300" : "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"}`}>
                          {reg.session === "HALF_DAY" ? "Half Day" : "Full Day"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 dark:text-slate-500 text-xs">{new Date(reg.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[reg.status]}`}>
                          {STATUS_LABELS[reg.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-sky-500 transition" onClick={(e) => { e.stopPropagation(); setSelected(reg); }}>
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Card View - Mobile */}
          <div className="block md:hidden p-4">
            {loading ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">Loading...</div>
            ) : registrations.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">No registrations found.</div>
            ) : (
              <div className="space-y-4">
                {paginatedRegistrations.map((reg) => (
                  <RegistrationCard
                    key={reg.id}
                    registration={reg}
                    onView={() => setSelected(reg)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {!loading && registrations.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Showing <span className="font-medium text-slate-900 dark:text-slate-100">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-slate-900 dark:text-slate-100">{Math.min(currentPage * itemsPerPage, registrations.length)}</span> of <span className="font-medium text-slate-900 dark:text-slate-100">{registrations.length}</span> results
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full md:max-w-lg bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-slate-100">{selected.camper?.firstName} {selected.camper?.lastName}</h2>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 dark:text-slate-500">{selected.referenceNumber}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status badge */}
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${STATUS_COLORS[selected.status]}`}>
                {STATUS_LABELS[selected.status]}
              </span>

              {/* Camper */}
              <Section title="Camper Information">
                <Row label="Name" value={`${selected.camper?.firstName} ${selected.camper?.lastName}`} />
                <Row label="DOB" value={selected.camper?.dateOfBirth ? new Date(selected.camper.dateOfBirth).toLocaleDateString() : "–"} />
                <Row label="Gender" value={selected.camper?.gender || "–"} />
                <Row label="Grade" value={selected.camper?.gradeLevel || "–"} />
                <Row label="School" value={selected.camper?.schoolName || "–"} />
                <Row label="T-Shirt" value={selected.camper?.tShirtSize || "–"} />
              </Section>

              {/* Parent */}
              <Section title="Parent / Guardian">
                <Row label="Name" value={selected.parent?.primaryName || "–"} />
                <Row label="Relationship" value={selected.parent?.primaryRelationship || "–"} />
                <Row label="Phone" value={selected.parent?.primaryPhone || "–"} />
                <Row label="Email" value={selected.parent?.primaryEmail || "–"} />
                <Row label="Address" value={`${selected.parent?.subCity}, Woreda ${selected.parent?.district}`} />
              </Section>

              {/* Session */}
              <Section title="Session Details">
                <Row label="Session" value={selected.session === "HALF_DAY" ? "Session 1 – Half Day" : "Session 2 – Full Day"} />
                <Row label="Amount" value={`${Number(selected.amount).toLocaleString()} ETB`} />
              </Section>

              {/* Medical */}
              <Section title="Medical Info">
                <Row label="Allergies" value={selected.medicalInfo?.allergies || "None"} />
                <Row label="Conditions" value={selected.medicalInfo?.conditions || "None"} />
                <Row label="Dietary" value={selected.medicalInfo?.dietary || "None"} />
              </Section>

              {/* Waiver & Terms */}
              <Section title="Waiver & Terms">
                <Row label="Liability Release" value={selected.waiver?.liabilityRelease ? "Agreed" : "No"} />
                <Row label="Media Consent" value={selected.waiver?.mediaRelease ? "Agreed" : "Declined"} />
                <Row label="Parent Signature" value={selected.waiver?.parentSignature || "–"} />
              </Section>

              {/* Receipt */}
              {selected.receiptUrl && (
                <Section title="Payment Receipt">
                  {(() => {
                    // Rewrite backend absolute URL to proxied relative path
                    const rawUrl = selected.receiptUrl;
                    const proxyUrl = rawUrl.replace(/^https?:\/\/[^/]+\/uploads\//, "/uploads/");
                    const isPdf = proxyUrl.toLowerCase().includes(".pdf");
                    return isPdf ? (
                      <a href={proxyUrl} target="_blank" rel="noopener noreferrer" className="text-sky-500 underline text-sm">
                        View PDF Receipt
                      </a>
                    ) : (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={proxyUrl}
                          alt="Payment Receipt"
                          className="mt-2 w-full max-h-72 rounded-xl border border-slate-200 dark:border-slate-700 object-contain cursor-zoom-in"
                          onClick={() => window.open(proxyUrl, "_blank")}
                        />
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-center">Click to zoom</p>
                      </>
                    );
                  })()}
                </Section>
              )}

              {/* Admin Note */}
              <Section title="Internal Admin Note">
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  placeholder="Private note visible only to admins..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:border-sky-400 dark:focus:border-sky-500 outline-none transition resize-none placeholder:text-slate-400"
                />
                <button
                  onClick={handleSaveNote}
                  disabled={noteLoading}
                  className="mt-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition disabled:opacity-60"
                >
                  {noteLoading ? "Saving..." : "Save Note"}
                </button>
              </Section>

              {/* Actions */}
              {selected.status !== "APPROVED" && selected.status !== "REJECTED" && (
                <Section title="Actions">
                  {showRejectInput ? (
                    <div className="space-y-3">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                        placeholder="Explain why this registration is being rejected..."
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-red-200 dark:border-red-800 text-sm focus:border-red-400 outline-none transition resize-none placeholder:text-slate-400"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => { setShowRejectInput(false); setRejectReason(""); }} className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 dark:text-slate-500 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-900 transition">Cancel</button>
                        <button onClick={() => handleAction("reject")} disabled={actionLoading} className="flex-1 py-2 rounded-xl bg-red-50 dark:bg-red-900/200 text-white text-sm font-bold hover:bg-red-600 transition disabled:opacity-60">
                          {actionLoading ? "Rejecting..." : "Confirm Reject"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAction("approve")}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-bold hover:opacity-90 transition disabled:opacity-60"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        {actionLoading ? "Processing..." : "Approve"}
                      </button>
                      <button
                        onClick={() => setShowRejectInput(true)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-600 font-bold hover:bg-red-50 dark:bg-red-900/20 transition disabled:opacity-60"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                    </div>
                  )}
                </Section>
              )}

              {selected.rejectionReason && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400 dark:text-red-400 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-600">{selected.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">{title}</h3>
      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">{label}</span>
      <span className="font-medium text-slate-900 dark:text-slate-100 text-right max-w-[55%] truncate">{value}</span>
    </div>
  );
}
