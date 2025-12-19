"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Updated Interface
interface LeadData {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  funnelId: string;
  // Address Data
  zip?: string;
  prefecture?: string;
  city?: string;
  street?: string;
  building?: string;
}

export async function saveLead(data: LeadData) {
  try {
    if (!data.email || !data.funnelId) {
      return { error: "Email and Funnel ID are required." };
    }

    // 1. Get Funnel Owner
    const funnel = await prisma.funnel.findUnique({
      where: { id: data.funnelId },
      select: { userId: true }
    });

    if (!funnel) return { error: "Funnel not found." };

    // 2. Compute Display Name
    const fullName = `${data.lastName || ''} ${data.firstName || ''}`.trim();

    // 3. UPSERT LOGIC
    const existingContact = await prisma.contact.findFirst({
      where: {
        email: data.email,
        userId: funnel.userId
      }
    });

    let contact;

    if (existingContact) {
      // UPDATE existing
      contact = await prisma.contact.update({
        where: { id: existingContact.id },
        data: {
          firstName: data.firstName || undefined,
          lastName: data.lastName || undefined,
          name: fullName || undefined,
          phone: data.phone || undefined,
          // Address Update
          zip: data.zip || undefined,
          prefecture: data.prefecture || undefined,
          city: data.city || undefined,
          street: data.street || undefined,
          building: data.building || undefined
        }
      });
    } else {
      // CREATE new
      contact = await prisma.contact.create({
        data: {
          email: data.email,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          name: fullName,
          phone: data.phone || "",
          userId: funnel.userId,
          funnelId: data.funnelId,
          // Address Create
          zip: data.zip || "",
          prefecture: data.prefecture || "",
          city: data.city || "",
          street: data.street || "",
          building: data.building || "",
          tags: ["lead", "optin"]
        }
      });
    }

    revalidatePath("/dashboard/contacts");
    return { success: true, contactId: contact.id };

  } catch (error) {
    console.error("Save Lead Error:", error);
    return { error: "Failed to save contact." };
  }
}

// --- GET CONTACTS (Preserved & Typed) ---
export async function getContacts(funnelId?: string) {
  try {
    const where = funnelId ? { funnelId } : {};
    return await prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  } catch (e) {
    return [];
  }
}