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
import { 
  SESSION_CONFIG, 
  PACKAGE_CONFIG, 
  PACKAGE_KEYS, 
  MAIN_ACTIVITIES, 
  GENERIC_ACTIVITIES,
  type PackageKey
} from "@/lib/constants";
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

function omitEmptyStrings<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => !(typeof value === "string" && value.trim() === ""))
  ) as Partial<T>;
}

function extractApiErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const record = data as Record<string, unknown>;
  const message = record.message;

  if (Array.isArray(message)) {
    const text = message.filter((item) => typeof item === "string" && item.trim()).join(", ");
    if (text) return text;
  }
  if (typeof message === "string" && message.trim()) return message;
  if (typeof record.error === "string" && record.error.trim()) return record.error;

  return fallback;
}


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
    resolver: zodResolver(camperSchema) as never,
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
    const height = parseFloat(data.height as string);
    const weight = parseFloat(data.weight as string);

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
    // Determine the session based on the selected package
    const pkgType = data.packageType as PackageKey;
    if (pkgType) {
      data.session = PACKAGE_CONFIG[pkgType].session;
    }
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
      const pkgType = formData.session.packageType as PackageKey | undefined;
      const session = {
        ...formData.session,
        session: formData.session.session ?? (pkgType ? PACKAGE_CONFIG[pkgType].session : undefined),
      };

      // Convert string numeric fields to numbers for the backend
      const { ...restCamper } = formData.camper as Record<string, unknown>;
      const payload = {
        idempotencyKey: formData.idempotencyKey,
        camper: {
          ...restCamper,
          height: formData.camper.height ? parseFloat(formData.camper.height) : undefined,
          weight: formData.camper.weight ? parseFloat(formData.camper.weight) : undefined,
        },
        parent: omitEmptyStrings(formData.parent as Record<string, unknown>),
        session,
        ...(formData.medical
          ? { medical: omitEmptyStrings(formData.medical as Record<string, unknown>) }
          : {}),
        waiver: {
          ...formData.waiver,
          liabilityRelease: formData.waiver.liabilityRelease === true || formData.waiver.liabilityRelease === "true",
          mediaRelease: formData.waiver.mediaRelease === "true" || formData.waiver.mediaRelease === true,
        },
      };
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let data: unknown;
      try {
        data = await res.json();
      } catch {
        throw new Error("Registration failed. Please try again.");
      }
      if (!res.ok) {
        throw new Error(extractApiErrorMessage(data, "Failed to submit registration. Please try again."));
      }
      const result = data as { id?: string };
      if (!result.id) {
        throw new Error("Registration failed. Please try again.");
      }
      localStorage.removeItem(STORAGE_KEY);
      router.push(`/payment/${result.id}`);
    } catch (err: unknown) {
      console.error("Registration submit error:", err);
      const message =
        err instanceof Error && err.message.trim()
          ? err.message
          : "Registration failed. Please try again.";
      alert(message);
      setIsSubmitting(false);
    }
  };

  const selectedPackage = formData.session?.packageType
    ? PACKAGE_CONFIG[formData.session.packageType as PackageKey]
    : null;
  
  const selectedSessionConfig = formData.session?.session 
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
                {t("buttons.next")}: {t("steps.parent")} →
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

          {/* Step 2: Package & Session */}
          {step === 2 && (
            <form onSubmit={handleNextSession} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{locale === "am" ? "ፓኬጅ ይምረጡ" : "Select Your Package"}</h2>
                <p className="text-slate-500 dark:text-slate-400">{t("session.subtitle")}</p>
              </div>

              <div className="space-y-4">
                {PACKAGE_KEYS.map((key) => {
                  const config = PACKAGE_CONFIG[key];
                  const selected = sessionForm.watch("packageType") === key;
                  return (
                    <label
                      key={key}
                      className={`flex flex-col sm:flex-row items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden ${
                        selected ? "border-sky-400 bg-sky-50 dark:bg-sky-900/20" : "border-slate-200 dark:border-slate-700 hover:border-sky-200 dark:hover:border-sky-500"
                      }`}
                    >
                      {config.popular && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                          Most Popular
                        </div>
                      )}
                      <input 
                        type="radio" 
                        value={key} 
                        {...sessionForm.register("packageType")}
                        onChange={(e) => {
                          const pkg = e.target.value as PackageKey;
                          sessionForm.setValue("packageType", pkg);
                          // Auto-derive session from the package
                          sessionForm.setValue("session", PACKAGE_CONFIG[pkg].session);
                          // Reset activities if rule changes, or auto-set for full packages
                          const rule = PACKAGE_CONFIG[pkg].activityRule;
                          if (rule === "all") {
                            sessionForm.setValue("selectedActivities", MAIN_ACTIVITIES.map(a => a.key));
                          } else {
                            sessionForm.setValue("selectedActivities", []);
                          }
                          sessionForm.trigger("selectedActivities");
                        }}
                        className="mt-1.5 accent-sky-500" 
                      />
                      <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            {config.session === "HALF_DAY" ? <Sun className="w-5 h-5 text-sky-500" /> : <Star className="w-5 h-5 text-emerald-500" />}
                            <span className="font-bold text-lg text-slate-900 dark:text-slate-100">
                              {locale === "am" ? config.label.am : config.label.en}
                            </span>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                              {config.price.toLocaleString()} <span className="text-sm font-semibold text-slate-500">{config.currency}</span>
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-3">
                          {locale === "am" ? config.description.am : config.description.en}
                        </p>
                        
                        {/* Generic Activities included in all packages */}
                        <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50 mb-3">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Included Generic Programs</p>
                          <div className="flex flex-wrap gap-2">
                            {GENERIC_ACTIVITIES.map((act, i) => (
                              <span key={i} className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300">
                                <span>{act.emoji}</span> {locale === "am" ? act.category.am : act.category.en}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
              {sessionForm.formState.errors.packageType && (
                <p className="text-red-500 text-sm">{sessionForm.formState.errors.packageType.message}</p>
              )}

              {/* Activity Selection for Mixed/Self Packages */}
              {(() => {
                const selectedPkgType = sessionForm.watch("packageType") as PackageKey;
                if (!selectedPkgType) return null;
                
                const rule = PACKAGE_CONFIG[selectedPkgType].activityRule;
                if (rule === "all") return null;

                const requiredCount = PACKAGE_CONFIG[selectedPkgType].requiredActivityCount;
                const currentSelection = sessionForm.watch("selectedActivities") || [];
                
                return (
                  <div className="bg-sky-50 dark:bg-slate-800/50 rounded-2xl p-5 md:p-6 border-2 border-sky-100 dark:border-slate-700 mt-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                      {locale === "am" ? "ዋና እንቅስቃሴዎችን ይምረጡ" : "Choose Main Activities"}
                    </h3>
                    <p className="text-sm text-sky-700 dark:text-sky-300 mb-4 font-medium">
                      {locale === "am" 
                        ? `እባክዎ ${requiredCount} እንቅስቃሴ${requiredCount > 1 ? 'ዎችን' : ''} ይምረጡ (የተመረጡት: ${currentSelection.length}/${requiredCount})`
                        : `Please select exactly ${requiredCount} activit${requiredCount > 1 ? 'ies' : 'y'} (Selected: ${currentSelection.length}/${requiredCount})`
                      }
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {MAIN_ACTIVITIES.map((activity) => {
                        const isSelected = currentSelection.includes(activity.key);
                        const isDisabled = !isSelected && currentSelection.length >= requiredCount;
                        
                        return (
                          <label 
                            key={activity.key}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected 
                                ? "border-sky-500 bg-white dark:bg-slate-900 shadow-sm" 
                                : isDisabled
                                  ? "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 opacity-60 cursor-not-allowed"
                                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-sky-300"
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              value={activity.key}
                              checked={isSelected}
                              disabled={isDisabled}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                let newSelection = [...currentSelection];
                                if (checked && newSelection.length < requiredCount) {
                                  newSelection.push(activity.key);
                                } else if (!checked) {
                                  newSelection = newSelection.filter(k => k !== activity.key);
                                }
                                sessionForm.setValue("selectedActivities", newSelection);
                                sessionForm.trigger("selectedActivities");
                              }}
                              className="w-4 h-4 text-sky-500 rounded border-slate-300 focus:ring-sky-500 accent-sky-500"
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{activity.emoji}</span>
                              <span className={`font-semibold text-sm ${isSelected ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                                {locale === "am" ? activity.label.am : activity.label.en}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    {sessionForm.formState.errors.selectedActivities && (
                      <p className="text-red-500 text-sm mt-3">{sessionForm.formState.errors.selectedActivities.message}</p>
                    )}
                  </div>
                );
              })()}

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
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
                <Section title="Package & Session">
                  {selectedPackage && selectedSessionConfig && (
                    <>
                      <Row label="Package" value={locale === "am" ? selectedPackage.label.am : selectedPackage.label.en} />
                      <Row label="Session" value={locale === "am" ? selectedSessionConfig.label.am : selectedSessionConfig.label.en} />
                      <Row label="Dates" value={locale === "am" ? selectedSessionConfig.dates.am : selectedSessionConfig.dates.en} />
                      <Row label="Amount" value={`${selectedPackage.price.toLocaleString()} ${selectedPackage.currency}`} />
                      
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Selected Main Activities</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.session.selectedActivities && formData.session.selectedActivities.length > 0 ? (
                            formData.session.selectedActivities.map(key => {
                              const act = MAIN_ACTIVITIES.find(a => a.key === key);
                              if (!act) return null;
                              return (
                                <span key={key} className="inline-flex items-center gap-1 bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 px-2.5 py-1 rounded-md text-xs font-semibold">
                                  {act.emoji} {locale === "am" ? act.label.am : act.label.en}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-sm text-slate-500">All Included</span>
                          )}
                        </div>
                      </div>
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

