import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { MapPin, Video, Link as LinkIcon, Calendar, Lock } from 'lucide-react';
import { CreateEventModal } from '@/components/dashboard/CreateEventModal';
import { DeleteButton } from '@/components/dashboard/DeleteButton';
import { deleteEvent } from '@/app/actions/event-actions';

// !!! IMPORTANT: You must create this component based on EditCampaignModal structure !!!
import { EditEventModal } from '@/components/dashboard/EditEventModal'; 

export default async function EventsPage() {
  const t = await getTranslations('Events');
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) redirect('/');

  // 1. Fetch User (To get ID and Funnels List for the Modal)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { 
      id: true,
      funnels: { 
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      } 
    }
  });

  if (!user) redirect('/');

  // 2. Fetch Events (Events -> Funnel -> User)
  const events = await prisma.event.findMany({
    where: {
      funnel: { userId: user.id }
    },
    include: { 
      funnel: true,
      bookings: true
    },
    orderBy: { startAt: 'asc' }
  });

  return (
    <div className="p-6 md:p-10 text-slate-900 dark:text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-slate-500 mt-1">{t('subtitle')}</p>
        </div>
        <CreateEventModal funnels={user.funnels} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {events.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 rounded-xl border border-dashed border-slate-300 dark:border-white/10 text-slate-500 bg-slate-50 dark:bg-slate-900/50">
            <p className="mb-4 italic">{t('empty')}</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-white/10 p-6 shadow-sm flex flex-col hover:border-purple-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 pr-2">
                  <h3 className="text-lg font-bold truncate" title={event.title}>{event.title}</h3>
                  <p className="text-xs text-purple-600 font-bold uppercase mt-1 tracking-wide">{event.eventType}</p>
                  
                  {/* Internal Memo Display */}
                  {event.internalNotes && (
                    <div className="mt-2 text-xs text-slate-400 flex items-start gap-1">
                       <Lock className="h-3 w-3 mt-0.5 shrink-0 opacity-50" />
                       <span className="line-clamp-2">{event.internalNotes}</span>
                    </div>
                  )}
                </div>
                <div className="bg-slate-100 dark:bg-white/5 p-2 rounded text-center min-w-[50px] border border-slate-200 dark:border-white/5 shrink-0">
                  <div className="text-xs font-bold text-slate-500 uppercase">{event.startAt.toLocaleString('default', { month: 'short' })}</div>
                  <div className="text-xl font-bold">{event.startAt.getDate()}</div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6 flex-1">
                <div className="flex items-center gap-2">
                  {event.locationType === 'online' ? <Video className="h-4 w-4 text-slate-400" /> : <MapPin className="h-4 w-4 text-slate-400" />}
                  <span className="truncate">{event.locationType === 'online' ? 'Online Event' : event.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-slate-400" />
                  <span className="truncate">Linked to: <span className="font-semibold text-slate-700 dark:text-slate-200">{event.funnel.name}</span></span>
                </div>
                <div className="flex items-center gap-2">
                   <Calendar className="h-4 w-4 text-slate-400" />
                   <span className="text-xs">{event.startAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {event.endAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex gap-2">
                {/* EDIT BUTTON MODAL */}
                <div className="flex-1">
                   <EditEventModal event={event} /> 
                </div>

                {/* DELETE BUTTON */}
                <div className="flex-none">
                  <DeleteButton 
                    itemName={event.title} 
                    onDelete={async () => { "use server"; await deleteEvent(event.id); }} 
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}