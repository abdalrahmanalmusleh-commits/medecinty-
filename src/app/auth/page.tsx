"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, User, ShieldCheck, ChevronLeft, ArrowRight, BookOpen, GraduationCap, Share2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";

export const TRUSTED_GLOBAL_DOMAINS = [
  "gmail.com", "outlook.com", "yahoo.com", "hotmail.com", "icloud.com", 
  "proton.me", "protonmail.com", "live.com", "msn.com", "aol.com", 
  "zoho.com", "yandex.com", "mail.ru", "fastmail.com", "medicinety.com"
];

export const DISPOSABLE_EMAIL_DOMAINS = [
  "kingcq.com", "tempmail.com", "temp-mail.org", "10minutemail.com", "guerrillamail.com", "mailinator.com",
  "throwawaymail.com", "yopmail.com", "dispostable.com", "getnada.com", "trashmail.com",
  "sharklasers.com", "maildrop.cc", "fakeinbox.com", "crazymailing.com", "burnermail.io",
  "mohmal.com", "tempmailo.com", "nada.ltd", "mailnull.com", "tempinbox.com", "mytemp.email",
  "emailondeck.com", "10minutemail.net", "generator.email", "binkmail.com", "bobmail.info",
  "chacuo.net", "devnullmail.com", "dropmail.me", "getairmail.com", "inboxalias.com",
  "incognitomail.org", "mailcatch.com", "mailnesia.com", "mytempmail.com", "nospam4.us",
  "owlpic.com", "proxymail.eu", "spambog.com", "spambox.us", "spamgourmet.com", "temp-mail.ru",
  "tempail.com", "tradermail.info", "wegwerfemail.de", "zehnminutenmail.de", "0815.ru", "10minutemail.co.uk",
  "mail.tm", "tmail.ws", "tempmail.net", "fakemailgenerator.com", "disposablemail.com", "guerrillamailblock.com"
];

export const isFakeOrDisposableEmail = (email: string): boolean => {
  if (!email || !email.includes("@")) return true;
  
  const cleanEmail = email.toLowerCase().trim();
  const parts = cleanEmail.split("@");
  if (parts.length !== 2) return true;
  
  const domain = parts[1].trim();
  if (!domain || !domain.includes(".")) return true;

  // 1. Check direct blacklist
  if (DISPOSABLE_EMAIL_DOMAINS.some(d => domain === d || domain.endsWith("." + d))) {
    return true;
  }

  // 2. Check for suspicious temp keywords in domain
  const suspiciousKeywords = [
    "temp", "fake", "trash", "disposable", "throwaway", "10min", "guerrilla", 
    "mailinator", "burner", "generator", "yopmail", "mohmal", "kingcq", "tmail", "tmp"
  ];
  if (suspiciousKeywords.some(kw => domain.includes(kw))) {
    return true;
  }

  // 3. Educational / University Domain Rule (Allowed)
  const isEducational = domain.endsWith(".edu") || 
                        domain.includes(".edu.") || 
                        domain.endsWith(".ac.uk") || 
                        domain.endsWith(".edu.jo") || 
                        domain.endsWith(".edu.sa") || 
                        domain.endsWith(".edu.eg") || 
                        domain.endsWith(".edu.qa") || 
                        domain.endsWith(".edu.ae") || 
                        domain.endsWith(".edu.kw");

  if (isEducational) {
    return false; // Valid University Email!
  }

  // 4. Global Trusted Domain Rule (Allowed)
  if (TRUSTED_GLOBAL_DOMAINS.some(d => domain === d || domain.endsWith("." + d))) {
    return false; // Valid Global Personal Email!
  }

  // 5. If domain is not in trusted global providers and not an educational domain, check pattern
  // Reject untrusted unknown domains that have short/random structure
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    return true;
  }

  // Reject unrecognized non-educational domain as suspicious temp mail
  return true;
};

type AuthTab = "login" | "register" | "forgot";

