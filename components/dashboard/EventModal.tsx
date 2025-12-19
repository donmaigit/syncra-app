"use client";

import { useState } from "react";
import { Plus, X, Loader2, Edit } from "lucide-react";
import { useTranslations } from "next-intl";
import { createEvent, updateEvent } from "@/app/actions/event-actions";

type EventData = {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
  capacity: number;
  funnelId: string;
  eventType: string;
};

export function EventModal({ funnels, eventToEdit }: { funnels: { id: string; name: string }[], eventToEdit?: EventData }) {
  const t = useTranslations("Events");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEdit = !!eventToEdit;

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    if (isEdit && eventToEdit) {
      formData.append("eventId", eventToEdit.id);
      await updateEvent(formData);
    } else {
      await createEvent(formData);
    }
    setLoading(false);
    setIsOpen(false);
  };

  // Helper to format date for datetime-local input (YYYY-MM-DDTHH:mm)
  const formatDate = (date: Date) => {
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  return (
    <>
      {isEdit ? (
        <button onClick={() => setIsOpen(true)} className="text-slate-400 hover:text-blue-500 transition-colors p-1" title="Edit">
          <Edit className="h-4 w-4" />
        </button>
      ) : (
        <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/20">
          <Plus className="h-4 w-4" /> {t('create_btn')}
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-xl bg-[#1E293B] border border-white/10 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{isEdit ? t('edit_title') : t('modal_title')}</h2>
              <button onClick={() => setIsOpen(false)}><X className="text-slate-400 hover:text-white" /></button>
            </div>

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-400 uppercase">{t('type_label')}</label>
                <select name="eventType" defaultValue={eventToEdit?.eventType || "seminar"} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white focus:border-purple-500 outline-none appearance-none">
                  <option value="seminar">{t('type_seminar')}</option>
                  <option value="consultation">{t('type_consultation')}</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-400 uppercase">Title</label>
                <input name="title" defaultValue={eventToEdit?.title} required className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white focus:border-purple-500 outline-none" placeholder="e.g. Weekly Strategy Call" />
              </div>

              {!isEdit && (
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-400 uppercase">Attach to Funnel</label>
                  {/* FIX: Removed defaultValue referencing eventToEdit since it's undefined here */}
                  <select name="funnelId" required className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white focus:border-purple-500 outline-none appearance-none">
                    {funnels.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-400 uppercase">Start Time</label>
                  <input name="startAt" type="datetime-local" defaultValue={eventToEdit ? formatDate(eventToEdit.startAt) : ""} required className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-400 uppercase">End Time</label>
                  <input name="endAt" type="datetime-local" defaultValue={eventToEdit ? formatDate(eventToEdit.endAt) : ""} required className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white focus:border-purple-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-400 uppercase">Capacity</label>
                <input name="capacity" type="number" defaultValue={eventToEdit?.capacity || 100} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white focus:border-purple-500 outline-none" />
              </div>

              <button type="submit" disabled={loading} className="w-full rounded-lg bg-purple-600 py-3 font-bold text-white hover:bg-purple-500 mt-4">
                {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (isEdit ? t('update_submit') : t('create_submit'))}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}