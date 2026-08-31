"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Clock, HelpCircle, Send, ChevronLeft, CheckCircle2, Phone, MessageSquare } from "lucide-react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useLanguage } from "@/components/LanguageContext";
import AutoResizeTextarea from "@/components/AutoResizeTextarea";

export default function ContactPage() {
  const { language } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState("");
  
  const [isSending, setIsSending] = useState(false);
  const [isSentSuccess, setIsSentSuccess] = useState(false);

  // General Titles
  const [contactTitle, setContactTitle] = useState("");
  const [contactDesc, setContactDesc] = useState("");
  const [getInfoTitle, setGetInfoTitle] = useState("");
  const [getInfoDesc, setGetInfoDesc] = useState("");
  const [hoursLabel, setHoursLabel] = useState("");

  // Editable Contact Info Details (Admin Controlled)
  const [supportEmail, setSupportEmail] = useState("support@medicinety.com");
  const [feedbackEmail, setFeedbackEmail] = useState("feedback@medicinety.com");
  const [phoneWhatsapp, setPhoneWhatsapp] = useState("+962 7 9000 0000");
  const [hoursText, setHoursText] = useState("Mon - Fri, 9:00 AM - 5:00 PM EST");
  const [hoursSubtext, setHoursSubtext] = useState("Usually replies within 24 hours");

  const [isAdmin, setIsAdmin] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const role = localStorage.getItem("medicinety_user_role");
    setIsAdmin(role === "admin");

    const emailKey = localStorage.getItem("medicinety_logged_in_user") || "";
    setLoggedInEmail(emailKey);

    const defaultValues = {
      contactTitle: language === "ar" ? "اتصل بنا" : "Contact Us",
      contactDesc: language === "ar" ? "نحن هنا لدعم رحلتك الطبية وتوفير العون" : "We are here to support your medical journey",
      getInfoTitle: language === "ar" ? "تواصل معنا" : "Get in Touch",
      getInfoDesc: language === "ar"
        ? "هل لديك أسئلة حول لوحة التحكم السريرية أو منهج الدورة التدريبية أو الفواتير؟ فريق الدعم المخصص لدينا متاح لمساعدتك."
        : "Have questions about your clinical home, course syllabus, or billing? Our dedicated support team is available to assist you.",
      hoursLabel: language === "ar" ? "ساعات العمل والاستجابة" : "Response Hours",
      hoursText: language === "ar" ? "الاثنين - الجمعة، 9:00 ص - 5:00 م" : "Mon - Fri, 9:00 AM - 5:00 PM EST",
      hoursSubtext: language === "ar" ? "يرد عادةً خلال 24 ساعة" : "Usually replies within 24 hours"
    };

    const saved = localStorage.getItem("medicinety_contact_state");
    const data = saved ? JSON.parse(saved) : {};
    
    setContactTitle(data[`contactTitle_${language}`] || defaultValues.contactTitle);
    setContactDesc(data[`contactDesc_${language}`] || defaultValues.contactDesc);
    setGetInfoTitle(data[`getInfoTitle_${language}`] || defaultValues.getInfoTitle);
    setGetInfoDesc(data[`getInfoDesc_${language}`] || defaultValues.getInfoDesc);
    setHoursLabel(data[`hoursLabel_${language}`] || defaultValues.hoursLabel);

    // Load Editable Contact Info
    if (data.supportEmail) setSupportEmail(data.supportEmail);
    if (data.feedbackEmail) setFeedbackEmail(data.feedbackEmail);
    if (data.phoneWhatsapp) setPhoneWhatsapp(data.phoneWhatsapp);
    if (data[`hoursText_${language}`]) setHoursText(data[`hoursText_${language}`]);
    else setHoursText(defaultValues.hoursText);

    if (data[`hoursSubtext_${language}`]) setHoursSubtext(data[`hoursSubtext_${language}`]);
    else setHoursSubtext(defaultValues.hoursSubtext);

  }, [language]);

  const handleContactFieldChange = (key: string, value: string, isLanguageSpecific: boolean = true) => {
    try {
      const saved = localStorage.getItem("medicinety_contact_state");
      const data = saved ? JSON.parse(saved) : {};
      if (isLanguageSpecific) {
        data[`${key}_${language}`] = value;
      } else {
        data[key] = value;
      }
      localStorage.setItem("medicinety_contact_state", JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save contact field", e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !subject || !message) return;

    setIsSending(true);
    
    const senderAccount = loggedInEmail || "Anonymous / Not Logged In";

    const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Sender Name: ${fullName}\nSender Account Email: ${senderAccount}\n\n${message}`)}`;
    
    setTimeout(() => {
      setIsSending(false);
      setIsSentSuccess(true);
      
      window.location.href = mailtoUrl;

      setFullName("");
      setSubject("");
      setMessage("");
    }, 1000);
  };

  return (
    <div className="flex-1 min-h-screen bg-brand-bg text-brand-text pb-16 transition-colors duration-300">
      <div className="w-full px-4 pt-8 xl:max-w-[1440px] mx-auto">
        
        {/* Back Link */}
        

        {/* Dynamic Breadcrumbs */}
        <Breadcrumbs />

        {/* Dynamic Header Section */}
        <section className="space-y-3 mb-8 group select-none">
          {isAdmin ? (
            <AutoResizeTextarea
              value={contactTitle}
              onChange={(val) => {
                setContactTitle(val);
                handleContactFieldChange("contactTitle", val);
              }}
              className="text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight leading-none bg-transparent border-none outline-none focus:ring-0 w-full pl-0 select-text cursor-text"
              placeholder=""
            />
          ) : (
            <h1 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight leading-none">
              {contactTitle}
            </h1>
          )}
          {isAdmin ? (
            <AutoResizeTextarea
              value={contactDesc}
              onChange={(val) => {
                setContactDesc(val);
                handleContactFieldChange("contactDesc", val);
              }}
              className="text-sm md:text-base text-black dark:text-white font-normal leading-relaxed bg-transparent border-none outline-none focus:ring-0 w-full pl-0"
              placeholder=""
            />
          ) : (
            <p className="text-sm md:text-base text-black dark:text-white font-normal leading-relaxed">
              {contactDesc}
            </p>
          )}
        </section>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          
          {/* Column 1: Support Info (2/5 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#1A1A1A] border border-slate-200/40 dark:border-teal-500/40 rounded-lg p-8 shadow-sm space-y-8 relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-gradient-to-br from-[#0D9488]/5 to-transparent blur-xl pointer-events-none" />
              
              <div className="space-y-3 relative z-10">
                {isAdmin ? (
                  <input
                    type="text"
                    value={getInfoTitle}
                    onChange={(e) => {
                      setGetInfoTitle(e.target.value);
                      handleContactFieldChange("getInfoTitle", e.target.value);
                    }}
                    className="text-lg font-bold text-black dark:text-white bg-transparent border-none outline-none focus:ring-0 w-full pl-0 select-text cursor-text"
                  />
                ) : (
                  <h3 className="text-lg font-bold text-black dark:text-white">
                    {getInfoTitle}
                  </h3>
                )}
                {isAdmin ? (
                  <AutoResizeTextarea
                    value={getInfoDesc}
                    onChange={(val) => {
                      setGetInfoDesc(val);
                      handleContactFieldChange("getInfoDesc", val);
                    }}
                    className="text-sm text-black dark:text-white leading-relaxed font-medium bg-transparent border-none outline-none focus:ring-0 w-full pl-0"
                  />
                ) : (
                  <p className="text-sm text-black dark:text-white leading-relaxed font-medium">
                    {getInfoDesc}
                  </p>
                )}
              </div>

              <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-teal-500/20">
                {/* Tech Support Email */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-[#0D9488]/10 text-[#0D9488] rounded-md shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      {language === "ar" ? "الدعم الفني للمشاكل التقنية" : "Technical Support"}
                    </h5>
                    {isAdmin ? (
                      <input
                        type="email"
                        value={supportEmail}
                        onChange={(e) => {
                          setSupportEmail(e.target.value);
                          handleContactFieldChange("supportEmail", e.target.value, false);
                        }}
                        className="text-sm font-extrabold text-[#0D9488] bg-teal-50 dark:bg-teal-950/30 border border-teal-500/30 rounded px-2 py-0.5 mt-0.5 outline-none w-full select-text cursor-text"
                      />
                    ) : (
                      <p className="text-sm font-extrabold text-[#0D9488] hover:underline mt-0.5">
                        <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Feedback & Suggestions Email */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-[#0D9488]/10 text-[#0D9488] rounded-md shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      {language === "ar" ? "الاقتراحات والملاحظات" : "Feedback & Suggestions"}
                    </h5>
                    {isAdmin ? (
                      <input
                        type="email"
                        value={feedbackEmail}
                        onChange={(e) => {
                          setFeedbackEmail(e.target.value);
                          handleContactFieldChange("feedbackEmail", e.target.value, false);
                        }}
                        className="text-sm font-extrabold text-[#0D9488] bg-teal-50 dark:bg-teal-950/30 border border-teal-500/30 rounded px-2 py-0.5 mt-0.5 outline-none w-full select-text cursor-text"
                      />
                    ) : (
                      <p className="text-sm font-extrabold text-[#0D9488] hover:underline mt-0.5">
                        <a href={`mailto:${feedbackEmail}`}>{feedbackEmail}</a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone / WhatsApp Support */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-[#0D9488]/10 text-[#0D9488] rounded-md shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      {language === "ar" ? "رقم الدعم الفني والواتساب" : "Phone & WhatsApp Support"}
                    </h5>
                    {isAdmin ? (
                      <input
                        type="text"
                        value={phoneWhatsapp}
                        onChange={(e) => {
                          setPhoneWhatsapp(e.target.value);
                          handleContactFieldChange("phoneWhatsapp", e.target.value, false);
                        }}
                        className="text-sm font-extrabold text-[#0D9488] bg-teal-50 dark:bg-teal-950/30 border border-teal-500/30 rounded px-2 py-0.5 mt-0.5 outline-none w-full select-text cursor-text"
                      />
                    ) : (
                      <p className="text-sm font-extrabold text-[#0D9488] hover:underline mt-0.5">
                        <a href={`https://wa.me/${phoneWhatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                          {phoneWhatsapp}
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Hours Info */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-[#0D9488]/10 text-[#0D9488] rounded-md shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    {isAdmin ? (
                      <input
                        type="text"
                        value={hoursLabel}
                        onChange={(e) => {
                          setHoursLabel(e.target.value);
                          handleContactFieldChange("hoursLabel", e.target.value);
                        }}
                        className="text-xs font-bold text-slate-400 uppercase tracking-wide bg-transparent border-none outline-none focus:ring-0 w-full pl-0 select-text cursor-text"
                      />
                    ) : (
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wide">{hoursLabel}</h5>
                    )}
                    {isAdmin ? (
                      <input
                        type="text"
                        value={hoursText}
                        onChange={(e) => {
                          setHoursText(e.target.value);
                          handleContactFieldChange("hoursText", e.target.value);
                        }}
                        className="text-sm font-extrabold text-black dark:text-white bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded px-2 py-0.5 mt-0.5 outline-none w-full select-text cursor-text"
                      />
                    ) : (
                      <p className="text-sm font-extrabold text-black dark:text-white mt-0.5">
                        {hoursText}
                      </p>
                    )}
                    {isAdmin ? (
                      <input
                        type="text"
                        value={hoursSubtext}
                        onChange={(e) => {
                          setHoursSubtext(e.target.value);
                          handleContactFieldChange("hoursSubtext", e.target.value);
                        }}
                        className="text-[10px] font-medium text-slate-400 bg-transparent border-none outline-none focus:ring-0 w-full pl-0 mt-0.5 select-text cursor-text"
                      />
                    ) : (
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                        {hoursSubtext}
                      </p>
                    )}
                  </div>
                </div>

                {/* FAQ Prompt */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-[#0D9488]/10 text-[#0D9488] rounded-md shrink-0">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      {language === "ar" ? "الأدلة الإرشادية" : "Instructional Guides"}
                    </h5>
                    <p className="text-sm font-medium text-black dark:text-white mt-0.5 leading-relaxed">
                      {language === "ar" ? (
                        <>
                          تحقق من صفحة <Link href="/how-to-use" className="text-[#0D9488] font-bold hover:underline">كيف تستخدم</Link> المنصة للحصول على مقاطع فيديو ونصائح إرشادية فورية.
                        </>
                      ) : (
                        <>
                          Check out our <Link href="/how-to-use" className="text-[#0D9488] font-bold hover:underline">How to Use</Link> onboarding page for immediate tutorial videos and setup tips.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Contact Form (3/5 cols) */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-[#1A1A1A] border border-slate-200/40 dark:border-teal-500/40 rounded-lg p-8 shadow-sm">
              <AnimatePresence mode="wait">
                {!isSentSuccess ? (
                  <motion.form 
                    key="contact-form"
                    onSubmit={handleSubmit} 
                    className="space-y-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h3 className="text-lg font-bold text-black dark:text-white tracking-tight mb-4">
                      {language === "ar" ? "أرسل لنا رسالة" : "Send us a Message"}
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Name */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">{language === "ar" ? "الاسم الكامل" : "Full Name"}</label>
                        <input 
                          type="text" 
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={language === "ar" ? "مثال: د. أحمد محمد" : "e.g. Dr. John Doe"}
                          className="w-full bg-white dark:bg-[#121212] border border-slate-200/60 dark:border-teal-500/40 focus:border-[#0D9488]/40 dark:focus:border-[#0D9488]/60 focus:bg-white dark:focus:bg-[#121212] text-sm text-black dark:text-white px-4 py-3 rounded-lg outline-none transition-all placeholder:text-slate-350 dark:placeholder:text-slate-650 font-medium"
                        />
                      </div>

                      {/* Subject */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">{language === "ar" ? "موضوع الرسالة" : "Subject"}</label>
                        <input 
                          type="text" 
                          required
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder={language === "ar" ? "مثال: استفسار عن كود تفعيل الكورس" : "e.g. Course Activation Code"}
                          className="w-full bg-white dark:bg-[#121212] border border-slate-200/60 dark:border-teal-500/40 focus:border-[#0D9488]/40 dark:focus:border-[#0D9488]/60 focus:bg-white dark:focus:bg-[#121212] text-sm text-black dark:text-white px-4 py-3 rounded-lg outline-none transition-all placeholder:text-slate-350 dark:placeholder:text-slate-650 font-medium"
                        />
                      </div>

                      {/* Message */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">{language === "ar" ? "نص الرسالة" : "Message"}</label>
                        <textarea 
                          rows={5}
                          required
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={language === "ar" ? "اكتب استفسارك بالتفصيل هنا..." : "Write your detailed query here..."}
                          className="w-full bg-white dark:bg-[#121212] border border-slate-200/60 dark:border-teal-500/40 focus:border-[#0D9488]/40 dark:focus:border-[#0D9488]/60 focus:bg-white dark:focus:bg-[#121212] text-sm text-black dark:text-white p-4 rounded-lg outline-none transition-all placeholder:text-slate-350 dark:placeholder:text-slate-650 font-medium resize-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSending}
                      className="w-full md:w-auto px-8 py-3.5 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isSending ? (
                        <span>{language === "ar" ? "جاري الإرسال..." : "Sending..."}</span>
                      ) : (
                        <>
                          <span>{language === "ar" ? "إرسال الرسالة" : "Send Message"}</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="sent-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-black dark:text-white">
                      {language === "ar" ? "تم تجهيز رسالتك بنجاح!" : "Your message is ready!"}
                    </h3>
                    <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                      {language === "ar" 
                        ? `تم فتح برنامج البريد الإلكتروني لإرسال رسالتك مباشرة إلى ${supportEmail}. سيتواصل معك فريق الدعم قريباً.`
                        : `Your mail client has been opened to dispatch your message directly to ${supportEmail}. Our team will respond shortly.`}
                    </p>
                    <button
                      onClick={() => setIsSentSuccess(false)}
                      className="px-6 py-2.5 bg-slate-100 dark:bg-zinc-800 text-black dark:text-white font-bold text-xs rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
                    >
                      {language === "ar" ? "إرسال رسالة أخرى" : "Send Another Message"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
