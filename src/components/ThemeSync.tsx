"use client";

import { useEffect } from "react";

export default function ThemeSync() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      // Default is always LIGHT (white background) for all new users
      document.documentElement.classList.remove("dark");
      if (!savedTheme) {
        localStorage.setItem("theme", "light");
      }
    }

    // Student highlight/selection mode sync
    const syncSelectionMode = () => {
      const role = localStorage.getItem("medicinety_user_role");
      if (role === "admin") {
        document.documentElement.classList.remove("student-mode");
      } else {
        document.documentElement.classList.add("student-mode");
      }
    };

    syncSelectionMode();
    window.addEventListener("medicinety_auth_change", syncSelectionMode);
    return () => {
      window.removeEventListener("medicinety_auth_change", syncSelectionMode);
    };
  }, []);

  return null;
}
