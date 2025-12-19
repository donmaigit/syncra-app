"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { FUNNEL_TEMPLATES } from "@/lib/templates"; 

// --- GET FULL FUNNEL ---
export async function getFunnelEditorData(funnelId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
    include: { 
      steps: { orderBy: { order: 'asc' } },
      user: { 
        select: { 
          subdomain: true,
          // Fetch Key Status
          stripeConnectOnboarded: true,
          stripeAccountId: true,
          univaStoreId: true,
          univaSecret: true,
          aquaSiteId: true,
          aquaAccessToken: true
        } 
      }
    }
  });

  if (!funnel || funnel.userId !== session.user.id) {
    return { error: "Not found or unauthorized" };
  }

  // Calculate Key Status
  const keysConfigured = {
    stripe: !!(funnel.user.stripeConnectOnboarded && funnel.user.stripeAccountId),
    univa: !!(funnel.user.univaStoreId && funnel.user.univaSecret),
    aqua: !!(funnel.user.aquaSiteId && funnel.user.aquaAccessToken)
  };

  // Auto-create Home Step if empty
  if (funnel.steps.length === 0) {
    const defaultStep = await prisma.funnelStep.create({
      data: {
        funnelId: funnel.id,
        name: "Home",
        slug: "", 
        order: 0,
        content: [], 
        type: "page"
      }
    });
    return { 
      funnel: { ...funnel, steps: [defaultStep] }, 
      subdomain: funnel.user.subdomain,
      keysConfigured
    };
  }

  return { 
    funnel, 
    subdomain: funnel.user.subdomain,
    keysConfigured
  };
}

// --- APPLY TEMPLATE (MULTI-PAGE IMPORT) ---
export async function applyFunnelTemplate(funnelId: string, templateId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  // 1. Verify Ownership
  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId }
  });
  if (!funnel || funnel.userId !== session.user.id) return { error: "Unauthorized" };

  // 2. Find Template
  const template = FUNNEL_TEMPLATES.find(t => t.id === templateId);
  if (!template) return { error: "Template not found" };

  try {
    // 3. TRANSACTION: Wipe existing steps & Create new ones
    await prisma.$transaction(async (tx) => {
      // A. Delete existing steps
      await tx.funnelStep.deleteMany({
        where: { funnelId }
      });

      // B. Create new steps from template (FIXED: Uses initialSteps property)
      for (let i = 0; i < template.initialSteps.length; i++) {
        const step = template.initialSteps[i];
        
        // Generate new IDs for all blocks to avoid collisions
        const freshContent = step.content.map((block: any) => ({
          ...block,
          id: crypto.randomUUID()
        }));

        await tx.funnelStep.create({
          data: {
            funnelId,
            name: step.name,
            slug: step.slug,
            type: step.type,
            order: i,
            content: freshContent // Save the block data
          }
        });
      }
    });

    // 4. Return new data
    revalidatePath(`/editor/${funnelId}`);
    
    // Fetch the new steps to update Client State
    const newSteps = await prisma.funnelStep.findMany({
      where: { funnelId },
      orderBy: { order: 'asc' }
    });

    return { success: true, steps: newSteps };

  } catch (error) {
    console.error("Template Apply Error:", error);
    return { error: "Failed to apply template" };
  }
}

// --- STANDARD ACTIONS (Preserved) ---

export async function saveStepContent(stepId: string, content: any) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const step = await prisma.funnelStep.findUnique({ where: { id: stepId }, include: { funnel: true } });
  if (!step || step.funnel.userId !== session.user.id) return { error: "Unauthorized" };

  await prisma.funnelStep.update({ where: { id: stepId }, data: { content } });
  revalidatePath(`/editor/${step.funnelId}`);
  return { success: true };
}

export async function createFunnelStep(funnelId: string, name: string, type: string = "page") {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const lastStep = await prisma.funnelStep.findFirst({ where: { funnelId }, orderBy: { order: 'desc' } });
  const newOrder = (lastStep?.order ?? -1) + 1;
  let slug = name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  if (newOrder === 0) slug = ""; 

  const step = await prisma.funnelStep.create({
    data: { funnelId, name, slug, type, order: newOrder, content: [] }
  });

  revalidatePath(`/editor/${funnelId}`);
  return { success: true, step };
}

export async function deleteFunnelStep(stepId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };
  await prisma.funnelStep.delete({ where: { id: stepId } });
  return { success: true };
}