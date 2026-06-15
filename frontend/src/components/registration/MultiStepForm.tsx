"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  camperSchema,
  parentSchema,
  sessionSchema,
  medicalSchema,
  waiverSchema,
  type CamperFormData,
  type StoredCamperData,
  type ParentFormData,
  type SessionFormData,
  type MedicalFormData,
  type WaiverFormData,
} from "@/lib/validations";
import { SESSION_CONFIG } from "@/lib/constants";
import {
  User,
  Users,
  Calendar,
  Heart,
  ClipboardCheck,
  CheckCircle2,
  Sun,
  Star,
  FileText,
} from "lucide-react";

const STORAGE_KEY = "spine_camp_registration";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STEPS = [
  { id: "camper", icon: User, label: "Camper Info" },
  { id: "parent", icon: Users, label: "Parent Info" },
  { id: "session", icon: Calendar, label: "Session" },
  { id: "medical", icon: Heart, label: "Medical" },
  { id: "waiver", icon: FileText, label: "Consent" },
  { id: "review", icon: ClipboardCheck, label: "Review" },
];

interface FullFormData {
  camper: StoredCamperData;
  parent: ParentFormData;
  session: SessionFormData;
  medical: MedicalFormData;
  waiver: WaiverFormData;
  idempotencyKey: string;
}

interface MultiStepFormProps {
  locale: string;
}

