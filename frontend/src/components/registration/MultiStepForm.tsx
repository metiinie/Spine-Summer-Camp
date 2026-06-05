"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  camperSchema,
  parentSchema,
  sessionSchema,
  medicalSchema,
  type CamperFormData,
  type ParentFormData,
  type SessionFormData,
  type MedicalFormData,
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
} from "lucide-react";

const STORAGE_KEY = "spine_camp_registration";

const STEPS = [
  { id: "camper", icon: User, label: "Camper Info" },
  { id: "parent", icon: Users, label: "Parent Info" },
  { id: "session", icon: Calendar, label: "Session" },
  { id: "medical", icon: Heart, label: "Medical" },
  { id: "review", icon: ClipboardCheck, label: "Review" },
];

interface FullFormData {
  camper: CamperFormData;
  parent: ParentFormData;
  session: SessionFormData;
  medical: MedicalFormData;
}

interface MultiStepFormProps {
  locale: string;
}

export function MultiStepForm({ locale }: MultiStepFormProps) {
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
        setFormData(parsed.data || {});
        setStep(parsed.step || 0);
      } catch {}
    }
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

  const handleNextCamper = camperForm.handleSubmit((data) => {
    setFormData((prev) => ({ ...prev, camper: data }));
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

  const handleSubmit = async () => {
    if (!formData.camper || !formData.parent || !formData.session) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      localStorage.removeItem(STORAGE_KEY);
      router.push(`/payment/${data.id}`);
    } catch (err: any) {
      alert(err.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSession = formData.session?.session
    ? SESSION_CONFIG[formData.session.session]
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">Camp Registration</h1>
          <p className="text-slate-500 text-center mb-8">Complete all steps to register your child</p>
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
                          ? "bg-sky-500 text-white ring-4 ring-sky-200"
                          : "bg-slate-200 text-slate-400"
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
                        i < step ? "bg-emerald-400" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          {/* Step 0: Camper Info */}
          {step === 0 && (
            <form onSubmit={handleNextCamper} className="space-y-5">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Camper Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                  <input
                    {...camperForm.register("firstName")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
                    placeholder="e.g. Abebe"
                  />
                  {camperForm.formState.errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{camperForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                  <input
                    {...camperForm.register("lastName")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
                    placeholder="e.g. Bekele"
                  />
                  {camperForm.formState.errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{camperForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    {...camperForm.register("dateOfBirth")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
                  />
                  {camperForm.formState.errors.dateOfBirth && (
                    <p className="text-red-500 text-xs mt-1">{camperForm.formState.errors.dateOfBirth.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
                  <select
                    {...camperForm.register("gender")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition bg-white"
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {camperForm.formState.errors.gender && (
                    <p className="text-red-500 text-xs mt-1">{camperForm.formState.errors.gender.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Grade Level *</label>
                  <select
                    {...camperForm.register("gradeLevel")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition bg-white"
                  >
                    <option value="">Select grade</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={`Grade ${i + 1}`}>
                        Grade {i + 1}
                      </option>
                    ))}
                  </select>
                  {camperForm.formState.errors.gradeLevel && (
                    <p className="text-red-500 text-xs mt-1">{camperForm.formState.errors.gradeLevel.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">T-Shirt Size *</label>
                  <select
                    {...camperForm.register("tShirtSize")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition bg-white"
                  >
                    <option value="">Select size</option>
                    <option value="YOUTH_S">Youth Small (S)</option>
                    <option value="YOUTH_M">Youth Medium (M)</option>
                    <option value="YOUTH_L">Youth Large (L)</option>
                  </select>
                  {camperForm.formState.errors.tShirtSize && (
                    <p className="text-red-500 text-xs mt-1">{camperForm.formState.errors.tShirtSize.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">School Name *</label>
                <input
                  {...camperForm.register("schoolName")}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
                  placeholder="e.g. Addis Ababa International School"
                />
                {camperForm.formState.errors.schoolName && (
                  <p className="text-red-500 text-xs mt-1">{camperForm.formState.errors.schoolName.message}</p>
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
              <h2 className="text-xl font-bold text-slate-800 mb-2">Parent / Guardian Information</h2>
              <p className="text-sm text-slate-500 mb-4 font-semibold uppercase tracking-wide">Primary Contact</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                  <input {...parentForm.register("primaryName")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition" placeholder="Full name" />
                  {parentForm.formState.errors.primaryName && <p className="text-red-500 text-xs mt-1">{parentForm.formState.errors.primaryName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Relationship *</label>
                  <select {...parentForm.register("primaryRelationship")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition bg-white">
                    <option value="">Select</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                  {parentForm.formState.errors.primaryRelationship && <p className="text-red-500 text-xs mt-1">{parentForm.formState.errors.primaryRelationship.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                  <input {...parentForm.register("primaryPhone")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition" placeholder="+251 9XX XXX XXX" />
                  {parentForm.formState.errors.primaryPhone && <p className="text-red-500 text-xs mt-1">{parentForm.formState.errors.primaryPhone.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                  <input type="email" {...parentForm.register("primaryEmail")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition" placeholder="email@example.com" />
                  {parentForm.formState.errors.primaryEmail && <p className="text-red-500 text-xs mt-1">{parentForm.formState.errors.primaryEmail.message}</p>}
                </div>
              </div>
              <div className="border-t border-slate-100 pt-5">
                <p className="text-sm text-slate-500 mb-4 font-semibold uppercase tracking-wide">Secondary Contact (Optional)</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input {...parentForm.register("secondaryName")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition" placeholder="Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input {...parentForm.register("secondaryPhone")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition" placeholder="Phone" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Relationship</label>
                    <input {...parentForm.register("secondaryRelationship")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition" placeholder="e.g. Uncle" />
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-5">
                <p className="text-sm text-slate-500 mb-4 font-semibold uppercase tracking-wide">Residential Address</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Sub-City *</label>
                    <input {...parentForm.register("subCity")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition" placeholder="e.g. Bole" />
                    {parentForm.formState.errors.subCity && <p className="text-red-500 text-xs mt-1">{parentForm.formState.errors.subCity.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Woreda *</label>
                    <input {...parentForm.register("district")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition" placeholder="e.g. 03" />
                    {parentForm.formState.errors.district && <p className="text-red-500 text-xs mt-1">{parentForm.formState.errors.district.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">House No.</label>
                    <input {...parentForm.register("houseNumber")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition" placeholder="Optional" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setStep(0)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition">← Back</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold hover:opacity-90 transition">Next: Session →</button>
              </div>
            </form>
          )}

          {/* Step 2: Session */}
          {step === 2 && (
            <form onSubmit={handleNextSession} className="space-y-5">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Select Your Session</h2>
              <p className="text-slate-500 mb-6">Choose the session that works best for your family</p>
              <div className="space-y-4">
                {(["HALF_DAY", "FULL_DAY"] as const).map((key) => {
                  const config = SESSION_CONFIG[key];
                  const selected = sessionForm.watch("session") === key;
                  return (
                    <label
                      key={key}
                      className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        selected ? "border-sky-400 bg-sky-50" : "border-slate-200 hover:border-sky-200"
                      }`}
                    >
                      <input type="radio" value={key} {...sessionForm.register("session")} className="mt-1 accent-sky-500" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {key === "HALF_DAY" ? <Sun className="w-4 h-4 text-sky-500" /> : <Star className="w-4 h-4 text-emerald-500" />}
                          <span className="font-bold text-slate-900">{config.label.en}</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-1">{config.dates.en}</p>
                        <p className="text-sm text-slate-500 mb-2">{config.hours.en}</p>
                        <p className="text-xl font-extrabold text-slate-900">{config.price.toLocaleString()} <span className="text-sm font-semibold text-slate-500">{config.currency}</span></p>
                      </div>
                    </label>
                  );
                })}
              </div>
              {sessionForm.formState.errors.session && (
                <p className="text-red-500 text-sm">{sessionForm.formState.errors.session.message}</p>
              )}
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition">← Back</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold hover:opacity-90 transition">Next: Medical →</button>
              </div>
            </form>
          )}

          {/* Step 3: Medical */}
          {step === 3 && (
            <form onSubmit={handleNextMedical} className="space-y-5">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Medical Information</h2>
              <p className="text-slate-500 mb-4">All fields are optional. Leave blank if not applicable.</p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Allergies</label>
                <textarea {...medicalForm.register("allergies")} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition resize-none" placeholder="List any food or environmental allergies..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Medical Conditions / Current Medications</label>
                <textarea {...medicalForm.register("conditions")} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition resize-none" placeholder="Describe any conditions or medications staff should know about..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dietary Restrictions</label>
                <textarea {...medicalForm.register("dietary")} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition resize-none" placeholder="e.g. vegetarian, halal, nut-free..." />
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition">← Back</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold hover:opacity-90 transition">Review →</button>
              </div>
            </form>
          )}

          {/* Step 4: Review */}
          {step === 4 && formData.camper && formData.parent && formData.session && (
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Review Your Registration</h2>
              <p className="text-slate-500 mb-6">Please verify all information before submitting.</p>
              <div className="space-y-4">
                <Section title="Camper Information">
                  <Row label="Name" value={`${formData.camper.firstName} ${formData.camper.lastName}`} />
                  <Row label="Date of Birth" value={formData.camper.dateOfBirth} />
                  <Row label="Gender" value={formData.camper.gender} />
                  <Row label="Grade" value={formData.camper.gradeLevel} />
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
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition">← Back</button>
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
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900 text-right max-w-[60%]">{value}</span>
    </div>
  );
}
