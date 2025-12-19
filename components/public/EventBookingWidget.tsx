"use client";

import { useState, useEffect } from "react";
import { Calendar, Users, CheckCircle2, AlertCircle, Loader2, Clock } from "lucide-react";
// Import getAvailableSlots
import { bookEvent, getEventStats, getAvailableSlots } from "@/app/actions/booking-actions";

interface EventStats {
  found: boolean;
  type?: 'seminar' | 'calendar';
  title?: string;
  capacity?: number;
  booked?: number;
  remaining?: number;
  startAt?: string;
  duration?: number;
  availability?: any;
}

export default function EventBookingWidget({ eventId, locale = 'ja' }: { eventId: string, locale?: string }) {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState("");
  
  // Calendar State
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // --- TRANSLATIONS ---
  const t = {
    loading: locale === 'ja' ? "読み込み中..." : "Loading event details...",
    notFound: locale === 'ja' ? "イベントが見つかりません" : "Event not found",
    full: locale === 'ja' ? "満席です" : "Sold Out",
    spotsLeft: (n: number) => locale === 'ja' ? `残り ${n} 席` : `${n} spots left`,
    bookBtn: locale === 'ja' ? "予約を確定する" : "Confirm Booking",
    successTitle: locale === 'ja' ? "予約完了！" : "Booking Confirmed!",
    successMsg: locale === 'ja' ? "確認メールをお送りしました。" : "We have sent you a confirmation email.",
    nameLabel: locale === 'ja' ? "お名前" : "Full Name",
    emailLabel: locale === 'ja' ? "メールアドレス" : "Email Address",
    selectTime: locale === 'ja' ? "日時を選択してください" : "Select a Date & Time",
    dateLabel: locale === 'ja' ? "日付を選択" : "Select Date",
    noSlots: locale === 'ja' ? "予約可能な時間がありません" : "No slots available for this date.",
    duration: (n: number) => locale === 'ja' ? `所要時間: ${n}分` : `Duration: ${n} mins`
  };

  useEffect(() => {
    if (!eventId) return;
    getEventStats(eventId).then((res) => {
      setStats(res as EventStats);
      setLoading(false);
    });
  }, [eventId]);

  const handleBooking = async (formData: FormData) => {
    setBooking(true);
    setErrorMsg("");

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    if (!name || !email) {
      setErrorMsg(locale === 'ja' ? "すべての項目を入力してください" : "All fields are required");
      setBooking(false);
      return;
    }

    const payload = {
      eventId,
      name,
      email,
      startTime: selectedTime || undefined 
    };

    const res = await bookEvent(payload);

    if (res.success) {
      setStatus('success');
    } else {
      setStatus('error');
      setErrorMsg(res.error || (locale === 'ja' ? "予約に失敗しました" : "Booking failed"));
    }
    setBooking(false);
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse"><Loader2 className="mx-auto h-8 w-8 animate-spin mb-2"/>{t.loading}</div>;
  if (!stats?.found) return <div className="p-8 text-center text-red-500 border-2 border-red-100 rounded-xl bg-red-50"><AlertCircle className="mx-auto h-8 w-8 mb-2"/>{t.notFound}</div>;

  if (status === 'success') {
    return (
      <div className="text-center p-10 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-600 mb-4" />
        <h3 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">{t.successTitle}</h3>
        <p className="text-green-700 dark:text-green-400">{t.successMsg}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
      
      {/* HEADER */}
      <div className="bg-slate-900 dark:bg-black/40 text-white p-6 text-center">
        <h3 className="text-xl font-bold mb-2">{stats.title}</h3>
        
        {stats.type === 'seminar' ? (
          <div className="flex justify-center gap-4 text-sm opacity-90">
            <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(stats.startAt!).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Users size={14}/> {t.spotsLeft(stats.remaining!)}</span>
          </div>
        ) : (
          <div className="flex justify-center gap-4 text-sm opacity-90">
            <span className="flex items-center gap-1"><Clock size={14}/> {t.duration(stats.duration!)}</span>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        
        {/* CALENDAR TYPE */}
        {stats.type === 'calendar' && (
          <div className="space-y-4">
            
            {/* 1. Date Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 text-left">{t.dateLabel}</label>
              <input 
                type="date" 
                className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-white/5 outline-none"
                min={new Date().toISOString().split('T')[0]} 
                onChange={async (e) => {
                  const date = e.target.value;
                  if(!date) return;
                  
                  setSelectedDate(date);
                  setSelectedTime(null);
                  setLoadingSlots(true);
                  
                  const res = await getAvailableSlots(eventId, date);
                  setAvailableSlots(res.slots || []);
                  setLoadingSlots(false);
                }}
              />
            </div>

            {/* 2. Time Slot Grid */}
            {selectedDate && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <h4 className="font-bold text-xs uppercase text-slate-500 mb-2 text-left">{t.selectTime}</h4>
                
                {loadingSlots ? (
                  <div className="flex justify-center p-4"><Loader2 className="animate-spin text-purple-600"/></div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-red-500 italic text-center p-2 border border-red-100 rounded bg-red-50">{t.noSlots}</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {availableSlots.map((time) => (
                      <button 
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(`${selectedDate}T${time}:00`)}
                        className={`py-2 px-1 rounded border text-sm font-medium transition-all ${
                          selectedTime?.includes(time) 
                            ? 'bg-purple-600 text-white border-purple-600 shadow-md transform scale-105' 
                            : 'border-slate-200 hover:border-purple-400 bg-white dark:bg-white/5 dark:border-white/10 dark:text-white'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {selectedTime && (
              <p className="text-center text-xs text-green-600 font-bold bg-green-50 dark:bg-green-900/20 p-2 rounded">
                Selected: {selectedDate} @ {selectedTime.split('T')[1].slice(0,5)}
              </p>
            )}
          </div>
        )}

        {/* BOOKING FORM */}
        <form action={handleBooking} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 text-left">{t.nameLabel}</label>
            <input name="name" type="text" required className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-purple-500 dark:text-white" placeholder={locale==='ja' ? "山田 太郎" : "John Doe"} />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 text-left">{t.emailLabel}</label>
            <input name="email" type="email" required className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-purple-500 dark:text-white" placeholder="email@example.com" />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={16}/> {errorMsg}
            </div>
          )}

          <button 
            type="submit" 
            disabled={booking || (stats.type === 'calendar' && !selectedTime) || (stats.type === 'seminar' && stats.remaining === 0)}
            className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {booking && <Loader2 className="animate-spin" size={18} />}
            {(stats.type === 'seminar' && stats.remaining === 0) ? t.full : t.bookBtn}
          </button>
        </form>
      </div>
    </div>
  );
}