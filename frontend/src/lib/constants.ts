export const SESSION_CONFIG = {
  HALF_DAY: {
    label: { en: "Session 1 – Half Day", am: "ክፍለ ጊዜ 1 – ግማሽ ቀን" },
    dates: { en: "July 8 – Aug 22, 2026 (Morning)", am: "ሐምሌ 1 – ነሐሴ 16, 2026 (ጥዋት)" },
    hours: { en: "3:00 – 6:30 (Local Time)", am: "ጥዋት 3:00 – ቀኑ 6:30" },
    price: 26000,
    currency: "ETB",
  },
  FULL_DAY: {
    label: { en: "Session 2 – Full Day", am: "ክፍለ ጊዜ 2 – ሙሉ ቀን" },
    dates: { en: "July 8 – Aug 22, 2026 (Full Day)", am: "ሐምሌ 1 – ነሐሴ 16, 2026 (ሙሉ ቀን)" },
    hours: { en: "3:00 – 10:00 (Local Time)", am: "ጥዋት 3:00 – ከሰዓት 10:00" },
    price: 40000,
    currency: "ETB",
  },
} as const;

export const PAYMENT_CONFIG = {
  bankName: "CBE Birr",
  accountNumber: "1000123456789",
  accountName: "Spine Summer Camp",
};

export type SessionType = keyof typeof SESSION_CONFIG;
