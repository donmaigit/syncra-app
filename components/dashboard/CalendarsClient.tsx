"use client";

import { useState } from "react";
import { Plus, Calendar, Clock, Copy, Trash2, X, Save, Check } from "lucide-react";
import { createMeetingType, deleteMeetingType, updateMeetingType } from "@/app/actions/booking-actions";
import { useRouter } from "next/navigation";

interface Availability {
  [key: string]: string[];
}

export default function CalendarsClient({ calendars, subdomain }: { calendars: any[], subdomain: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // MODAL STATES
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState<any>(null);

  // FORMS
  const [createForm, setCreateForm] = useState({ title: "", duration: 30, slug: "" });
  const [availability, setAvailability] = useState<Availability>({});

  // --- HANDLERS ---

  const handleCreate = async () => {
    if (!createForm.title || !createForm.slug) return;
    setLoading(true);
    const res = await createMeetingType(createForm);
    if (res.success) {
      setCreateModalOpen(false);
      setCreateForm({ title: "", duration: 30, slug: "" });
      router.refresh();
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will break any funnels using this calendar.")) return;
    await deleteMeetingType(id);
    router.refresh();
  };

  const openEditModal = (cal: any) => {
    setSelectedCalendar(cal);
    // Ensure availability has all days initialized
    const defaultDays: Availability = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
    setAvailability({ ...defaultDays, ...(cal.availability as object) });
    setEditModalOpen(true);
  };

  const handleSaveAvailability = async () => {
    if (!selectedCalendar) return;
    setLoading(true);
    
    // Save the updated JSON availability
    await updateMeetingType(selectedCalendar.id, { 
      availability: availability,
      // You could also add title/duration editing here if needed
    });
    
    setEditModalOpen(false);
    setLoading(false);
    router.refresh();
  };

  // AVAILABILITY HELPERS
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  
  const addSlot = (day: string) => {
    const current = availability[day] || [];
    setAvailability({ ...availability, [day]: [...current, "09:00-17:00"] });
  };

  const removeSlot = (day: string, index: number) => {
    const current = availability[day] ? [...availability[day]] : [];
    current.splice(index, 1);
    setAvailability({ ...availability, [day]: current });
  };

  const updateSlot = (day: string, index: number, value: string) => {
    const current = availability[day] ? [...availability[day]] : [];
    current[index] = value;
    setAvailability({ ...availability, [day]: current });
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`https://${subdomain}.syncra.page/book/${slug}`);
    alert("Copied to clipboard!");
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Your Calendars</h2>
        <button 
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
        >
          <Plus size={18} /> New Calendar
        </button>
      </div>

      {/* CALENDAR GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {calendars.length === 0 ? (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl text-slate-500">
            No calendars created yet.
          </div>
        ) : (
          calendars.map((cal) => (
            <div key={cal.id} className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg">
                  <Calendar size={24} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => copyLink(cal.slug)} className="p-2 text-slate-400 hover:text-blue-500 rounded"><Copy size={16} /></button>
                  <button onClick={() => handleDelete(cal.id)} className="p-2 text-slate-400 hover:text-red-500 rounded"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <h3 className="font-bold text-lg mb-1">{cal.title}</h3>
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                <span className="flex items-center gap-1"><Clock size={12} /> {cal.duration} mins</span>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 rounded">/{cal.slug}</span>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                <button 
                  onClick={() => openEditModal(cal)}
                  className="w-full text-sm font-bold text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/10 py-2 rounded transition-colors"
                >
                  Edit Availability
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- CREATE MODAL --- */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-xl shadow-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Create New Calendar</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                <input type="text" placeholder="Strategy Call" className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-black/20 outline-none" value={createForm.title} onChange={(e) => setCreateForm({...createForm, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duration (Mins)</label>
                <select className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-black/20 outline-none" value={createForm.duration} onChange={(e) => setCreateForm({...createForm, duration: parseInt(e.target.value)})}>
                  {[15, 30, 45, 60, 90].map(m => <option key={m} value={m}>{m} Min</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Slug</label>
                <div className="flex items-center border rounded-lg bg-slate-50 dark:bg-black/20 overflow-hidden">
                  <span className="pl-3 text-slate-400 text-sm">/book/</span>
                  <input type="text" placeholder="call" className="w-full p-3 bg-transparent outline-none" value={createForm.slug} onChange={(e) => setCreateForm({...createForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setCreateModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleCreate} disabled={loading} className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-lg hover:opacity-90">{loading ? "..." : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT AVAILABILITY MODAL --- */}
      {editModalOpen && selectedCalendar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-2xl rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Edit Availability: {selectedCalendar.title}</h3>
              <button onClick={() => setEditModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full"><X size={20}/></button>
            </div>

            <div className="space-y-4">
              {days.map((day) => (
                <div key={day} className="flex flex-col md:flex-row gap-4 py-4 border-b border-slate-100 dark:border-white/5 last:border-0">
                  <div className="w-16 font-bold uppercase text-sm pt-2 text-slate-500">{day}</div>
                  <div className="flex-1 space-y-2">
                    {(!availability[day] || availability[day].length === 0) && (
                      <div className="text-sm text-slate-400 italic pt-2">Unavailable</div>
                    )}
                    {availability[day]?.map((slot, idx) => {
                      const [start, end] = slot.split('-');
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <input 
                            type="time" 
                            className="p-2 border rounded bg-slate-50 dark:bg-black/20 outline-none text-sm"
                            value={start}
                            onChange={(e) => updateSlot(day, idx, `${e.target.value}-${end}`)}
                          />
                          <span className="text-slate-400">-</span>
                          <input 
                            type="time" 
                            className="p-2 border rounded bg-slate-50 dark:bg-black/20 outline-none text-sm"
                            value={end}
                            onChange={(e) => updateSlot(day, idx, `${start}-${e.target.value}`)}
                          />
                          <button onClick={() => removeSlot(day, idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                        </div>
                      )
                    })}
                  </div>
                  <button onClick={() => addSlot(day)} className="self-start p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded font-bold text-sm flex items-center gap-1">
                    <Plus size={16}/> Add
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-white/10">
              <button onClick={() => setEditModalOpen(false)} className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleSaveAvailability} disabled={loading} className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:opacity-90 flex items-center gap-2">
                <Save size={18} /> {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}