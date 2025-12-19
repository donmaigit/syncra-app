"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// --- HELPER: Regenerate IDs for Template Blocks ---
// This ensures every user gets unique Block IDs, preventing collisions.
function regenerateContentIds(content: any[]) {
  if (!Array.isArray(content)) return [];
  
  return content.map((block) => ({
    ...block,
    id: `blk-${Math.random().toString(36).substr(2, 9)}` // Generate fresh ID
  }));
}

// --- CREATE FUNNEL (Updated for Templates) ---
export async function createFunnel(formData: FormData, templateData?: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  // 1. Determine Name, Description & Slug
  const name = templateData?.name || formData.get("name") as string;
  const description = templateData?.description || formData.get("description") as string;
  let slug = templateData?.slug || (formData.get("slug") as string) || "";
  
  if (!name) return { error: "Name is required" };

  // 2. Slug Generation Logic
  if (!slug) {
    slug = name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  } else {
    slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  }
  
  // Append random suffix for templates to ensure uniqueness
  if (!slug || templateData) {
    const randomSuffix = Math.floor(Math.random() * 10000);
    slug = slug ? `${slug}-${randomSuffix}` : `funnel-${randomSuffix}`;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { funnels: true } 
    });

    if (!user) return { error: "User not found" };

    // 3. Prepare Steps (Template vs Default)
    const stepsToCreate = templateData?.initialSteps ? 
      templateData.initialSteps.map((step: any, index: number) => ({
        name: step.name,
        slug: step.slug,
        type: step.type || "page",
        order: index,
        // CRITICAL FIX: Regenerate IDs here
        content: regenerateContentIds(step.content || []) 
      })) 
      : [
        {
          name: "Home",
          slug: "home", 
          type: "page",
          order: 0,
          content: [] 
        }
      ];

    // 4. Create Funnel & Steps in Transaction
    const newFunnel = await prisma.funnel.create({
      data: {
        name,
        slug,
        metaDesc: description,
        userId: user.id,
        published: false,
        steps: {
          create: stepsToCreate
        }
      }
    });

    revalidatePath("/dashboard/funnels");
    
    return { success: true, id: newFunnel.id };

  } catch (e) {
    console.error(e);
    return { error: "Server error creating funnel." };
  }
}

// --- DELETE FUNNEL ---
export async function deleteFunnel(funnelId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  try {
    const funnel = await prisma.funnel.findUnique({
      where: { id: funnelId },
      include: { user: true }
    });

    if (!funnel || funnel.user.email !== session.user.email) {
      return { error: "Unauthorized" };
    }

    await prisma.funnel.delete({ where: { id: funnelId } });
    revalidatePath("/dashboard/funnels");
    return { success: true };
  } catch (e) {
    return { error: "Failed to delete funnel" };
  }
}

// --- UPDATE FUNNEL SETTINGS ---
export async function updateFunnel(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  const funnelId = formData.get("funnelId") as string;
  const name = formData.get("name") as string;
  let slug = formData.get("slug") as string;
  
  const internalNotes = formData.get("internalNotes") as string;
  const seoTitle = formData.get("seoTitle") as string;
  const seoDescription = formData.get("seoDescription") as string;
  const headCode = formData.get("headCode") as string;
  const footerCode = formData.get("footerCode") as string; 

  try {
    if (slug) slug = slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { funnels: true }
    });

    const funnel = user?.funnels.find(f => f.id === funnelId);
    if (!funnel) return { error: "Unauthorized" };

    await prisma.funnel.update({
      where: { id: funnelId },
      data: { 
        name, 
        slug: slug || funnel.slug,
        internalNotes: internalNotes || null,
        metaTitle: seoTitle || null,
        metaDesc: seoDescription || null,
        headCode: headCode || null,
        footerCode: footerCode || null 
      }
    });

    revalidatePath(`/dashboard/funnels/${funnelId}/settings`);
    return { success: true };
  } catch (e) {
    return { error: "Update failed. Slug might be taken." };
  }
}

// --- PUBLISH / UNPUBLISH ---
export async function togglePublishFunnel(funnelId: string, shouldPublish: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  try {
    await prisma.funnel.update({
      where: { id: funnelId },
      data: { published: shouldPublish }
    });
    revalidatePath(`/dashboard/funnels`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to update status" };
  }
}

// --- UPDATE FUNNEL CONTENT (Legacy) ---
export async function updateFunnelContent(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const funnelId = formData.get("funnelId") as string;
  const content = formData.get("content") as string;

  // Find the first step (Home)
  const firstStep = await prisma.funnelStep.findFirst({
    where: { funnelId, order: 0 }
  });

  if (firstStep) {
    await prisma.funnelStep.update({
      where: { id: firstStep.id },
      data: { content: JSON.parse(content) }
    });
  }

  return { success: true };
}

// --- UPDATE CUSTOM DOMAIN ---
export async function updateFunnelDomain(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  const funnelId = formData.get("funnelId") as string;
  const rawDomain = formData.get("customDomain") as string;
  const customDomain = rawDomain.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { funnels: true }
    });

    const funnel = user?.funnels.find(f => f.id === funnelId);
    if (!funnel) return { error: "Funnel not found" };

    const plan = user?.plan || 'free';
    if (plan === 'free' || plan === 'starter') {
      return { error: "Upgrade required for custom domains." };
    }

    if (customDomain) {
      const existing = await prisma.funnel.findUnique({
        where: { customDomain }
      });
      if (existing && existing.id !== funnelId) {
        return { error: "Domain is already in use." };
      }
    }

    await prisma.funnel.update({
      where: { id: funnelId },
      data: { customDomain: customDomain || null } 
    });

    revalidatePath(`/dashboard/funnels/${funnelId}/settings`);
    return { success: true };
  } catch (e) {
    return { error: "Failed to update domain" };
  }
}