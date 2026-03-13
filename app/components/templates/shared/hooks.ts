import { useState, useEffect } from "react";

export function useCountdown(weddingDate?: Date | string | null) {
  const [cd, setCd] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const timer = setInterval(() => {
      const target = weddingDate ? new Date(weddingDate).getTime() : Date.now() + 864e5;
      const diff = Math.max(0, target - Date.now());
      setCd({
        d: Math.floor(diff / 864e5),
        h: Math.floor((diff % 864e5) / 36e5),
        m: Math.floor((diff % 36e5) / 6e4),
        s: Math.floor((diff % 6e4) / 1e3),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [weddingDate]);
  return cd;
}

export function useFormattedDate(weddingDate?: Date | string | null) {
  if (!weddingDate) return "Date TBD";
  return new Date(weddingDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
