"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";
import ConfirmModal from "@/components/ConfirmModal";
import { 
  Inbox, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Search, 
  RefreshCw,
  Phone,
  User,
  Package,
  X
} from "lucide-react";

export interface OrderRequestItem {
  id: string;
  packageTitle: string;
  price: string;
  phone: string;
  studentName?: string;
  createdAt: string;
  status?: "pending" | "completed";
}

interface AdminOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminOrdersModal({ isOpen, onClose }: AdminOrdersModalProps) {
  const { language } = useLanguage();
  const [orders, setOrders] = useState<OrderRequestItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const loadOrders = () => {
    try {
      const saved = localStorage.getItem("medicinety_order_requests");
      if (saved) {
        setOrders(JSON.parse(saved));
      } else {
        setOrders([]);
      }
    } catch (e) {
      setOrders([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen]);

  const saveOrders = (updated: OrderRequestItem[]) => {
    setOrders(updated);
    localStorage.setItem("medicinety_order_requests", JSON.stringify(updated));
    window.dispatchEvent(new Event("medicinety_orders_updated"));
  };

  const handleToggleStatus = (id: string) => {
    const updated = orders.map(o => {
      if (o.id === id) {
        const nextStatus: "pending" | "completed" = o.status === "completed" ? "pending" : "completed";
        return { ...o, status: nextStatus };
      }
      return o;
    });
    saveOrders(updated);
  };

  const confirmDeleteOrder = () => {
    if (!orderToDelete) return;
    const updated = orders.filter(o => o.id !== orderToDelete);
    saveOrders(updated);
    setOrderToDelete(null);
  };

  const handleClearCompleted = () => {
    const updated = orders.filter(o => o.status !== "completed");
    saveOrders(updated);
  };

  if (!isOpen) return null;

  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    return (
      (o.packageTitle || "").toLowerCase().includes(q) ||
      (o.phone || "").toLowerCase().includes(q) ||
      (o.studentName || "").toLowerCase().includes(q)
    );
  });

