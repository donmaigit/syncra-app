import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMeetingTypes } from "@/app/actions/booking-actions";
import { prisma } from "@/lib/prisma";
import CalendarsClient from "@/components/dashboard/CalendarsClient";

export default async function CalendarsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch Data
  const [calendars, user] = await Promise.all([
    getMeetingTypes(),
    prisma.user.findUnique({ 
      where: { id: session.user.id },
      select: { subdomain: true }
    })
  ]);

  return (
    <div className="p-6 md:p-10 space-y-8 text-slate-900 dark:text-white pb-20">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">Booking Calendars</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Manage your appointment types and availability.
        </p>
      </div>

      <CalendarsClient calendars={calendars} subdomain={user?.subdomain ?? ""} />
    </div>
  );
}