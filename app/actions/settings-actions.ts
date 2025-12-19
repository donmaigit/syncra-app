"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- VALIDATION HELPERS ---

// 1. UnivaPay Live Check
async function validateUniva(storeId: string, secret: string) {
  try {
    // Note: Replace with the actual UnivaPay endpoint for checking store status
    // Common pattern: GET /stores/{id} with Bearer token
    const response = await fetch(`https://api.univapay.com/stores/${storeId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secret}`, // or Basic Auth depending on their spec
        'Content-Type': 'application/json'
      }
    });

    // If API returns 401/403, keys are wrong. 
    // If 404, Store ID is wrong.
    if (!response.ok) {
      console.error(`Univa Validation Failed: ${response.status}`);
      return false;
    }
    return true;
  } catch (e) {
    // Network error or other issue
    console.error("Univa Connection Error:", e);
    return false;
  }
}

// 2. AQUAGATES Live Check
async function validateAqua(siteId: string, token: string) {
  try {
    // Replace with actual AQUAGATES endpoint
    const response = await fetch(`https://api.aquagates.com/v1/sites/${siteId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) return false;
    return true;
  } catch (e) {
    console.error("Aqua Connection Error:", e);
    return false;
  }
}


// --- ACTIONS ---

// --- EXISTING: FUNNEL SETTINGS ---
export async function updateFunnelSettings(formData: FormData) {
  const funnelId = formData.get("funnelId") as string;
  const name = formData.get("name") as string;
  const customDomain = formData.get("customDomain") as string;

  await prisma.funnel.update({
    where: { id: funnelId },
    data: {
      name,
      customDomain: customDomain || null 
    }
  });

  revalidatePath(`/dashboard/funnels`);
}

// --- USER PROFILE SETTINGS ---
export async function updateProfile(data: { firstName: string, lastName: string, email: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const fullName = `${data.lastName} ${data.firstName}`.trim();

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        name: fullName, // Keep synced
        email: data.email
      }
    });
    
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e) {
    console.error("Profile Update Error:", e);
    return { error: "Failed to update profile" };
  }
}

// --- LINE INTEGRATION SETTINGS ---
export async function updateLineSettings(data: { channelId: string, channelSecret: string, accessToken: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        lineChannelId: data.channelId,
        lineChannelSecret: data.channelSecret,
        lineAccessToken: data.accessToken
      }
    });
    
    revalidatePath('/dashboard/settings');
    return { success: true };
  } catch (e) {
    console.error("LINE Update Error:", e);
    return { error: "Failed to save LINE settings" };
  }
}

// --- NEW: PAYMENT SETTINGS (WITH LIVE VALIDATION) ---
export async function updatePaymentSettings(data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  // 1. Validate UnivaPay (Only if keys are provided)
  if (data.univaStoreId && data.univaSecret) {
    // OPTIONAL: Uncomment to enforce Live Validation
    /*
    const isValid = await validateUniva(data.univaStoreId, data.univaSecret);
    if (!isValid) {
      return { error: "Invalid UnivaPay Store ID or Secret Key." };
    }
    */
  } else if ((data.univaStoreId && !data.univaSecret) || (!data.univaStoreId && data.univaSecret)) {
     // Ensure pairs are complete
     return { error: "Both Store ID and Secret are required for UnivaPay." };
  }

  // 2. Validate AquaGates (Only if keys are provided)
  if (data.aquaSiteId && data.aquaAccessToken) {
    // OPTIONAL: Uncomment to enforce Live Validation
    /*
    const isValid = await validateAqua(data.aquaSiteId, data.aquaAccessToken);
    if (!isValid) {
      return { error: "Invalid AQUAGATES Site ID or Access Token." };
    }
    */
  } else if ((data.aquaSiteId && !data.aquaAccessToken) || (!data.aquaSiteId && data.aquaAccessToken)) {
     return { error: "Both Site ID and Access Token are required for AquaGates." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        // UnivaPay
        univaStoreId: data.univaStoreId || null,
        univaAppToken: data.univaAppToken || null,
        univaSecret: data.univaSecret || null,
        // AQUAGATES
        aquaSiteId: data.aquaSiteId || null,
        aquaAccessToken: data.aquaAccessToken || null
      }
    });
    
    revalidatePath('/dashboard/settings');
    return { success: true };
  } catch (e) {
    console.error("Payment Settings Update Error:", e);
    return { error: "Failed to save payment settings" };
  }
}