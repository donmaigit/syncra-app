"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// --- CREATE EVENT ---
export async function createEvent(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const startAt = formData.get("startAt") as string; // ISO string from datetime-local
  const endAt = formData.get("endAt") as string;
  const capacity = parseInt(formData.get("capacity") as string) || 100;
  const funnelId = formData.get("funnelId") as string;
  
  // Optional initial memo if you added it to Create Modal
  const internalNotes = formData.get("internalNotes") as string; 

  if (!title || !startAt || !endAt || !funnelId) {
    return { error: "Missing required fields." };
  }

  try {
    await prisma.event.create({
      data: {
        title,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        capacity,
        funnelId,
        internalNotes: internalNotes || null
      }
    });

    revalidatePath("/dashboard/events");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create event." };
  }
}

// --- UPDATE EVENT ---
export async function updateEvent(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  const eventId = formData.get("eventId") as string;
  const title = formData.get("title") as string;
  const internalNotes = formData.get("internalNotes") as string;
  const headCode = formData.get("headCode") as string;
  const footerCode = formData.get("footerCode") as string;
  
  // Optional: Dates/Capacity might be editable too
  // const startAt = formData.get("startAt") as string;
  
  try {
    await prisma.event.update({
      where: { id: eventId },
      data: { 
        title,
        internalNotes: internalNotes || null,
        headCode: headCode || null,
        footerCode: footerCode || null
      }
    });

    revalidatePath("/dashboard/events");
    return { success: true };
  } catch (e) {
    return { error: "Failed to update event." };
  }
}

// --- DELETE EVENT ---
export async function deleteEvent(eventId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  try {
    await prisma.event.delete({
      where: { id: eventId }
    });
    
    revalidatePath("/dashboard/events");
    return { success: true };
  } catch (e) {
    return { error: "Failed to delete event." };
  }
}