export function MultiStepForm({ locale }: MultiStepFormProps) {
  const t = useTranslations("register");
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<FullFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData({ idempotencyKey: crypto.randomUUID(), ...(parsed.data || {}) });
        setStep(parsed.step || 0);
        return;
      } catch {}
    }
    setFormData({ idempotencyKey: crypto.randomUUID() });
  }, []);

  // Save to localStorage whenever step/data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, data: formData }));
  }, [step, formData]);

  const camperForm = useForm<CamperFormData>({
    resolver: zodResolver(camperSchema),
    defaultValues: formData.camper,
  });
  const parentForm = useForm<ParentFormData>({
    resolver: zodResolver(parentSchema),
    defaultValues: formData.parent,
  });
  const sessionForm = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: formData.session,
  });
  const medicalForm = useForm<MedicalFormData>({
    resolver: zodResolver(medicalSchema),
    defaultValues: formData.medical,
  });
  const waiverForm = useForm<WaiverFormData>({
    resolver: zodResolver(waiverSchema),
    defaultValues: formData.waiver,
  });

  const handleNextCamper = camperForm.handleSubmit((data) => {
    // Parse numeric fields from string inputs
    const height = parseFloat(data.height as any);
    const weight = parseFloat(data.weight as any);

    // Validate numeric ranges
    if (isNaN(height) || height < 50 || height > 220) {
      camperForm.setError("height", { message: "Height must be 50–220 cm" });
      return;
    }
    if (isNaN(weight) || weight < 10 || weight > 150) {
      camperForm.setError("weight", { message: "Weight must be 10–150 kg" });
      return;
    }

    const camperData: StoredCamperData = {
      ...(data as CamperFormData),
      height: String(height),
      weight: String(weight),
    };
    setFormData((prev) => ({ ...prev, camper: camperData }));
    setStep(1);
  });
  const handleNextParent = parentForm.handleSubmit((data) => {
    setFormData((prev) => ({ ...prev, parent: data }));
    setStep(2);
  });
  const handleNextSession = sessionForm.handleSubmit((data) => {
    setFormData((prev) => ({ ...prev, session: data }));
    setStep(3);
  });
  const handleNextMedical = medicalForm.handleSubmit((data) => {
    setFormData((prev) => ({ ...prev, medical: data }));
    setStep(4);
  });
  const handleNextWaiver = waiverForm.handleSubmit((data) => {
    setFormData((prev) => ({ ...prev, waiver: data }));
    setStep(5);
  });

  const handleSubmit = async () => {
    if (!formData.camper || !formData.parent || !formData.session || !formData.waiver) return;
    setIsSubmitting(true);
    try {
      // Convert string numeric fields to numbers for the backend
      const { ...restCamper } = formData.camper as any;
      const payload = {
        ...formData,
        camper: {
          ...restCamper,
          height: formData.camper.height ? parseFloat(formData.camper.height) : undefined,
          weight: formData.camper.weight ? parseFloat(formData.camper.weight) : undefined,
        },
      };
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        // Backend sends errors as 'message' (string or string[])
        const errMsg = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || data.error || "Failed to submit registration";
        throw new Error(errMsg);
      }
      localStorage.removeItem(STORAGE_KEY);
      router.push(`/payment/${data.id}`);
    } catch (err: unknown) {
      console.error("Registration submit error:", err);
      alert(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSession = formData.session?.session
    ? SESSION_CONFIG[formData.session.session]
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 w-full max-w-2xl mx-auto">
          {/* Progress Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 text-center mb-2">{t("title")}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-8">{t("subtitle")}</p>
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        i < step
                          ? "bg-emerald-500 text-white"
                          : i === step
                          ? "bg-sky-500 text-white ring-4 ring-sky-200 dark:ring-sky-900"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                      }`}
                    >
                      {i < step ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-sky-600" : "text-slate-400"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                        i < step ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-800"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 dark:border-slate-800 p-4 md:p-6 lg:p-8">
          {/* Step 0: Camper Info */}
          {step === 0 && (
            <form onSubmit={handleNextCamper} className="space-y-5">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">{t("camper.title")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("camper.firstName")} *</label>
                  <input
                    {...camperForm.register("firstName")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition"
                    placeholder="e.g. Abebe"
                  />
                  {camperForm.formState.errors.firstName && (
                    <p className="text-red-500 text-xs md:text-sm mt-1">{camperForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("camper.lastName")} *</label>
                  <input
                    {...camperForm.register("lastName")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition"
                    placeholder="e.g. Bekele"
                  />
                  {camperForm.formState.errors.lastName && (
                    <p className="text-red-500 text-xs md:text-sm mt-1">{camperForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("camper.age")} *</label>
                  <input
                    type="number"
                    {...camperForm.register("age")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition"
                    placeholder="e.g. 10"
                  />
                  {camperForm.formState.errors.age && (
                    <p className="text-red-500 text-xs md:text-sm mt-1">{camperForm.formState.errors.age.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("camper.gender")} *</label>
                  <select
                    {...camperForm.register("gender")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition"
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                  {camperForm.formState.errors.gender && (
                    <p className="text-red-500 text-xs md:text-sm mt-1">{camperForm.formState.errors.gender.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("camper.height")} *</label>
                  <input
                    type="number"
                    {...camperForm.register("height")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="e.g. 140"
                  />
                  {camperForm.formState.errors.height && (
                    <p className="text-red-500 text-xs md:text-sm mt-1">{camperForm.formState.errors.height.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("camper.weight")} *</label>
                  <input
                    type="number"
                    {...camperForm.register("weight")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="e.g. 35"
                  />
                  {camperForm.formState.errors.weight && (
                    <p className="text-red-500 text-xs md:text-sm mt-1">{camperForm.formState.errors.weight.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("camper.gradeLevel")} *</label>
                  <select
                    {...camperForm.register("gradeLevel")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition"
                  >
                    <option value="">Select grade</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={`Grade ${i + 1}`}>
                        Grade {i + 1}
                      </option>
                    ))}
                  </select>
                  {camperForm.formState.errors.gradeLevel && (
                    <p className="text-red-500 text-xs md:text-sm mt-1">{camperForm.formState.errors.gradeLevel.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("camper.tShirtSize")} *</label>
                  <select
                    {...camperForm.register("tShirtSize")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition"
                  >
                    <option value="">Select size</option>
                    <option value="YOUTH_S">Youth Small (S)</option>
                    <option value="YOUTH_M">Youth Medium (M)</option>
                    <option value="YOUTH_L">Youth Large (L)</option>
                  </select>
                  {camperForm.formState.errors.tShirtSize && (
                    <p className="text-red-500 text-xs md:text-sm mt-1">{camperForm.formState.errors.tShirtSize.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("camper.schoolName")} *</label>
                <input
                  {...camperForm.register("schoolName")}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition"
                  placeholder="e.g. Addis Ababa International School"
                />
                {camperForm.formState.errors.schoolName && (
                  <p className="text-red-500 text-xs md:text-sm mt-1">{camperForm.formState.errors.schoolName.message}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold hover:opacity-90 transition mt-4"
              >
                Next: Parent Info →
              </button>
            </form>
          )}

          {/* Step 1: Parent Info */}
          {step === 1 && (
            <form onSubmit={handleNextParent} className="space-y-5">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{t("parent.title")}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-semibold uppercase tracking-wide">{t("parent.primaryContact")}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("parent.name")} *</label>
                  <input {...parentForm.register("primaryName")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition" placeholder="Full name" />
                  {parentForm.formState.errors.primaryName && <p className="text-red-500 text-xs md:text-sm mt-1">{parentForm.formState.errors.primaryName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("parent.relationship")} *</label>
                  <select {...parentForm.register("primaryRelationship")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition">
                    <option value="">Select</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                  {parentForm.formState.errors.primaryRelationship && <p className="text-red-500 text-xs md:text-sm mt-1">{parentForm.formState.errors.primaryRelationship.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("parent.phone")} *</label>
                  <input {...parentForm.register("primaryPhone")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition" placeholder="+251 9XX XXX XXX" />
                  {parentForm.formState.errors.primaryPhone && <p className="text-red-500 text-xs md:text-sm mt-1">{parentForm.formState.errors.primaryPhone.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("parent.email")} *</label>
                  <input type="email" {...parentForm.register("primaryEmail")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition" placeholder="email@example.com" />
                  {parentForm.formState.errors.primaryEmail && <p className="text-red-500 text-xs md:text-sm mt-1">{parentForm.formState.errors.primaryEmail.message}</p>}
                </div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-semibold uppercase tracking-wide">{t("parent.secondaryContact")}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("parent.nameLabel")}</label>
                    <input {...parentForm.register("secondaryName")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition" placeholder="Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("parent.phoneLabel")}</label>
                    <input {...parentForm.register("secondaryPhone")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition" placeholder="Phone" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Relationship</label>
                    <input {...parentForm.register("secondaryRelationship")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition" placeholder="e.g. Uncle" />
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-semibold uppercase tracking-wide">{t("parent.address")}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("parent.subCity")} *</label>
                    <input {...parentForm.register("subCity")} autoComplete="off" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition" placeholder="e.g. Bole" />
                    {parentForm.formState.errors.subCity && <p className="text-red-500 text-xs md:text-sm mt-1">{parentForm.formState.errors.subCity.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("parent.district")} *</label>
                    <input {...parentForm.register("district")} autoComplete="off" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition" placeholder="e.g. 03" />
                    {parentForm.formState.errors.district && <p className="text-red-500 text-xs md:text-sm mt-1">{parentForm.formState.errors.district.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("parent.houseNumber")}</label>
                    <input {...parentForm.register("houseNumber")} autoComplete="off" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition" placeholder="Optional" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setStep(0)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 font-semibold hover:bg-slate-50 dark:bg-slate-800/50 transition">← {t("buttons.back")}</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold hover:opacity-90 transition">{t("buttons.next")}: {t("steps.session")} →</button>
              </div>
            </form>
          )}

          {/* Step 2: Session */}
          {step === 2 && (
            <form onSubmit={handleNextSession} className="space-y-5">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{t("session.title")}</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">{t("session.subtitle")}</p>
              <div className="space-y-4">
                {(["HALF_DAY", "FULL_DAY"] as const).map((key) => {
                  const config = SESSION_CONFIG[key];
                  const selected = sessionForm.watch("session") === key;
                  return (
                    <label
                      key={key}
                      className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        selected ? "border-sky-400 bg-sky-50 dark:bg-sky-900/20" : "border-slate-200 dark:border-slate-700 hover:border-sky-200 dark:hover:border-sky-500"
                      }`}
                    >
                      <input type="radio" value={key} {...sessionForm.register("session")} className="mt-1 accent-sky-500" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {key === "HALF_DAY" ? <Sun className="w-4 h-4 text-sky-500" /> : <Star className="w-4 h-4 text-emerald-500" />}
                          <span className="font-bold text-slate-900 dark:text-slate-100">{config.label.en}</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{config.dates.en}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{config.hours.en}</p>
                        <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{config.price.toLocaleString()} <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{config.currency}</span></p>
                      </div>
                    </label>
                  );
                })}
              </div>
              {sessionForm.formState.errors.session && (
                <p className="text-red-500 text-sm">{sessionForm.formState.errors.session.message}</p>
              )}
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 font-semibold hover:bg-slate-50 dark:bg-slate-800/50 transition">← {t("buttons.back")}</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold hover:opacity-90 transition">{t("buttons.next")}: {t("steps.medical")} →</button>
              </div>
            </form>
          )}

          {/* Step 3: Medical */}
          {step === 3 && (
            <form onSubmit={handleNextMedical} className="space-y-5">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{t("medical.title")}</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-4">{t("medical.subtitle")}</p>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("medical.allergies")}</label>
                <textarea {...medicalForm.register("allergies")} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition resize-none" placeholder={t("medical.allergiesPlaceholder")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("medical.conditions")}</label>
                <textarea {...medicalForm.register("conditions")} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition resize-none" placeholder={t("medical.conditionsPlaceholder")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("medical.dietary")}</label>
                <textarea {...medicalForm.register("dietary")} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition resize-none" placeholder={t("medical.dietaryPlaceholder")} />
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 font-semibold hover:bg-slate-50 dark:bg-slate-800/50 transition">← {t("buttons.back")}</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold hover:opacity-90 transition">{t("buttons.next")}: {locale === "am" ? "ስምምነት" : "Consent"} →</button>
              </div>
            </form>
          )}

          {/* Step 4: Consent & Waivers */}
          {step === 4 && (
            <form onSubmit={handleNextWaiver} className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                {locale === "am" ? "የስምምነት ማረጋገጫ (Authorization & Consent)" : "Terms & Waivers"}
              </h2>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">
                  {locale === "am" ? "የህክምና እና የኃላፊነት ስምምነት (Liability & Medical Release)" : "Liability & Medical Release"}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {locale === "am" 
                    ? "እኔ ስሜ ከላይ የተጠቀሰው ወላጅ/ተወካይ ልጄ በዚህ የክረምት ሰመር ካምፕ ፕሮግራም ላይ እንዲሳተፍ የፈቀድኩ ሲሆን በፕሮግራሙ ወቅት ለልጄ ደህንነት አስፈላጊውን ጥንቃቄ እንደሚደረግ ተረድቻለሁ፡፡"
                    : "I hereby grant permission for my child to participate in all camp activities. In the event of an emergency, I authorize the camp staff to secure necessary medical treatment for my child if I cannot be reached. I release the camp organizers and staff from liability for any injuries sustained during camp activities."}
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" {...waiverForm.register("liabilityRelease")} className="mt-1 w-5 h-5 text-sky-500 rounded border-slate-300 accent-sky-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {locale === "am" ? "በህክምና እና የኃላፊነት ስምምነቱ እስማማለሁ" : "I agree to the liability and medical release"}
                  </span>
                </label>
                {waiverForm.formState.errors.liabilityRelease && <p className="text-red-500 text-xs md:text-sm mt-1">{waiverForm.formState.errors.liabilityRelease.message}</p>}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">
                  {locale === "am" ? "የፎቶ እና ሚዲያ ስምምነት (Photo & Media Release)" : "Photo & Media Release"}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {locale === "am"
                    ? "ካምፑ የልጄን ፎቶዎች ወይም ቪዲዮዎች ለማስታወቂያ እና ማስተዋወቂያ ዓላማዎች (ድር ጣቢያ፣ ማህበራዊ ሚዲያ እና ብሮሹሮች) እንዲጠቀምበት ይፈቅዳሉ።"
                    : "Allow the camp to use photos or video footage of my child for promotional and marketing purposes (website, social media, and brochures)."}
                </p>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" value="true" {...waiverForm.register("mediaRelease")} className="w-4 h-4 text-sky-500 accent-sky-500" />
                    <span className="text-sm font-bold text-emerald-600">
                      {locale === "am" ? "እስማማለሁ (I AGREE)" : "I AGREE"}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" value="false" {...waiverForm.register("mediaRelease")} className="w-4 h-4 text-sky-500 accent-sky-500" />
                    <span className="text-sm font-bold text-rose-500">
                      {locale === "am" ? "አልስማማም (I DO NOT AGREE)" : "I DO NOT AGREE"}
                    </span>
                  </label>
                </div>
                {waiverForm.formState.errors.mediaRelease && <p className="text-red-500 text-xs md:text-sm mt-1">{waiverForm.formState.errors.mediaRelease.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {locale === "am" ? "የወላጅ/ተወካይ ፊርማ (Parent Signature) *" : "Parent/Guardian Signature *"}
                  </label>
                  <input {...waiverForm.register("parentSignature")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition" placeholder={locale === "am" ? "ሙሉ ስምዎን ይፃፉ" : "Type your full name"} />
                  {waiverForm.formState.errors.parentSignature && <p className="text-red-500 text-xs md:text-sm mt-1">{waiverForm.formState.errors.parentSignature.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {locale === "am" ? "ቀን (Date) *" : "Date *"}
                  </label>
                  <input type="date" {...waiverForm.register("dateSigned")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none transition" />
                  {waiverForm.formState.errors.dateSigned && <p className="text-red-500 text-xs md:text-sm mt-1">{waiverForm.formState.errors.dateSigned.message}</p>}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 font-semibold hover:bg-slate-50 dark:bg-slate-800/50 transition">← {t("buttons.back")}</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold hover:opacity-90 transition">{t("steps.review")} →</button>
              </div>
            </form>
          )}

          {/* Step 5: Review */}
          {step === 5 && formData.camper && formData.parent && formData.session && formData.waiver && (
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{t("review.title")}</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">{t("review.subtitle")}</p>
              <div className="space-y-4">
                <Section title="Camper Information">
                  <Row label="Name" value={`${formData.camper.firstName} ${formData.camper.lastName}`} />
                  <Row label="Age" value={String(formData.camper.age)} />
                  <Row label="Gender" value={formData.camper.gender} />
                  {formData.camper.height ? <Row label="Height" value={`${formData.camper.height} cm`} /> : null}
                  {formData.camper.weight ? <Row label="Weight" value={`${formData.camper.weight} kg`} /> : null}                  <Row label="Grade" value={formData.camper.gradeLevel} />
                  <Row label="School" value={formData.camper.schoolName} />
                  <Row label="T-Shirt" value={formData.camper.tShirtSize} />
                </Section>
                <Section title="Parent / Guardian">
                  <Row label="Name" value={formData.parent.primaryName} />
                  <Row label="Relationship" value={formData.parent.primaryRelationship} />
                  <Row label="Phone" value={formData.parent.primaryPhone} />
                  <Row label="Email" value={formData.parent.primaryEmail} />
                  <Row label="Address" value={`${formData.parent.subCity}, Woreda ${formData.parent.district}`} />
                </Section>
                <Section title="Session">
                  {selectedSession && (
                    <>
                      <Row label="Session" value={selectedSession.label.en} />
                      <Row label="Dates" value={selectedSession.dates.en} />
                      <Row label="Amount" value={`${selectedSession.price.toLocaleString()} ${selectedSession.currency}`} />
                    </>
                  )}
                </Section>
                {formData.medical && (
                  <Section title="Medical Info">
                    <Row label="Allergies" value={formData.medical.allergies || "None"} />
                    <Row label="Conditions" value={formData.medical.conditions || "None"} />
                    <Row label="Dietary" value={formData.medical.dietary || "None"} />
                  </Section>
                )}
                {formData.waiver && (
                  <Section title="Waivers & Consent">
                    <Row label="Liability Release" value="Agreed" />
                    <Row label="Media Release" value={formData.waiver.mediaRelease === "true" ? "Agreed" : "Declined"} />
                    <Row label="Signature" value={formData.waiver.parentSignature} />
                    <Row label="Date" value={formData.waiver.dateSigned} />
                  </Section>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setStep(4)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 font-semibold hover:bg-slate-50 dark:bg-slate-800/50 transition">← {t("buttons.back")}</button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold hover:opacity-90 transition disabled:opacity-60"
                >
                  {isSubmitting ? "Submitting..." : "Submit Registration ✓"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      

      
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-medium text-slate-900 dark:text-slate-100 text-right max-w-[60%]">{value}</span>
    </div>
  );
}

