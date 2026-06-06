"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function FirstVisitRedirect() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisitedSpineCamp");
    
    if (!hasVisited) {
      localStorage.setItem("hasVisitedSpineCamp", "true");
      router.replace("/register");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  // Optionally, you can return null if you want it to be completely invisible,
  // or a full-screen loading state if you want to block rendering while checking.
  // Returning null here is fine since it's just a logic component.
  if (isChecking) return null;

  return null;
}