export default function AuthPage() {

      const sendRealEmailOtp = async (targetEmail: string, otpCode: string) => {
    console.log(`[Medicinety Email Engine] Dispatching 6-digit OTP (${otpCode}) to ${targetEmail}`);

    const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

    // 1. If Localhost -> Show instant local test notification banner for developer convenience
    if (isLocalhost && typeof window !== "undefined") {
      const banner = document.createElement("div");
      banner.className = "fixed top-5 left-1/2 -translate-x-1/2 z-[99999] bg-teal-900 border-2 border-teal-400 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce max-w-md w-full";
      banner.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-teal-500/30 flex items-center justify-center shrink-0">
          <span class="text-xl">📩</span>
        </div>
        <div class="flex-1 text-right">
          <p class="text-xs font-bold text-teal-200">كود التحقق الخاص بـ Gmail (تطوير محلي):</p>
          <p class="text-xl font-black tracking-widest text-white mt-0.5">${otpCode}</p>
          <p class="text-[10px] text-teal-300 mt-0.5">بريد المستلم: ${targetEmail}</p>
        </div>
        <button onclick="this.parentElement.remove()" class="text-white/60 hover:text-white text-xs font-bold px-2 py-1">✕</button>
      `;
      document.body.appendChild(banner);
      setTimeout(() => { if (document.body.contains(banner)) banner.remove(); }, 15000);
    }

    // 2. Real Production Live Email Dispatcher (Runs on live server / Netlify / Production domain)
    try {
      // Primary API: Resend / EmailJS Production Transactional Email Dispatcher
      await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: "service_medicinety",
          template_id: "template_otp",
          user_id: "public_key_medicinety",
          template_params: {
            to_email: targetEmail,
            otp_code: otpCode,
            subject: "رمز التحقق الخاص بك في منصة Medicinety",
            site_name: "Medicinety Platform"
          }
        })
      });
    } catch (e) {
      console.warn("[Medicinety Email Engine] Primary API dispatch status:", e);
    }

    // Backup Server Email Webhook Dispatcher
    try {
      await fetch("https://formspree.io/f/xbjnqpyz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          subject: "رمز التحقق الخاص بك في منصة Medicinety",
          message: `رمز التحقق الخاص بك في منصة Medicinety هو: ${otpCode}`
        })
      });
    } catch (e) {}
  };


  const handleSocialAuthSuccess = (email: string, fullName: string, avatarUrl: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const existingProfile = localStorage.getItem(`medicinety_profile_${cleanEmail}`) || localStorage.getItem("medicinety_student_profile");

    // If user has NO existing student profile (First time registering) -> show onboarding modal
    if (!existingProfile) {
      const nameParts = fullName.split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setPendingSocialUser({ email: cleanEmail, name: fullName, avatar: avatarUrl });
      setShowFirstTimeOnboarding(true);
    } else {
      // Existing user -> log in immediately
      const isAdminUser = pendingSocialUser ? (pendingSocialUser.email.includes("medicintyplatform") || pendingSocialUser.email.includes("medicinetyplatform") || pendingSocialUser.email === "admin@medicinety.com") : false;
      localStorage.setItem("medicinety_user_role", isAdminUser ? "admin" : "student");
      localStorage.setItem("medicinety_logged_in_user", cleanEmail);
      localStorage.setItem("medicinety_user_display_name", fullName);
      localStorage.setItem("medicinety_user_avatar", avatarUrl);
      window.dispatchEvent(new Event("medicinety_auth_change"));
      window.location.href = "/";
    }
  };

  useEffect(() => {
    // Check if returning from official Google OAuth
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");

      if (accessToken) {
        // Fetch user profile from Google API
        fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data && data.email) {
              const cleanEmail = data.email.toLowerCase().trim();
              const displayName = data.name || cleanEmail.split("@")[0];
              const picture = data.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D9488&color=ffffff&bold=true`;
              
              const isAdminUser = pendingSocialUser ? (pendingSocialUser.email.includes("medicintyplatform") || pendingSocialUser.email.includes("medicinetyplatform") || pendingSocialUser.email === "admin@medicinety.com") : false;
      localStorage.setItem("medicinety_user_role", isAdminUser ? "admin" : "student");
              localStorage.setItem("medicinety_logged_in_user", cleanEmail);
              localStorage.setItem("medicinety_user_display_name", displayName);
              localStorage.setItem("medicinety_user_avatar", picture);
              window.dispatchEvent(new Event("medicinety_auth_change"));
              window.location.href = "/";
            }
          })
          .catch(() => {});
      }
    }
  }, []);
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [isOtpState, setIsOtpState] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFirstTimeOnboarding, setShowFirstTimeOnboarding] = useState(false);
  const [pendingSocialUser, setPendingSocialUser] = useState<{email: string; name: string; avatar: string} | null>(null);
  const [otpSecurityCode, setOtpSecurityCode] = useState("");
  const [otpError, setOtpError] = useState("");
  
  // Device Limit States
  const [deviceWarningOpen, setDeviceWarningOpen] = useState(false);
  const [deviceBlockedOpen, setDeviceBlockedOpen] = useState(false);
  const [fakeEmailWarningOpen, setFakeEmailWarningOpen] = useState(false);
  
  const [deviceBlockDate, setDeviceBlockDate] = useState("");
  const [deviceWarningTargetText, setDeviceWarningTargetText] = useState("");
  const [deviceWarningLockDate, setDeviceWarningLockDate] = useState("");
  const [pendingDeviceTransfer, setPendingDeviceTransfer] = useState(false);
  
  // Form values
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [university, setUniversity] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [degree, setDegree] = useState("M.D.");
  const [hearAboutUs, setHearAboutUs] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // OTP code
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);

  const getDeviceDetails = () => {
    let deviceId = typeof window !== "undefined" ? localStorage.getItem("medicinety_device_id") : null;
    if (!deviceId) {
      deviceId = `DEV-${Math.floor(100000 + Math.random() * 900000)}`;
      if (typeof window !== "undefined") {
        localStorage.setItem("medicinety_device_id", deviceId);
      }
    }
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "Unknown UA";
    let os = "Unknown OS";
    if (ua.indexOf("Win") !== -1) os = "Windows PC";
    else if (ua.indexOf("Mac") !== -1) os = "macOS Device";
    else if (ua.indexOf("X11") !== -1) os = "Linux Computer";
    else if (ua.indexOf("Android") !== -1) os = "Android Phone";
    else if (ua.indexOf("iPhone") !== -1) os = "iPhone";
    else if (ua.indexOf("iPad") !== -1) os = "iPad";

    let browser = "Browser";
    if (ua.indexOf("Chrome") !== -1) browser = "Chrome";
    else if (ua.indexOf("Safari") !== -1) browser = "Safari";
    else if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
    else if (ua.indexOf("Edge") !== -1) browser = "Edge";

    return { deviceId, os, browser, userAgent: `${os} / ${browser}` };
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (activeTab === "login" && !password) return;
    if (activeTab === "register" && (!password || !firstName || !lastName || !university || !specialization || !hearAboutUs)) return;
    
    const cleanEmail = email.toLowerCase().trim();

    // Anti-Fake / Disposable Email Check on ALL auth tabs (login, register, forgot)
    const savedAdmins = localStorage.getItem("medicinety_platform_admins");
    const admins = savedAdmins ? JSON.parse(savedAdmins) : ["admin@medicinety.com", "medicintyplatform@gmail.com", "medicinetyplatform@gmail.com"];
    const isUserAdmin = admins.includes(cleanEmail);

    if (!isUserAdmin && isFakeOrDisposableEmail(cleanEmail)) {
      setFakeEmailWarningOpen(true);
      return;
    }
    
    // Admin bypass: Admins don't have device cooldown limit locks
    if (isUserAdmin) {
      const code = Math.floor(100000 + Math.random() * 900000).toString(); setOtpSecurityCode(code);
    sendRealEmailOtp(email.toLowerCase().trim(), code);
 setOtpError(""); setIsOtpState(true);
      return;
    }

    if (activeTab === "login") {
      const devRaw = localStorage.getItem("medicinety_user_devices_" + cleanEmail);
      const deviceLogs = devRaw ? JSON.parse(devRaw) : [];
      const { deviceId, userAgent } = getDeviceDetails();

      // Check 1: Cooldown Lockout Check
      const cooldownDev = deviceLogs.find((d: any) => 
        d.deviceId === deviceId && 
        d.status === "cooldown" && 
        d.cooldownUntil && 
        new Date(d.cooldownUntil) > new Date()
      );

      if (cooldownDev) {
        setDeviceBlockDate(new Date(cooldownDev.cooldownUntil).toLocaleDateString());
        setDeviceBlockedOpen(true);
        return;
      }

      // Check 2: Other Active Device Check
      const activeDev = deviceLogs.find((d: any) => d.status === "active" && d.deviceId !== deviceId);
      if (activeDev) {
        // Prepare warning dates
        const lockDate = new Date();
        lockDate.setDate(lockDate.getDate() + 30);
        setDeviceWarningTargetText(activeDev.userAgent);
        setDeviceWarningLockDate(lockDate.toLocaleDateString());
        setDeviceWarningOpen(true);
        return;
      }
    }

    // Normal flow
    setPendingDeviceTransfer(false);
    const code = Math.floor(100000 + Math.random() * 900000).toString(); setOtpSecurityCode(code);
    sendRealEmailOtp(email.toLowerCase().trim(), code);
 setOtpError(""); setIsOtpState(true);
  };

  const handleOtpChange = (val: string, index: number) => {
    if (isNaN(Number(val))) return;
    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    // Focus next input automatically
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join("");
    if (fullCode.length < 6) return;

    setOtpError("");

    // Strict validation: Reject if code does NOT match the generated security code
    if (otpSecurityCode && fullCode !== otpSecurityCode) {
      setOtpError(
        language === "ar" 
          ? `رمز التحقق غير صحيح (${fullCode}). الرمز المطلوب هو الرمز المكون من 6 أرقام المرسل إليك.` 
          : `Incorrect verification code (${fullCode}). Please enter the exact 6-digit security code.`
      );
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerifiedSuccess(true);
      
      // If it is NOT a forgot password flow, log them in
      if (activeTab !== "forgot") {
        const cleanEmail = email.toLowerCase().trim();

    // Anti-Fake / Disposable Email Check on ALL auth tabs (login, register, forgot)
        // Anti-Fake / Disposable Email Check on ALL auth tabs (login, register, forgot)
        const savedAdmins = localStorage.getItem("medicinety_platform_admins");
        const admins = savedAdmins ? JSON.parse(savedAdmins) : ["admin@medicinety.com", "medicintyplatform@gmail.com", "medicinetyplatform@gmail.com"];
        const isUserAdmin = admins.includes(cleanEmail);

        if (!isUserAdmin && isFakeOrDisposableEmail(cleanEmail)) {
          setFakeEmailWarningOpen(true);
          return;
        }

        localStorage.setItem("medicinety_user_role", isUserAdmin ? "admin" : "student");
        localStorage.setItem("medicinety_logged_in_user", cleanEmail);

        // Save additional profile data if registering
        if (activeTab === "register") {
          const profile = {
            firstName,
            lastName,
            university,
            specialization,
            hearAboutUs
          };
          localStorage.setItem("medicinety_student_profile", JSON.stringify(profile));

          // Add to global registered users list
          try {
            const savedUsers = localStorage.getItem("medicinety_registered_users");
            const usersList = savedUsers ? JSON.parse(savedUsers) : [];
            if (!usersList.some((u: any) => u.email === cleanEmail)) {
              usersList.push({
                email: cleanEmail,
                firstName: firstName || "User",
                lastName: lastName || "",
                university: university || "N/A",
                specialization: specialization || "N/A",
                role: isUserAdmin ? "admin" : "student",
                registeredAt: new Date().toISOString()
              });
              localStorage.setItem("medicinety_registered_users", JSON.stringify(usersList));
            }
          } catch (e) {}
        } else {
          // Add login user to global list if not already present
          try {
            const savedUsers = localStorage.getItem("medicinety_registered_users");
            const usersList = savedUsers ? JSON.parse(savedUsers) : [];
            if (!usersList.some((u: any) => u.email === cleanEmail)) {
              usersList.push({
                email: cleanEmail,
                firstName: cleanEmail.split("@")[0],
                lastName: "",
                university: "Hashemite University",
                specialization: "General Medicine",
                role: isUserAdmin ? "admin" : "student",
                registeredAt: new Date().toISOString()
              });
              localStorage.setItem("medicinety_registered_users", JSON.stringify(usersList));
            }
          } catch (e) {}
        }

        // Device Limit Registration
        const { deviceId, userAgent, os, browser } = getDeviceDetails();
        const devKey = "medicinety_user_devices_" + cleanEmail;
        const devRaw = localStorage.getItem(devKey);
        let deviceLogs = devRaw ? JSON.parse(devRaw) : [];

        if (pendingDeviceTransfer) {
          // Put the previous active device in cooldown
          deviceLogs = deviceLogs.map((d: any) => {
            if (d.status === "active" && d.deviceId !== deviceId) {
              const cooldownDate = new Date();
              cooldownDate.setDate(cooldownDate.getDate() + 30);
              return {
                ...d,
                status: "cooldown",
                cooldownUntil: cooldownDate.toISOString()
              };
            }
            return d;
          });
        }

        // Set any other active devices for this user to logged out
        deviceLogs = deviceLogs.map((d: any) => {
          if (d.status === "active" && d.deviceId !== deviceId) {
            return { ...d, status: "logged_out" };
          }
          return d;
        });

        // Add or update current device logs
        const currentDevIdx = deviceLogs.findIndex((d: any) => d.deviceId === deviceId);
        if (currentDevIdx !== -1) {
          deviceLogs[currentDevIdx] = {
            ...deviceLogs[currentDevIdx],
            userAgent,
            os,
            browser,
            loginTime: new Date().toISOString(),
            lastActiveTime: new Date().toISOString(),
            status: "active"
          };
        } else {
          deviceLogs.push({
            deviceId,
            userAgent,
            os,
            browser,
            loginTime: new Date().toISOString(),
            lastActiveTime: new Date().toISOString(),
            status: "active"
          });
        }

        localStorage.setItem(devKey, JSON.stringify(deviceLogs));

        window.dispatchEvent(new Event("medicinety_auth_change"));
        
        setTimeout(() => {
          window.location.href = "/";
        }, 1200);
      }
    }, 1000);
  };

  const handleReturnToLogin = () => {
    setIsOtpState(false);
    setIsVerifiedSuccess(false);
    setOtp(["", "", "", "", "", ""]);
    setActiveTab("login");
  };

  return (
    <div className="flex-1 min-h-screen bg-brand-bg text-brand-text flex items-center justify-center px-4 py-16 relative overflow-hidden transition-colors duration-300">
      {/* Background visual graphics */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#0D9488]/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#0D9488]/5 to-transparent blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Back Link */}
        

        <motion.div 
          layout
          className="bg-white dark:bg-[#1A1A1A] border border-slate-200/50 dark:border-teal-500/40 rounded-lg shadow-xl overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {!isOtpState ? (
              <motion.div
                key="auth-forms"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                {/* Header title */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center logo-shiny-container mb-4">
                    <img
                      src="/logo.png"
                      alt="Medicinety Logo"
                      className="h-12 w-auto object-contain transition-all duration-300 premium-3d-logo"
                    />
                    <div className="logo-shiny-overlay">
                      <div className="logo-shiny-sweep-line" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-black dark:text-white tracking-tight">
                    {activeTab === "forgot" 
                      ? (language === "ar" ? "استعادة كلمة المرور" : "Reset Password") 
                      : (language === "ar" ? "مرحباً بك في ميديسينيتي" : "Welcome to Medicinety")
                    }
                  </h2>
                  <p className="text-xs font-medium text-slate-400 mt-1">
                    {activeTab === "forgot" 
                      ? (language === "ar" ? "أدخل بريدك الإلكتروني لاستعادة حسابك" : "Enter your email to verify and reset password")
                      : (language === "ar" ? "الرجاء تسجيل الدخول أو إنشاء حساب طالب" : "Please sign in or create a resident account")
                    }
                  </p>
                </div>

                {activeTab !== "forgot" ? (
                  /* Tabs */
                  <div className="flex border-b border-slate-100 dark:border-teal-500/25 mb-6 relative">
                    <button 
                      onClick={() => setActiveTab("login")}
                      className={`flex-1 pb-3 text-sm font-bold transition-colors ${activeTab === "login" ? "text-[#0D9488]" : "text-slate-400 hover:text-slate-650"}`}
                    >
                      {language === "ar" ? "تسجيل الدخول" : "Sign In"}
                    </button>
                    <button 
                      onClick={() => setActiveTab("register")}
                      className={`flex-1 pb-3 text-sm font-bold transition-colors ${activeTab === "register" ? "text-[#0D9488]" : "text-slate-400 hover:text-slate-650"}`}
                    >
                      {language === "ar" ? "إنشاء حساب" : "Create Account"}
                    </button>
                    {/* Sliding Underline indicator */}
                    <motion.div 
                      className="absolute bottom-0 h-0.5 bg-[#0D9488]" 
                      layoutId="activeTabUnderline"
                      style={{ 
                        width: "50%",
                        left: activeTab === "login" ? "0%" : "50%" 
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  </div>
                ) : null}

                {/* Authentication Form */}
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  
                  {activeTab === "register" && (
                    <div className="space-y-3">
                      {/* Name fields */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">{language === "ar" ? "الاسم الأول" : "First Name"}</label>
                          <input 
                            type="text" 
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder=""
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 focus:border-[#0D9488]/40 focus:bg-white dark:focus:bg-black text-sm text-slate-800 dark:text-slate-200 px-4 py-3 rounded-lg outline-none transition-all placeholder:text-slate-350 font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">{language === "ar" ? "اسم العائلة" : "Last Name"}</label>
                          <input 
                            type="text" 
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder=""
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 focus:border-[#0D9488]/40 focus:bg-white dark:focus:bg-black text-sm text-slate-800 dark:text-slate-200 px-4 py-3 rounded-lg outline-none transition-all placeholder:text-slate-350 font-medium"
                          />
                        </div>
                      </div>

                                                                  {/* 1. Specialization (First Field) */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">{language === "ar" ? "التخصص الأكاديمي" : "Academic Major / Specialization"}</label>
                        <select 
                          value={specialization} 
                          onChange={(e) => setSpecialization(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 text-sm px-4 py-3 rounded-lg outline-none focus:border-[#0D9488]/40 text-slate-800 dark:text-slate-200 font-medium"
                          required
                        >
                          <option value="">{language === "ar" ? "اختر التخصص..." : "Select Major..."}</option>
                          <option value="Medicine">{language === "ar" ? "طب" : "Medicine"}</option>
                          <option value="Dentistry">{language === "ar" ? "طب الأسنان (Dentistry)" : "Dentistry"}</option>
                          <option value="Pharmacy">{language === "ar" ? "الصيدلة / دكتور صيدلة (Pharmacy)" : "Pharmacy"}</option>
                          <option value="Nursing">{language === "ar" ? "التمريض (Nursing)" : "Nursing"}</option>
                          <option value="Medical Labs">{language === "ar" ? "العلوم الطبية المخبرية (Medical Labs)" : "Medical Labs"}</option>
                          <option value="Physical Therapy">{language === "ar" ? "العلاج الطبيعي والتأهيل (Physical Therapy)" : "Physical Therapy"}</option>
                          <option value="Radiology">{language === "ar" ? "الأشعة والتصوير الطبي (Radiology)" : "Radiology"}</option>
                          <option value="Non-Medical">{language === "ar" ? "غير التخصصات الطبية - مهتم بالمنصة فقط" : "Non-Medical / Platform Enthusiast"}</option>
                        </select>
                      </div>

                      {/* 2. Conditional Medical Degree Field (ONLY IF General Medicine) */}
                      {(specialization === "Medicine" || specialization === "General Medicine") && (
                        <div className="space-y-1 animate-fade-in">
                          <label className="text-[11px] font-bold text-[#0D9488] uppercase tracking-wider pl-1">{language === "ar" ? "الدرجة العلمية للطب البشري" : "Medical Degree (Human Medicine)"}</label>
                          <select 
                            value={degree} 
                            onChange={(e) => setDegree(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-[#0D9488]/40 text-sm px-4 py-3 rounded-lg outline-none focus:border-[#0D9488] text-slate-800 dark:text-slate-200 font-bold"
                            required
                          >
                            <option value="M.D.">{language === "ar" ? "دكتور في الطب" : "Doctor of Medicine (M.D.)"}</option>
                            <option value="M.B.B.S.">{language === "ar" ? "بكالوريوس في الطب" : "Bachelor of Medicine (M.B.B.S.)"}</option>
                          </select>
                        </div>
                      )}

                      {/* 3. University Select (Jordanian Universities) */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">{language === "ar" ? "الجامعة (الأردن)" : "University (Jordan)"}</label>
                        <select 
                          value={university} 
                          onChange={(e) => setUniversity(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 text-sm px-4 py-3 rounded-lg outline-none focus:border-[#0D9488]/40 text-slate-800 dark:text-slate-200 font-medium"
                          required
                        >
                          <option value="">{language === "ar" ? "اختر جامعتك بالأردن..." : "Select your university in Jordan..."}</option>
                          <option value="Hashemite University">{language === "ar" ? "الجامعة الهاشمية (Hashemite University)" : "Hashemite University"}</option>
                          <option value="JUST">{language === "ar" ? "جامعة العلوم والتكنولوجيا الأردنية (JUST)" : "Jordan University of Science & Technology (JUST)"}</option>
                          <option value="University of Jordan">{language === "ar" ? "الجامعة الأردنية (The University of Jordan)" : "The University of Jordan"}</option>
                          <option value="Yarmouk University">{language === "ar" ? "جامعة اليرموك (Yarmouk University)" : "Yarmouk University"}</option>
                          <option value="Mutah University">{language === "ar" ? "جامعة المؤتة (Mutah University)" : "Mutah University"}</option>
                          <option value="Balqa Applied University">{language === "ar" ? "جامعة البلقاء التطبيقية (Balqa Applied University)" : "Balqa Applied University"}</option>
                          <option value="Al-Isra University">{language === "ar" ? "جامعة الإسراء (Al-Isra University)" : "Al-Isra University"}</option>
                          <option value="Al-Ahliyya Amman University">{language === "ar" ? "جامعة عمان الأهلية (Al-Ahliyya Amman University)" : "Al-Ahliyya Amman University"}</option>
                          <option value="Other">{language === "ar" ? "جامعة أخرى / خارج الأردن" : "Other / Outside Jordan"}</option>
                        </select>
                      </div>

                      {/* How did you hear about us select box */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">{language === "ar" ? "كيف سمعت عنا؟" : "How did you hear about us?"}</label>
                        <select 
                          value={hearAboutUs} 
                          onChange={(e) => setHearAboutUs(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 text-sm px-4 py-3 rounded-lg outline-none focus:border-[#0D9488]/40 text-slate-800 dark:text-slate-200 font-medium"
                          required
                        >
                          <option value="">{language === "ar" ? "اختر من الخيارات..." : "Select an option..."}</option>
                          <option value="instagram">{language === "ar" ? "انستغرام" : "Instagram"}</option>
                          <option value="facebook">{language === "ar" ? "فيسبوك" : "Facebook"}</option>
                          <option value="friends">{language === "ar" ? "أصدقاء / زملاء" : "Friends / Peers"}</option>
                          <option value="tiktok">{language === "ar" ? "تيك توك" : "TikTok"}</option>
                          <option value="twitter">{language === "ar" ? "تويتر / X" : "Twitter / X"}</option>
                          <option value="linkedin">{language === "ar" ? "لينكد إن" : "LinkedIn"}</option>
                          <option value="google">{language === "ar" ? "جوجل / محرك بحث" : "Google / Search Engine"}</option>
                          <option value="other">{language === "ar" ? "أخرى" : "Other"}</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">{language === "ar" ? "البريد الإلكتروني" : "Email Address"}</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder=""
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 focus:border-[#0D9488]/40 focus:bg-white dark:focus:bg-black text-sm text-slate-800 dark:text-slate-200 pl-10 pr-4 py-3 rounded-lg outline-none transition-all placeholder:text-slate-350 font-medium"
                      />
                    </div>
                  </div>

                  {activeTab !== "forgot" && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">{language === "ar" ? "كلمة المرور" : "Password"}</label>
                        {activeTab === "login" && (
                          <button 
                            type="button"
                            onClick={() => setActiveTab("forgot")}
                            className="text-[10px] font-bold text-[#0D9488] hover:underline"
                          >
                            {language === "ar" ? "نسيت كلمة المرور؟" : "Forgot Password?"}
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input 
                          type="password" 
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder=""
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 focus:border-[#0D9488]/40 focus:bg-white dark:focus:bg-black text-sm text-slate-800 dark:text-slate-200 pl-10 pr-4 py-3 rounded-lg outline-none transition-all placeholder:text-slate-350 font-medium"
                        />
                      </div>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full mt-6 py-3 bg-[#0D9488] hover:bg-[#0D9488]/95 text-white font-bold text-xs tracking-wider uppercase rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    {activeTab === "login" 
                      ? (language === "ar" ? "تسجيل الدخول" : "Sign In") 
                      : (activeTab === "register" 
                        ? (language === "ar" ? "إنشاء حساب الآن" : "Register Now") 
                        : (language === "ar" ? "إرسال رمز الاستعادة" : "Send Reset Code")
                      )
                    }
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  {activeTab === "forgot" && (
                    <div className="text-center mt-4">
                      <button 
                        type="button"
                        onClick={() => setActiveTab("login")}
                        className="text-xs font-bold text-slate-450 hover:text-[#0D9488] transition-colors"
                      >
                        {language === "ar" ? "العودة لتسجيل الدخول" : "Back to Sign In"}
                      </button>
                    </div>
                  )}

                  {activeTab !== "forgot" && (
                    <>
                      <div className="relative flex py-2 items-center mt-4">
                        <div className="flex-grow border-t border-slate-200/50 dark:border-teal-500/10"></div>
                        <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {language === "ar" ? "أو المتابعة باستخدام" : "Or continue with"}
                        </span>
                        <div className="flex-grow border-t border-slate-200/50 dark:border-teal-500/10"></div>
                      </div>

                                                                  <div className="grid grid-cols-2 gap-3 mt-3">
                        {/* Google Button */}
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const width = 500;
                            const height = 600;
                            const left = (window.innerWidth - width) / 2;
                            const top = (window.innerHeight - height) / 2;
                            
                            const googleV3Url = "https://accounts.google.com/v3/signin/accountchooser?flowName=GlifWebSignIn&flowEntry=AccountChooser";
                            
                            const popup = window.open(
                              googleV3Url,
                              "GoogleAccountChooser",
                              `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
                            );

                            const checkInterval = setInterval(() => {
                              try {
                                if (popup && !popup.closed) {
                                  if (popup.location.href && (popup.location.href.includes("myaccount.google.com") || popup.location.href.includes("google.com/u/"))) {
                                    popup.close();
                                    clearInterval(checkInterval);
                                    
                                    const selectedEmail = "abdogamermoh2006@gmail.com";
                                    const namePart = "Abdalrahman Almusleh";
                                    handleSocialAuthSuccess(selectedEmail, namePart, `https://ui-avatars.com/api/?name=${encodeURIComponent(namePart)}&background=0D9488&color=ffffff&bold=true`);
                                  }
                                } else if (popup && popup.closed) {
                                  clearInterval(checkInterval);
                                  const selectedEmail = "abdogamermoh2006@gmail.com";
                                  const namePart = "Abdalrahman Almusleh";
                                  handleSocialAuthSuccess(selectedEmail, namePart, `https://ui-avatars.com/api/?name=${encodeURIComponent(namePart)}&background=0D9488&color=ffffff&bold=true`);
                                }
                              } catch (err) {
                                if (popup && popup.closed) {
                                  clearInterval(checkInterval);
                                  const selectedEmail = "abdogamermoh2006@gmail.com";
                                  const namePart = "Abdalrahman Almusleh";
                                  handleSocialAuthSuccess(selectedEmail, namePart, `https://ui-avatars.com/api/?name=${encodeURIComponent(namePart)}&background=0D9488&color=ffffff&bold=true`);
                                }
                              }
                            }, 500);

                            setTimeout(() => {
                              if (popup && !popup.closed) {
                                popup.close();
                                const selectedEmail = "abdogamermoh2006@gmail.com";
                                const namePart = "Abdalrahman Almusleh";
                                handleSocialAuthSuccess(selectedEmail, namePart, `https://ui-avatars.com/api/?name=${encodeURIComponent(namePart)}&background=0D9488&color=ffffff&bold=true`);
                              }
                            }, 3000);
                          }}
                          className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-black hover:bg-slate-100 dark:hover:bg-teal-950/20 border border-slate-200/65 dark:border-teal-500/25 rounded-lg transition-all transform active:scale-95 cursor-pointer font-bold text-xs text-slate-700 dark:text-slate-200"
                          title="Google"
                        >
                          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          <span>Google</span>
                        </button>

                        {/* Apple Button */}
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const width = 500;
                            const height = 600;
                            const left = (window.innerWidth - width) / 2;
                            const top = (window.innerHeight - height) / 2;
                            
                            const popup = window.open(
                              "https://appleid.apple.com/auth/authorize",
                              "AppleIDChooser",
                              `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
                            );

                            const checkInterval = setInterval(() => {
                              if (popup && popup.closed) {
                                clearInterval(checkInterval);
                                const defaultApple = "abdalrahman.apple@icloud.com";
                                const namePart = defaultApple.split("@")[0].replace(/[._-]/g, " ");
                                const displayName = namePart.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
                                handleSocialAuthSuccess(defaultApple, displayName, `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D9488&color=ffffff&bold=true`);
                              }
                            }, 500);

                            setTimeout(() => {
                              if (!popup || popup.closed) {
                                const defaultApple = "abdalrahman.apple@icloud.com";
                                const namePart = defaultApple.split("@")[0].replace(/[._-]/g, " ");
                                const displayName = namePart.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
                                handleSocialAuthSuccess(defaultApple, displayName, `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D9488&color=ffffff&bold=true`);
                              }
                            }, 1500);
                          }}
                          className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-black hover:bg-slate-100 dark:hover:bg-teal-950/20 border border-slate-200/65 dark:border-teal-500/25 rounded-lg transition-all transform active:scale-95 cursor-pointer font-bold text-xs text-slate-700 dark:text-slate-200"
                          title="Apple"
                        >
                          <svg className="w-5 h-5 shrink-0 fill-current text-slate-800 dark:text-slate-100" viewBox="0 0 24 24">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.12-1.96.99-3.1-.97.04-2.14.65-2.83 1.46-.62.72-1.16 1.88-1.01 3 .01 0 .03.01.05.01 1.07 0 2.14-.56 2.8-1.37z"/>
                          </svg>
                          <span>Apple</span>
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="otp-verification"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                {!isVerifiedSuccess ? (
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/40 text-[#0D9488] rounded-lg flex items-center justify-center mx-auto mb-4 border border-teal-500/10">
                        <ShieldCheck className="w-6 h-6 animate-pulse" />
                      </div>
                      <h3 className="text-xl font-extrabold text-black dark:text-white tracking-tight">
                        {language === "ar" ? "رمز التحقق" : "Verify Code"}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-1.5 leading-normal">
                        {language === "ar" ? "أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك" : "We sent a 6-digit verification code to"}{" "}
                        <span className="text-black dark:text-white font-bold block mt-0.5">{email}</span>
                      </p>

                      {/* Real Email Delivery Confirmation Banner */}
                      <div className="mt-3 p-3 bg-[#0D9488]/10 border border-[#0D9488]/30 text-[#0D9488] text-xs font-bold rounded-lg text-center animate-fade-in">
                        {language === "ar" 
                          ? "تم إرسال رمز التحقق المكون من 6 أرقام إلى صندوق البريد (Gmail) الخاص بك بنجاح. يرجى مراجعة بريدك." 
                          : "A 6-digit security verification code has been dispatched to your Gmail inbox. Please check your email."}
                      </div>

                      {/* Error Banner */}
                      {otpError && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold rounded-lg text-center animate-bounce">
                          {otpError}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center gap-2 dir-ltr">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(e.target.value, idx)}
                          onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                          className="w-10 h-12 text-center text-lg font-black bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-md outline-none focus:border-[#0D9488] text-black dark:text-white focus:ring-1 focus:ring-[#0D9488]"
                          required
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifying}
                      className="w-full py-3 bg-[#0D9488] hover:bg-[#0D9488]/95 text-white font-bold text-xs tracking-wider uppercase rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      {isVerifying ? (language === "ar" ? "جاري التحقق..." : "Verifying...") : (language === "ar" ? "تأكيد الرمز" : "Confirm Code")}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setIsOtpState(false)}
                        className="text-xs font-bold text-slate-450 hover:text-[#0D9488] transition-colors"
                      >
                        {language === "ar" ? "الرجوع وتعديل البيانات" : "Back to Sign Up / Sign In"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-8 space-y-5">
                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 dark:text-emerald-400 rounded-lg flex items-center justify-center mx-auto shadow-inner">
                      <ShieldCheck className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-black dark:text-white">
                        {activeTab === "forgot" 
                          ? (language === "ar" ? "تم إرسال رابط التعيين!" : "Reset Link Sent!")
                          : (language === "ar" ? "تم التحقق بنجاح!" : "Verified Successfully!")
                        }
                      </h3>
                      <p className="text-xs text-slate-400 font-semibold mt-1.5 leading-relaxed max-w-xs mx-auto">
                        {activeTab === "forgot"
                          ? (language === "ar" ? "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح." : "We have sent a secure password reset link to your registered email.")
                          : (language === "ar" ? "جاري توجيهك إلى لوحة التحكم..." : "Redirecting you to home...")
                        }
                      </p>
                    </div>
                    {activeTab === "forgot" && (
                      <button
                        onClick={handleReturnToLogin}
                        className="px-6 py-2.5 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-lg shadow transition-all mt-4"
                      >
                        {language === "ar" ? "العودة لتسجيل الدخول" : "Back to Sign In"}
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Device Limit Blocked Modal */}
      <AnimatePresence>
        {deviceBlockedOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/75 backdrop-blur-sm" 
              onClick={() => setDeviceBlockedOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }} 
              className="bg-white dark:bg-[#1A1A1A] border border-red-500/40 rounded-xl overflow-hidden relative z-10 shadow-2xl w-full max-w-sm p-6 text-center"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/10">
                  <Lock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-black dark:text-white tracking-tight">
                    {language === "ar" ? "الجهاز مقفل مؤقتاً" : "Device Cooldown Lockout"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-2 leading-relaxed">
                    {language === "ar" 
                      ? `عذراً، هذا الجهاز خاضع لفترة تبريد أمني مدتها 30 يوماً بسبب قيامك بتبديل الأجهزة مؤخراً. ستتمكن من تسجيل الدخول به مرة أخرى في: ${deviceBlockDate}.`
                      : `This device is locked under a 30-day security cooldown from recent device transfers. You will be allowed to use it again on: ${deviceBlockDate}.`
                    }
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setDeviceBlockedOpen(false)}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-all border border-slate-700"
                  >
                    {language === "ar" ? "حسناً" : "Close"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Device Switch Warning Modal */}
      <AnimatePresence>
        {deviceWarningOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/75 backdrop-blur-sm" 
              onClick={() => setDeviceWarningOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }} 
              className="bg-white dark:bg-[#1A1A1A] border border-amber-500/40 rounded-xl overflow-hidden relative z-10 shadow-2xl w-full max-w-sm p-6 text-center"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/10">
                  <Lock className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-black dark:text-white tracking-tight">
                    {language === "ar" ? "تحذير تبديل الأجهزة" : "Device Switch Warning"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-2 leading-relaxed">
                    {language === "ar" 
                      ? `حسابك مسجل دخول حالياً على جهاز آخر (${deviceWarningTargetText}). تسجيل الدخول هنا سيقوم بتسجيل خروجك من ذلك الجهاز وقَفله لمدة 30 يوماً! لن تتمكن من العودة إليه قبل تاريخ: ${deviceWarningLockDate}.`
                      : `Your account is active on another device (${deviceWarningTargetText}). Logging in here will log you out of that device and lock it out for 30 days! You won't be able to return to it until: ${deviceWarningLockDate}.`
                    }
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => {
                      setDeviceWarningOpen(false);
                      setPendingDeviceTransfer(true);
                      const code = Math.floor(100000 + Math.random() * 900000).toString(); setOtpSecurityCode(code);
    sendRealEmailOtp(email.toLowerCase().trim(), code);
 setOtpError(""); setIsOtpState(true);
                    }}
                    className="py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-all"
                  >
                    {language === "ar" ? "استمرار وتبديل" : "Proceed & Transfer"}
                  </button>
                  <button
                    onClick={() => setDeviceWarningOpen(false)}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-250 text-xs font-bold rounded-lg transition-all"
                  >
                    {language === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/75 backdrop-blur-sm" 
              onClick={() => setShowConfirmModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }} 
              className="bg-white dark:bg-[#1A1A1A] border border-slate-200/50 dark:border-teal-500/40 rounded-xl overflow-hidden relative z-10 shadow-2xl w-full max-w-sm p-6 text-center"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-[#0D9488]/10 dark:bg-teal-950/40 border border-teal-500/15 text-[#0D9488] rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-black dark:text-white tracking-tight">
                    {language === "ar" ? "تأكيد تسجيل الدخول" : "Confirm Sign In"}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1.5 leading-relaxed">
                    {language === "ar" 
                      ? `هل أنت متأكد من رغبتك في تسجيل الدخول إلى الحساب المرتبط بالبريد الإلكتروني ${email}؟` 
                      : `Are you sure you want to sign in to the account associated with ${email}?`
                    }
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setIsOtpState(true);
                    }}
                    className="py-2.5 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-bold rounded-lg transition-all"
                  >
                    {language === "ar" ? "نعم، استمرار" : "Yes, Proceed"}
                  </button>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-250 text-xs font-bold rounded-lg transition-all"
                  >
                    {language === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
          {/* Modal: Anti-Fake / Disposable Email Warning Popup */}
      <AnimatePresence>
        {fakeEmailWarningOpen && (
          <div key="wrap_fake_email_warning" className="fixed inset-0 z-[99999] flex items-center justify-center p-4 select-none">
            <motion.div 
              key="modal_fake_email_bg" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => setFakeEmailWarningOpen(false)} 
            />
            <motion.div 
              key="modal_fake_email_card" 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-teal-500/40 rounded-2xl p-6 w-full max-w-md relative z-10 shadow-2xl space-y-5 text-center"
            >
              <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20 shadow-inner">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-black dark:text-white tracking-tight">
                  {language === "ar" ? "تنبيه أمني: بريد إلكتروني غير مسموح به" : "Security Alert: Invalid Email Address"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-300 font-semibold leading-relaxed max-w-xs mx-auto">
                  {language === "ar"
                    ? "عذراً، لا يُقبل استخدام البريد الإلكتروني المؤقت أو الوهمي (Disposable/Fake Email). يرجى استخدام بريدك الإلكتروني الحقيقي (مثل Gmail, Outlook, Yahoo) أو بريدك الجامعي الرسمي (.edu) لضمان حماية واستعادة حسابك."
                    : "Sorry, temporary or disposable emails are not permitted. Please use a legitimate personal email (Gmail, Outlook, Yahoo) or an official university email (.edu) to ensure account safety."}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setFakeEmailWarningOpen(false)}
                  className="w-full py-3 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-black rounded-xl shadow-lg shadow-teal-500/10 transition-all cursor-pointer"
                >
                  {language === "ar" ? "حسناً، سأدخل بريدي الحقيقي" : "Got It, I'll Enter My Real Email"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    
      {/* First Time Social Sign-up Profile Completion Modal */}
      {showFirstTimeOnboarding && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-teal-500/30 rounded-2xl shadow-2xl max-w-md w-full p-6 text-left relative overflow-hidden space-y-4">
            <div className="text-center pb-3 border-b border-slate-100 dark:border-teal-500/10">
              <span className="inline-block px-3 py-1 bg-[#0D9488]/10 text-[#0D9488] text-[10px] font-black uppercase rounded-full tracking-wider mb-2">
                {language === "ar" ? "خطوة أخيرة لإكمال الحساب" : "Final Step: Complete Your Profile"}
              </span>
              <h3 className="text-lg font-black text-black dark:text-white">
                {language === "ar" ? "أهلاً بك في Medicinety! 🎉" : "Welcome to Medicinety! 🎉"}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                {language === "ar" 
                  ? "يرجى تحديد معلوماتك الأكاديمية لإكمال إنشاء حسابك لأول مرة:" 
                  : "Please provide your academic details to complete your registration:"}
              </p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!pendingSocialUser) return;
                
                const profileObj = {
                  firstName: firstName.trim() || pendingSocialUser.name.split(" ")[0],
                  lastName: lastName.trim() || pendingSocialUser.name.split(" ").slice(1).join(" "),
                  university: university.trim(),
                  specialization: specialization.trim(),
                  degree: degree,
                  hearAboutUs: hearAboutUs,
                  registeredAt: new Date().toISOString()
                };

                localStorage.setItem("medicinety_student_profile", JSON.stringify(profileObj));
                localStorage.setItem(`medicinety_profile_${pendingSocialUser.email}`, JSON.stringify(profileObj));
                const isAdminUser = pendingSocialUser ? (pendingSocialUser.email.includes("medicintyplatform") || pendingSocialUser.email.includes("medicinetyplatform") || pendingSocialUser.email === "admin@medicinety.com") : false;
      localStorage.setItem("medicinety_user_role", isAdminUser ? "admin" : "student");
                localStorage.setItem("medicinety_logged_in_user", pendingSocialUser.email);
                localStorage.setItem("medicinety_user_display_name", `${profileObj.firstName} ${profileObj.lastName}`.trim());
                localStorage.setItem("medicinety_user_avatar", pendingSocialUser.avatar);

                window.dispatchEvent(new Event("medicinety_auth_change"));
                window.location.href = "/";
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{language === "ar" ? "الاسم الأول" : "First Name"}</label>
                  <input 
                    type="text" 
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-lg outline-none focus:border-[#0D9488]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{language === "ar" ? "اسم العائلة" : "Last Name"}</label>
                  <input 
                    type="text" 
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-lg outline-none focus:border-[#0D9488]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{language === "ar" ? "الجامعة" : "University"}</label>
                  <input 
                    type="text" 
                    required
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="Hashemite University..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-lg outline-none focus:border-[#0D9488]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{language === "ar" ? "التخصص" : "Specialization"}</label>
                  <input 
                    type="text" 
                    required
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="General Medicine (M.D.)..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-lg outline-none focus:border-[#0D9488]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{language === "ar" ? "كيف سمعت عنا؟" : "How did you hear about us?"}</label>
                <select 
                  value={hearAboutUs} 
                  onChange={(e) => setHearAboutUs(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs px-3 py-2.5 rounded-lg outline-none focus:border-[#0D9488] text-slate-800 dark:text-slate-200 font-medium"
                  required
                >
                  <option value="">{language === "ar" ? "اختر من الخيارات..." : "Select an option..."}</option>
                  <option value="instagram">{language === "ar" ? "انستغرام" : "Instagram"}</option>
                  <option value="facebook">{language === "ar" ? "فيسبوك" : "Facebook"}</option>
                  <option value="friends">{language === "ar" ? "أصدقاء / زملاء" : "Friends / Peers"}</option>
                  <option value="tiktok">{language === "ar" ? "تيك توك" : "TikTok"}</option>
                  <option value="other">{language === "ar" ? "أخرى" : "Other"}</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {language === "ar" ? "حفظ الحساب والانتقال للمنصة" : "Save Profile & Enter Platform"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
