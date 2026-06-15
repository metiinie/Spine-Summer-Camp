const fs = require('fs');

const path = 'src/components/registration/MultiStepForm.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('useTranslations')) {
  content = content.replace('import { useState, useEffect } from "react";', 'import { useState, useEffect } from "react";\nimport { useTranslations } from "next-intl";');
  content = content.replace('export function MultiStepForm({ locale }: MultiStepFormProps) {', 'export function MultiStepForm({ locale }: MultiStepFormProps) {\n  const t = useTranslations("register");');
}

// Camper Info replacements
content = content.replace(/>Camper Information</g, '>{t("camper.title")}<');
content = content.replace(/>First Name \*/g, '>{t("camper.firstName")} *');
content = content.replace(/>Last Name \*/g, '>{t("camper.lastName")} *');
content = content.replace(/>Date of Birth \*/g, '>{t("camper.dateOfBirth")} *');
content = content.replace(/>Gender \*/g, '>{t("camper.gender")} *');
content = content.replace(/>Grade Level \*/g, '>{t("camper.gradeLevel")} *');
content = content.replace(/>T-Shirt Size \*/g, '>{t("camper.tShirtSize")} *');
content = content.replace(/>School Name \*/g, '>{t("camper.schoolName")} *');

// Parent Info replacements
content = content.replace(/>Parent \/ Guardian Information</g, '>{t("parent.title")}<');
content = content.replace(/>Primary Contact</g, '>{t("parent.primaryContact")}<');
content = content.replace(/>Secondary Contact \(Optional\)</g, '>{t("parent.secondaryContact")}<');
content = content.replace(/>Full Name \*/g, '>{t("parent.name")} *');
content = content.replace(/>Relationship \*/g, '>{t("parent.relationship")} *');
content = content.replace(/>Phone Number \*/g, '>{t("parent.phone")} *');
content = content.replace(/>Email Address \*/g, '>{t("parent.email")} *');
content = content.replace(/>Residential Address</g, '>{t("parent.address")}<');
content = content.replace(/>Sub-City \*/g, '>{t("parent.subCity")} *');
content = content.replace(/>Woreda \*/g, '>{t("parent.district")} *');
content = content.replace(/>House No\.</g, '>{t("parent.houseNumber")}<');

// Session Info
content = content.replace(/>Select Your Session</g, '>{t("session.title")}<');
content = content.replace(/>Choose the session that works best for your family</g, '>{t("session.subtitle")}<');

// Medical Info
content = content.replace(/>Medical Information</g, '>{t("medical.title")}<');
content = content.replace(/>All fields are optional\. Leave blank if not applicable\.</g, '>{t("medical.subtitle")}<');
content = content.replace(/>Allergies</g, '>{t("medical.allergies")}<');
content = content.replace(/>Medical Conditions \/ Current Medications</g, '>{t("medical.conditions")}<');
content = content.replace(/>Dietary Restrictions</g, '>{t("medical.dietary")}<');

// Review Info
content = content.replace(/>Review Your Registration</g, '>{t("review.title")}<');
content = content.replace(/>Please verify all information before submitting\.</g, '>{t("review.subtitle")}<');

// Add missing keys to am.json / en.json if needed
const updateJson = (filename, locale) => {
  const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const root = data[locale];
  
  if (!root.register.buttons) root.register.buttons = {};
  root.register.buttons.next = locale === 'en' ? "Next" : "ቀጣይ";
  root.register.buttons.back = locale === 'en' ? "Back" : "ተመለስ";
  root.register.buttons.submit = locale === 'en' ? "Submit Registration ✓" : "ምዝገባ ያስገቡ ✓";
  root.register.buttons.submitting = locale === 'en' ? "Submitting..." : "በማስገባት ላይ...";
  
  root.register.camper.age = locale === 'en' ? "Age" : "ዕድሜ";
  root.register.camper.height = locale === 'en' ? "Height (cm)" : "ቁመት (ሴሜ)";
  root.register.camper.weight = locale === 'en' ? "Weight (kg)" : "ክብደት (ኪግ)";
  root.register.parent.nameLabel = locale === 'en' ? "Name" : "ስም";
  root.register.parent.phoneLabel = locale === 'en' ? "Phone" : "ስልክ";
  
  root.register.medical.allergiesPlaceholder = locale === 'en' ? "List any food or environmental allergies..." : "ማንኛቸውም የምግብ ወይም የአካባቢ አለርጂዎችን ዘርዝሩ...";
  root.register.medical.conditionsPlaceholder = locale === 'en' ? "Describe any conditions or medications staff should know about..." : "ካምፕ ሠራተኞቹ ሊያውቁት የሚገባ ሕክምናዊ ሁኔታዎች ወይም መድሃኒቶችን ይግለጹ...";
  root.register.medical.dietaryPlaceholder = locale === 'en' ? "e.g. vegetarian, halal, nut-free..." : "ለምሳሌ፦ የጾም፣ ሀላል፣ ለውዝ የሌለበት...";

  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
};

updateJson('messages/en.json', 'en');
updateJson('messages/am.json', 'am');

// Input placeholders
content = content.replace(/placeholder="List any food or environmental allergies\.\.\."/g, 'placeholder={t("medical.allergiesPlaceholder")}');
content = content.replace(/placeholder="Describe any conditions or medications staff should know about\.\.\."/g, 'placeholder={t("medical.conditionsPlaceholder")}');
content = content.replace(/placeholder="e\.g\. vegetarian, halal, nut-free\.\.\."/g, 'placeholder={t("medical.dietaryPlaceholder")}');

// Buttons
content = content.replace(/>Next: Parent Info →</g, '>{t("buttons.next")}: {t("steps.parent")} →<');
content = content.replace(/>Next: Session →</g, '>{t("buttons.next")}: {t("steps.session")} →<');
content = content.replace(/>Next: Medical →</g, '>{t("buttons.next")}: {t("steps.medical")} →<');
content = content.replace(/>Next: Consent →</g, '>{t("buttons.next")}: {locale === "am" ? "ስምምነት" : "Consent"} →<');
content = content.replace(/>Review →</g, '>{t("steps.review")} →<');
content = content.replace(/>← Back</g, '>← {t("buttons.back")}<');
content = content.replace(/>Submit Registration ✓</g, '>{t("buttons.submit")}<');
content = content.replace(/>Submitting\.\.\.</g, '>{t("buttons.submitting")}<');

// Other fields
content = content.replace(/>Age \*/g, '>{t("camper.age")} *');
content = content.replace(/>Height \(cm\) \*/g, '>{t("camper.height")} *');
content = content.replace(/>Weight \(kg\) \*/g, '>{t("camper.weight")} *');
content = content.replace(/>Name</g, '>{t("parent.nameLabel")}<');
content = content.replace(/>Phone</g, '>{t("parent.phoneLabel")}<');
content = content.replace(/>Camp Registration</g, '>{t("title")}<');
content = content.replace(/>Complete all steps to register your child</g, '>{t("subtitle")}<');

fs.writeFileSync(path, content);
console.log("Refactored MultiStepForm.tsx successfully");
