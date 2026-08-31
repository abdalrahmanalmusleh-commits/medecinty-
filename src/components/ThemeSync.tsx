"use client";

import { useEffect } from "react";

export default function ThemeSync() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // Fallback to system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
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
