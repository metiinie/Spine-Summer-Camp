export type PackageKey =
  | "FULL_PACKAGE_FULL_DAY"
  | "FULL_PACKAGE_HALF_DAY"
  | "MIXED_PACKAGE"
  | "SELF_PACKAGE";

export type MainActivityKey =
  | "FOOTBALL"
  | "SWIMMING"
  | "CYCLING"
  | "CULTURAL_DANCE"
  | "KARATE";

export const MAIN_ACTIVITIES: {
  key: MainActivityKey;
  label: { en: string; am: string };
  emoji: string;
}[] = [
  { key: "FOOTBALL", label: { en: "Football", am: "እግር ኳስ" }, emoji: "⚽" },
  { key: "SWIMMING", label: { en: "Swimming", am: "ዋና" }, emoji: "🏊" },
  { key: "CYCLING", label: { en: "Cycling", am: "ብስክሌት" }, emoji: "🚴" },
  { key: "CULTURAL_DANCE", label: { en: "Cultural Dance", am: "ባህላዊ ዳንስ" }, emoji: "💃" },
  { key: "KARATE", label: { en: "Karate", am: "ካራቴ" }, emoji: "🥋" },
];

export const GENERIC_ACTIVITIES = [
  {
    category: { en: "Art", am: "ጥበብ" },
    items: { en: "Origami, Craft (mud and sand craft)", am: "ኦሪጋሚ፣ የስነ-ጥበብ ስራዎች (የአፈር እና የአሸዋ ዕደ-ጥበብ)" },
    emoji: "🎨",
  },
  {
    category: { en: "Behavior", am: "ባህሪ" },
    items: { en: "Self Awareness, Aggression Management, Empathy, Public Speaking", am: "ራስን ማወቅ፣ ቁጣ ማስተዳደር፣ ሌሎችን መረዳት፣ በአደባባይ መናገር" },
    emoji: "🧠",
  },
  {
    category: { en: "Playing", am: "ጨዋታ" },
    items: { en: "Tug activity, Chess, Dart, Gaming competition", am: "የገመድ ጨዋታ፣ ቼዝ፣ ዳርት፣ የጨዋታ ውድድር" },
    emoji: "🎮",
  },
];

export const PACKAGE_CONFIG: Record<
  PackageKey,
  {
    label: { en: string; am: string };
    description: { en: string; am: string };
    session: "HALF_DAY" | "FULL_DAY";
    price: number;
    currency: string;
    activityRule: "all" | "pick2" | "pick1";
    requiredActivityCount: number;
    popular?: boolean;
  }
> = {
  FULL_PACKAGE_FULL_DAY: {
    label: { en: "Full Package – Full Day", am: "ሙሉ ፓኬጅ – ሙሉ ቀን" },
    description: {
      en: "All programs included (full day)",
      am: "ሁሉም ፕሮግራሞች ይካተታሉ (ሙሉ ቀን)",
    },
    session: "FULL_DAY",
    price: 40000,
    currency: "ETB",
    activityRule: "all",
    requiredActivityCount: 5,
    popular: true,
  },
  FULL_PACKAGE_HALF_DAY: {
    label: { en: "Full Package – Half Day", am: "ሙሉ ፓኬጅ – ግማሽ ቀን" },
    description: {
      en: "All programs included (half day)",
      am: "ሁሉም ፕሮግራሞች ይካተታሉ (ግማሽ ቀን)",
    },
    session: "HALF_DAY",
    price: 26000,
    currency: "ETB",
    activityRule: "all",
    requiredActivityCount: 5,
  },
  MIXED_PACKAGE: {
    label: { en: "Mixed Package", am: "የተቀላቀለ ፓኬጅ" },
    description: {
      en: "Two main activities with Generic programs",
      am: "ሁለት ዋና እንቅስቃሴዎች ከጄኔሪክ ፕሮግራሞች ጋር",
    },
    session: "HALF_DAY",
    price: 24000,
    currency: "ETB",
    activityRule: "pick2",
    requiredActivityCount: 2,
  },
  SELF_PACKAGE: {
    label: { en: "Self Package", am: "የራስ ፓኬጅ" },
    description: {
      en: "One chosen main activity with Generic programs",
      am: "አንድ የተመረጠ ዋና እንቅስቃሴ ከጄኔሪክ ፕሮግራሞች ጋር",
    },
    session: "HALF_DAY",
    price: 22000,
    currency: "ETB",
    activityRule: "pick1",
    requiredActivityCount: 1,
  },
};

/** Session schedule info — kept for display in the form and payment page */
export const SESSION_CONFIG = {
  HALF_DAY: {
    label: { en: "Session 1 – Half Day", am: "ክፍለ ጊዜ 1 – ግማሽ ቀን" },
    dates: { en: "July 8 – Aug 22, 2026 (Mon–Fri)", am: "ሐምሌ 1 – ነሐሴ 16, 2026 (ሰኞ–ዓርብ)" },
    hours: { en: "3:00 – 6:30 (Local Time)", am: "ጥዋት 3:00 – ቀኑ 6:30" },
    price: 26000,
    currency: "ETB",
  },
  FULL_DAY: {
    label: { en: "Session 2 – Full Day", am: "ክፍለ ጊዜ 2 – ሙሉ ቀን" },
    dates: { en: "July 8 – Aug 22, 2026 (Mon–Fri)", am: "ሐምሌ 1 – ነሐሴ 16, 2026 (ሰኞ–ዓርብ)" },
    hours: { en: "3:00 – 10:00 (Local Time)", am: "ጥዋት 3:00 – ከሰዓት 10:00" },
    price: 40000,
    currency: "ETB",
  },
} as const;

export const PAYMENT_ACCOUNTS = [
  {
    bankName: "CBE",
    accountNumber: "1000259068626",
    accountName: "Spine Sport Consultancy",
  },
  {
    bankName: "Zemen Bank",
    accountNumber: "1032210044060015",
    accountName: "Spine Sport Consultancy",
  }
];

export type SessionType = keyof typeof SESSION_CONFIG;
export const PACKAGE_KEYS = Object.keys(PACKAGE_CONFIG) as PackageKey[];
