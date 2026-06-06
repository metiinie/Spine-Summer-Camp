import { z } from "zod";

export const camperSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required").refine((val) => {
    const dob = new Date(val);
    if (isNaN(dob.getTime())) return false;
    const ageDifMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age >= 4 && age <= 16;
  }, { message: "Age must be between 4 and 16 years old" }),
  gender: z.enum(["MALE", "FEMALE"], { required_error: "Gender is required" }),
  gradeLevel: z.string().min(1, "Grade level is required"),
  schoolName: z.string().min(2, "School name is required"),
  tShirtSize: z.enum(["YOUTH_S", "YOUTH_M", "YOUTH_L"], { required_error: "T-shirt size is required" }),
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
  session: z.enum(["HALF_DAY", "FULL_DAY"], { required_error: "Please select a session" }),
});

export const medicalSchema = z.object({
  allergies: z.string().optional(),
  conditions: z.string().optional(),
  dietary: z.string().optional(),
});

export const waiverSchema = z.object({
  liabilityRelease: z.boolean().refine(val => val === true, "You must agree to the liability release"),
  mediaRelease: z.enum(["true", "false"], { required_error: "Please specify your media release preference" }),
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
export type ParentFormData = z.infer<typeof parentSchema>;
export type SessionFormData = z.infer<typeof sessionSchema>;
export type MedicalFormData = z.infer<typeof medicalSchema>;
export type WaiverFormData = z.infer<typeof waiverSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;
