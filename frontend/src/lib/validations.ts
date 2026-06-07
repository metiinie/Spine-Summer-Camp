import { z } from "zod";

export const camperSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dobMonth: z.string().min(1, "Month is required"),
  dobDay: z.string().min(1, "Day is required"),
  dobYear: z.string().min(4, "Year is required"),
  gender: z.enum(["MALE", "FEMALE"], { message: "Gender is required" }),
  gradeLevel: z.string().min(1, "Grade level is required"),
  schoolName: z.string().min(2, "School name is required"),
  tShirtSize: z.enum(["YOUTH_S", "YOUTH_M", "YOUTH_L"], { message: "T-shirt size is required" }),
  height: z.string().min(1, "Height is required"),
  weight: z.string().min(1, "Weight is required"),
});

export const parentSchema = z.object({
  primaryName: z.string().min(2, "Name must be at least 2 characters"),
  primaryRelationship: z.string().min(1, "Relationship is required"),
  primaryPhone: z.string().min(9, "Valid phone number is required"),
  primaryEmail: z.string().email("Valid email is required"),
  secondaryName: z.string().optional(),
  secondaryPhone: z.string().optional(),
  secondaryRelationship: z.string().optional(),
  subCity: z.string().min(1, "Sub-city is required"),
  district: z.string().min(1, "District is required"),
  houseNumber: z.string().optional(),
});

export const sessionSchema = z.object({
  session: z.enum(["HALF_DAY", "FULL_DAY"], { message: "Please select a session" }),
});

export const medicalSchema = z.object({
  allergies: z.string().optional(),
  conditions: z.string().optional(),
  dietary: z.string().optional(),
});

export const waiverSchema = z.object({
  liabilityRelease: z.boolean().refine(val => val === true, "You must agree to the liability release"),
  mediaRelease: z.enum(["true", "false"], { message: "Please specify your media release preference" }),
  parentSignature: z.string().min(2, "Parent/Guardian signature is required"),
  dateSigned: z.string().min(1, "Date is required"),
});

export const registrationSchema = z.object({
  camper: camperSchema,
  parent: parentSchema,
  session: sessionSchema,
  medical: medicalSchema,
  waiver: waiverSchema,
});

export type CamperFormData = z.infer<typeof camperSchema>;
export type CamperFormInput = CamperFormData;
// Extended type stored after submit — includes derived fields
export type StoredCamperData = CamperFormData & { dateOfBirth: string; age: number };
export type ParentFormData = z.infer<typeof parentSchema>;
export type SessionFormData = z.infer<typeof sessionSchema>;
export type MedicalFormData = z.infer<typeof medicalSchema>;
export type WaiverFormData = z.infer<typeof waiverSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;
