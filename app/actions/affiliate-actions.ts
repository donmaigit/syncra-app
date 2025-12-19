"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// --- 1. ADD NEW PARTNER (Create User + Affiliate Profile) ---
export async function addPartner(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) return { error: "Missing fields" };

  try {
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // FIX: Generate a random subdomain for this partner since it's required
      // e.g. "john-doe-492"
      const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const randomSuffix = Math.floor(Math.random() * 10000);
      const subdomain = `${cleanName}-${randomSuffix}`;

      const hashedPassword = await bcrypt.hash(password, 12);
      
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          subdomain: subdomain, // <--- ADDED THIS
          role: "user",
          plan: "free"
        }
      });
    }

    // Check if they already have an affiliate profile
    const existingProfile = await prisma.affiliate.findUnique({
      where: { userId: user.id }
    });

    if (existingProfile) {
      return { error: "User is already an affiliate." };
    }

    // Create Profile
    // Code: name-random (e.g. john-doe-123)
    const code = (name || "partner").toLowerCase().replace(/\s/g, '-') + "-" + Math.floor(Math.random()*1000);

    await prisma.affiliate.create({
      data: {
        userId: user.id,
        code
      }
    });

    revalidatePath("/dashboard/affiliates");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create partner." };
  }
}

// --- 2. CREATE CAMPAIGN ---
export async function createCampaign(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const funnelId = formData.get("funnelId") as string;
  const type = formData.get("type") as string; // 'percent' or 'fixed'
  const value = parseInt(formData.get("value") as string);

  if (!name || !funnelId || !value) return { error: "Missing fields" };

  try {
    // Generate unique slug
    const slug = name.toLowerCase().replace(/\s/g, '-') + "-" + Math.floor(Math.random()*1000);

    await prisma.affiliateCampaign.create({
      data: {
        name,
        slug,
        funnelId,
        type,
        value,
        isActive: true
      }
    });

    revalidatePath("/dashboard/affiliates");
    return { success: true };
  } catch (e) {
    return { error: "Failed to create campaign." };
  }
}

// UPDATE PARTNER (Code & Notes)
export async function updatePartner(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  const partnerId = formData.get("partnerId") as string;
  const code = formData.get("code") as string;
  const internalNotes = formData.get("internalNotes") as string;

  try {
    const existing = await prisma.affiliate.findUnique({ where: { code } });
    if (existing && existing.id !== partnerId) {
      return { error: "This tracking code is already taken." };
    }

    await prisma.affiliate.update({
      where: { id: partnerId },
      data: { 
        code: code.toLowerCase().replace(/[^a-z0-9-]/g, ""),
        internalNotes 
      }
    });

    revalidatePath("/dashboard/affiliates");
    return { success: true };
  } catch (e) {
    return { error: "Failed to update partner." };
  }
}

// UPDATE CAMPAIGN (Active, Notes, Head/Footer)
export async function updateCampaign(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  const campaignId = formData.get("campaignId") as string;
  const name = formData.get("name") as string;
  const internalNotes = formData.get("internalNotes") as string;
  const headCode = formData.get("headCode") as string;
  const footerCode = formData.get("footerCode") as string;
  const isActive = formData.get("isActive") === "true";

  try {
    await prisma.affiliateCampaign.update({
      where: { id: campaignId },
      data: { 
        name,
        internalNotes,
        headCode,
        footerCode,
        isActive
      }
    });

    revalidatePath("/dashboard/affiliates");
    return { success: true };
  } catch (e) {
    return { error: "Failed to update campaign." };
  }
}