"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ==============================================================================
// 🔐 PROTECTED ACTIONS (For Dashboard)
// ==============================================================================

export async function getMeetingTypes() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  return await prisma.meetingType.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { meetings: true } } }
  });
}

export async function createMeetingType(data: { title: string, duration: number, slug: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const defaultAvailability = {
      mon: ["09:00-17:00"],
      tue: ["09:00-17:00"],
      wed: ["09:00-17:00"],
      thu: ["09:00-17:00"],
      fri: ["09:00-17:00"],
      sat: [],
      sun: []
    };

    const meeting = await prisma.meetingType.create({
      data: {
        userId: session.user.id,
        title: data.title,
        duration: data.duration,
        slug: data.slug,
        availability: defaultAvailability,
        isActive: true
      }
    });

    revalidatePath("/dashboard/calendars");
    return { success: true, meeting };
  } catch (e) {
    return { error: "Failed to create calendar. Slug might be duplicate." };
  }
}

export async function updateMeetingType(id: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.meetingType.update({
    where: { id, userId: session.user.id },
    data
  });

  revalidatePath("/dashboard/calendars");
  return { success: true };
}

export async function deleteMeetingType(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.meetingType.delete({
    where: { id, userId: session.user.id }
  });

  revalidatePath("/dashboard/calendars");
  return { success: true };
}

// ==============================================================================
// 🌍 PUBLIC ACTIONS (For Widgets & Funnels)
// ==============================================================================

export async function getEventStats(eventId: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { bookings: true } } }
    });

    if (event) {
      return {
        found: true,
        type: "seminar",
        title: event.title,
        capacity: event.capacity,
        booked: event._count.bookings,
        remaining: Math.max(0, event.capacity - event._count.bookings),
        startAt: event.startAt,
        endAt: event.endAt
      };
    }

    const meetingType = await prisma.meetingType.findUnique({
      where: { id: eventId }
    });

    if (meetingType) {
      return {
        found: true,
        type: "calendar",
        title: meetingType.title,
        duration: meetingType.duration,
        availability: meetingType.availability
      };
    }

    return { found: false };
  } catch (e) {
    return { found: false, error: "Failed to fetch event" };
  }
}

export async function bookEvent(data: { 
  eventId: string, 
  name: string, 
  email: string, 
  funnelId?: string, 
  startTime?: string 
}) {
  try {
    const meetingType = await prisma.meetingType.findUnique({ where: { id: data.eventId } });

    if (meetingType) {
      if (!data.startTime) return { error: "Start time is required." };

      let targetFunnelId = data.funnelId;
      if (!targetFunnelId) {
        const fallbackFunnel = await prisma.funnel.findFirst({ 
          where: { userId: meetingType.userId },
          select: { id: true } 
        });
        targetFunnelId = fallbackFunnel?.id;
      }

      if (!targetFunnelId) return { error: "Configuration Error: No funnel found." };

      let contact = await prisma.contact.findFirst({ 
        where: { email: data.email, userId: meetingType.userId } 
      });
      
      if (!contact) {
        contact = await prisma.contact.create({
          data: { 
            email: data.email, 
            name: data.name, 
            userId: meetingType.userId, 
            funnelId: targetFunnelId
          }
        });
      }

      await prisma.meeting.create({
        data: {
          meetingTypeId: meetingType.id,
          contactId: contact.id,
          startTime: new Date(data.startTime),
          endTime: new Date(new Date(data.startTime).getTime() + meetingType.duration * 60000), 
          status: "confirmed",
          funnelId: targetFunnelId
        }
      });

      return { success: true, message: "Appointment Confirmed" };
    }

    const event = await prisma.event.findUnique({ 
      where: { id: data.eventId },
      include: { funnel: true } 
    });

    if (!event) return { error: "Event not found" };

    const count = await prisma.booking.count({ where: { eventId: data.eventId } });
    if (count >= event.capacity) return { error: "Event is full" };

    let contact = await prisma.contact.findFirst({ 
      where: { email: data.email, funnelId: event.funnelId } 
    });
    
    if (!contact) {
      contact = await prisma.contact.create({
        data: { 
          email: data.email, 
          name: data.name, 
          funnelId: event.funnelId, 
          userId: event.funnel.userId 
        }
      });
    }

    await prisma.booking.create({
      data: {
        eventId: event.id,
        contactId: contact.id,
        status: "confirmed",
        ticketId: "free"
      }
    });

    return { success: true, message: "Registered Successfully" };

  } catch (e) {
    console.error(e);
    return { error: "Booking failed. Please try again." };
  }
}

// --- PUBLIC: CALCULATE TIME SLOTS (NEW) ---
export async function getAvailableSlots(meetingTypeId: string, dateStr: string) {
  try {
    const meetingType = await prisma.meetingType.findUnique({
      where: { id: meetingTypeId }
    });
    
    if (!meetingType || !meetingType.availability) return { slots: [] };

    const targetDate = new Date(dateStr);
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayKey = days[targetDate.getDay()];
    
    const availability = meetingType.availability as any;
    const ranges = availability[dayKey] || [];

    if (ranges.length === 0) return { slots: [] };

    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await prisma.meeting.findMany({
      where: {
        meetingTypeId,
        startTime: { gte: startOfDay, lte: endOfDay },
        status: "confirmed"
      }
    });

    const duration = meetingType.duration;
    const availableSlots: string[] = [];

    for (const range of ranges) {
      const [startStr, endStr] = range.split('-'); 
      const slotTime = new Date(dateStr + 'T' + startStr);
      const endTime = new Date(dateStr + 'T' + endStr);

      while (slotTime.getTime() + duration * 60000 <= endTime.getTime()) {
        const slotStart = new Date(slotTime);
        const slotEnd = new Date(slotTime.getTime() + duration * 60000);

        const isConflict = existingBookings.some(booking => {
          return (booking.startTime < slotEnd) && (booking.endTime > slotStart);
        });

        if (!isConflict) {
          // Format "HH:mm" manually to avoid timezone issues (uses local time)
          const h = slotStart.getHours().toString().padStart(2, '0');
          const m = slotStart.getMinutes().toString().padStart(2, '0');
          availableSlots.push(`${h}:${m}`);
        }
        slotTime.setMinutes(slotTime.getMinutes() + duration);
      }
    }

    return { slots: availableSlots };

  } catch (e) {
    console.error("Slot Calculation Error:", e);
    return { slots: [] };
  }
}