  const pendingCount = orders.filter(o => o.status !== "completed").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/75 backdrop-blur-md select-none animate-fade-in text-left rtl:text-right">
      <div className="w-full max-w-4xl bg-white dark:bg-[#161616] rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-teal-500/30 space-y-5 max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-black dark:text-white tracking-tight">
                {language === "ar" ? "لوحة طلبات الاشتراكات والتفعيل" : "Orders & Activation Requests Inbox"}
              </h3>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 text-xs font-black rounded-full shadow-sm">
                  {pendingCount} {language === "ar" ? "جديد" : "New"}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {language === "ar" 
                ? "هنا تظهر كافة أرقام وطلبات الطلاب الراغبين بالاشتراك في الباقات والعروض للتواصل معهم وتسليمهم الكود:" 
                : "All incoming student activation requests and phone numbers for WhatsApp delivery:"}
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-black dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder={language === "ar" ? "بحث برقم الهاتف أو الاسم أو الباقة..." : "Search phone, name, or package..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 rtl:pr-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none focus:border-[#0D9488]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={loadOrders}
              className="p-2 bg-slate-100 dark:bg-zinc-800 hover:bg-[#0D9488] hover:text-white text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="تحديث القائمة"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="text-[11px]">{language === "ar" ? "تحديث" : "Refresh"}</span>
            </button>

            {orders.some(o => o.status === "completed") && (
              <button
                onClick={handleClearCompleted}
                className="px-3 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-red-600 hover:text-white text-slate-500 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
              >
                {language === "ar" ? "مسح الطلبات المكتملة" : "Clear Completed"}
              </button>
            )}
          </div>
        </div>

        {/* Orders List Container */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center bg-slate-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 space-y-3">
              <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {language === "ar" ? "لا توجد طلبات اشتراك مسجلة حالياً" : "No order requests received yet"}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {language === "ar" ? "عندما يقوم أي طالب بالضغط على زر الاشتراك وإدخال رقم هاتفه، سيظهر طلبه هنا فوراً." : "When a student submits an order request with their phone number, it will appear here instantly."}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isCompleted = order.status === "completed";
              const cleanPhone = (order.phone || "").replace(/[^0-9+]/g, "");
              const waUrl = `https://wa.me/${cleanPhone.replace("+", "")}?text=${encodeURIComponent(
                language === "ar"
                  ? `مرحباً دكتور ${order.studentName || ""}، بخصوص طلب اشتراكك في (${order.packageTitle}) من منصة Medicinety:`
                  : `Hello Dr. ${order.studentName || ""}, regarding your subscription request for (${order.packageTitle}) on Medicinety:`
              )}`;

              const formattedDate = new Date(order.createdAt).toLocaleString(language === "ar" ? "ar-EG" : "en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <div
                  key={order.id}
                  className={`p-4 md:p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm ${
                    isCompleted
                      ? "bg-slate-50/60 dark:bg-zinc-900/40 border-slate-200/50 dark:border-zinc-800 opacity-65"
                      : "bg-white dark:bg-[#1A1A1A] border-teal-500/30 ring-1 ring-teal-500/10 shadow-md"
                  }`}
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        isCompleted
                          ? "bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-400"
                          : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                      }`}>
                        {isCompleted 
                          ? (language === "ar" ? "تم التفعيل والتواصل ✓" : "Completed ✓") 
                          : (language === "ar" ? "طلب جديد قيد الانتظار ⏳" : "Pending Action ⏳")}
                      </span>

                      <span className="text-[11px] text-slate-400 font-mono">
                        {formattedDate}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-black dark:text-white flex items-center gap-2">
                        <span>{order.packageTitle}</span>
                        <span className="text-xs text-[#0D9488] font-black">({order.price})</span>
                      </h4>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-slate-600 dark:text-slate-300">
                        {order.studentName && (
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{order.studentName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 font-mono text-[#0D9488] font-black">
                          <Phone className="w-3.5 h-3.5" />
                          <span dir="ltr">{order.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-zinc-800">
                    {/* Direct WhatsApp Action */}
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      title="فتح محادثة واتساب مع الطالب"
                    >
                      <span>واتساب</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* Mark as Completed Toggle */}
                    <button
                      onClick={() => handleToggleStatus(order.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isCompleted
                          ? "bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300"
                          : "bg-teal-50 dark:bg-teal-950/50 text-[#0D9488] hover:bg-[#0D9488] hover:text-white border border-teal-500/20"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isCompleted ? (language === "ar" ? "إلغاء الإنجاز" : "Uncheck") : (language === "ar" ? "تم التفعيل" : "Mark Done")}</span>
                    </button>

                    {/* Delete Order */}
                    <button
                      onClick={() => setOrderToDelete(order.id)}
                      className="p-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-600 hover:text-white text-red-500 rounded-xl transition-all cursor-pointer"
                      title="حذف هذا الطلب"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800 shrink-0">
          <span className="text-xs text-slate-400 font-bold">
            {language === "ar" ? `إجمالي الطلبات: ${orders.length}` : `Total Orders: ${orders.length}`}
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-black dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-black rounded-xl cursor-pointer"
          >
            {language === "ar" ? "إغلاق" : "Close"}
          </button>
        </div>

      </div>

      {/* Confirm Delete Order Modal */}
      <ConfirmModal
        isOpen={Boolean(orderToDelete)}
        title={language === "ar" ? "حذف طلب الاشتراك" : "Delete Order Request"}
        message={language === "ar" ? "هل أنت متأكد من رغبتك في حذف هذا الطلب نهائياً من السجل؟" : "Are you sure you want to delete this order request permanently?"}
        confirmText={language === "ar" ? "نعم، حذف" : "Yes, Delete"}
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
        onConfirm={confirmDeleteOrder}
        onCancel={() => setOrderToDelete(null)}
      />
    </div>
  );
}
