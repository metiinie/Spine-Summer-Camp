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
  ChevronDown,
} from "lucide-react";

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
}

const STATUS_COLORS: Record<Status, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-700 border-amber-200",
  RECEIPT_UPLOADED: "bg-blue-100 text-blue-700 border-blue-200",
  UNDER_REVIEW: "bg-purple-100 text-purple-700 border-purple-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
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

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/registrations?${params}`);
      const data = await res.json();
      setRegistrations(data);
    } catch {}
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => {
    const timeout = setTimeout(fetchRegistrations, 300);
    return () => clearTimeout(timeout);
  }, [fetchRegistrations]);

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

  const counts = {
    total: registrations.length,
    pending: registrations.filter((r) => r.status === "PENDING_PAYMENT" || r.status === "RECEIPT_UPLOADED" || r.status === "UNDER_REVIEW").length,
    approved: registrations.filter((r) => r.status === "APPROVED").length,
    rejected: registrations.filter((r) => r.status === "REJECTED").length,
  };

  // For total counts fetch all
  const [totalCounts, setTotalCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  useEffect(() => {
    fetch("/api/admin/registrations").then(r => r.json()).then(all => {
      setTotalCounts({
        total: all.length,
        pending: all.filter((r: Registration) => ["PENDING_PAYMENT","RECEIPT_UPLOADED","UNDER_REVIEW"].includes(r.status)).length,
        approved: all.filter((r: Registration) => r.status === "APPROVED").length,
        rejected: all.filter((r: Registration) => r.status === "REJECTED").length,
      });
    }).catch(() => {});
  }, [registrations]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 leading-tight">Admin Dashboard</h1>
              <p className="text-xs text-slate-500">Spine Summer Camp 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/api/admin/export"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </a>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: totalCounts.total, icon: Users, color: "text-slate-700", bg: "bg-slate-100" },
            { label: "Pending Review", value: totalCounts.pending, icon: Clock, color: "text-amber-700", bg: "bg-amber-100" },
            { label: "Approved", value: totalCounts.approved, icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-100" },
            { label: "Rejected", value: totalCounts.rejected, icon: XCircle, color: "text-red-700", bg: "bg-red-100" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-sm text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4">
          <div className="p-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:border-sky-400 outline-none"
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-y border-slate-100">
                <tr>
                  {["#", "Camper Name", "Parent", "Session", "Date", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={7} className="py-12 text-center text-slate-400">Loading...</td></tr>
                ) : registrations.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-slate-400">No registrations found.</td></tr>
                ) : (
                  registrations.map((reg, i) => (
                    <tr key={reg.id} className="hover:bg-slate-50 cursor-pointer transition" onClick={() => setSelected(reg)}>
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {reg.camper ? `${reg.camper.firstName} ${reg.camper.lastName}` : "–"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{reg.parent?.primaryName || "–"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${reg.session === "HALF_DAY" ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {reg.session === "HALF_DAY" ? "Half Day" : "Full Day"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{new Date(reg.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[reg.status]}`}>
                          {STATUS_LABELS[reg.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1 text-slate-400 hover:text-sky-500 transition" onClick={(e) => { e.stopPropagation(); setSelected(reg); }}>
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-bold text-slate-900">{selected.camper?.firstName} {selected.camper?.lastName}</h2>
                <p className="text-xs font-mono text-slate-500">{selected.referenceNumber}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-slate-100 transition">
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

              {/* Receipt */}
              {selected.receiptUrl && (
                <Section title="Payment Receipt">
                  {selected.receiptUrl.toLowerCase().endsWith(".pdf") ? (
                    <a href={selected.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-sky-500 underline text-sm">View PDF Receipt</a>
                  ) : (
                    <div className="mt-2">
                      <img
                        src={selected.receiptUrl}
                        alt="Receipt"
                        className="rounded-xl border border-slate-200 max-h-64 object-contain cursor-zoom-in w-full"
                        onClick={() => window.open(selected.receiptUrl!, "_blank")}
                      />
                      <p className="text-xs text-slate-400 mt-1 text-center">Click to zoom</p>
                    </div>
                  )}
                </Section>
              )}

              {/* Admin Note */}
              <Section title="Internal Admin Note">
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  placeholder="Private note visible only to admins..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-sky-400 outline-none transition resize-none"
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
                        className="w-full px-3 py-2 rounded-xl border border-red-200 text-sm focus:border-red-400 outline-none transition resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => { setShowRejectInput(false); setRejectReason(""); }} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition">Cancel</button>
                        <button onClick={() => handleAction("reject")} disabled={actionLoading} className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition disabled:opacity-60">
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
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-200 text-red-600 font-bold hover:bg-red-50 transition disabled:opacity-60"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                    </div>
                  )}
                </Section>
              )}

              {selected.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-red-700 mb-1">Rejection Reason</p>
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
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">{title}</h3>
      <div className="bg-slate-50 rounded-xl p-4 space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900 text-right max-w-[55%] truncate">{value}</span>
    </div>
  );
}
