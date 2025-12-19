"use server";

import { prisma } from "@/lib/prisma";
import { cookies, headers } from 'next/headers'; 
import Stripe from "stripe";
import { sendLineMessage } from "@/lib/line"; 
import { getSystemSettings } from "@/app/actions/admin-actions";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any, 
});

// --- HELPER: Get Affiliate ID ---
async function getAffiliateId() {
  const cookieStore = cookies();
  const affiliateCode = cookieStore.get('syncra_affiliate')?.value;
  if (!affiliateCode) return null;
  const affiliate = await prisma.affiliate.findUnique({ where: { code: affiliateCode } });
  return affiliate ? affiliate.id : null;
}

// ==============================================================================
// 🚦 THE TRAFFIC CONTROLLER (Universal Checkout)
// ==============================================================================

interface CheckoutParams {
  funnelId: string;
  contactId?: string; 
  items: {
    name: string;
    price: number; 
    quantity: number;
    image?: string;
  }[];
  provider?: string; // 'stripe' | 'univapay' | 'aquagates' | 'manual'
  email?: string;    // Required for Manual/Bank Transfer
  name?: string;     // Required for Manual/Bank Transfer
}

export async function createCheckoutSession(params: CheckoutParams) {
  // 1. Fetch Context
  const funnel = await prisma.funnel.findUnique({
    where: { id: params.funnelId },
    include: { user: true }
  });

  if (!funnel || !funnel.user) {
    return { error: "FUNNEL_NOT_FOUND" };
  }

  const merchant = funnel.user;
  const settings = await getSystemSettings(); // Global Admin Switches
  const affiliateId = await getAffiliateId();

  // 2. Determine Provider
  // If no provider requested, default to Stripe
  let selectedProvider = params.provider || 'stripe';

  // 3. VALIDATION GATE: Check Global Switches & Merchant Keys
  if (selectedProvider === 'stripe') {
    if (!settings?.enableStripe) return { error: 'PROVIDER_DISABLED_GLOBAL' };
    // Stripe Connect Check
    if (!merchant.stripeConnectOnboarded || !merchant.stripeAccountId) {
      return { error: 'MERCHANT_NOT_CONFIGURED', provider: 'stripe' };
    }
  } 
  else if (selectedProvider === 'univapay') {
    if (!settings?.enableUniva) return { error: 'PROVIDER_DISABLED_GLOBAL' };
    if (!merchant.univaSecret || !merchant.univaStoreId) {
      return { error: 'MERCHANT_NOT_CONFIGURED', provider: 'univapay' };
    }
  } 
  else if (selectedProvider === 'aquagates') {
    if (!settings?.enableAqua) return { error: 'PROVIDER_DISABLED_GLOBAL' };
    if (!merchant.aquaAccessToken || !merchant.aquaSiteId) {
      return { error: 'MERCHANT_NOT_CONFIGURED', provider: 'aquagates' };
    }
  }

  // 4. ROUTING: Execute Specific Logic
  try {
    const totalAmount = params.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    switch (selectedProvider) {
      case 'stripe':
        return await handleStripeCheckout(merchant, params, totalAmount, affiliateId);
      
      case 'univapay':
        return await handleUnivaCheckout(merchant, params, totalAmount, affiliateId);
      
      case 'aquagates':
        return await handleAquaCheckout(merchant, params, totalAmount, affiliateId);

      case 'manual':
        // For manual, we need email/name passed in explicitly or handled via a different flow,
        // but if called via this API, we handle it here.
        if (!params.email || !params.name) return { error: "MISSING_CUSTOMER_INFO" };
        return await createManualOrder(totalAmount, params.funnelId, params.email, params.name);
        
      default:
        return { error: 'INVALID_PROVIDER' };
    }
  } catch (err: any) {
    console.error("Payment Init Error:", err);
    return { error: 'PAYMENT_INIT_FAILED', details: err.message };
  }
}

// ==============================================================================
// 💳 STRIPE HANDLER (Connect) -- UPDATED
// ==============================================================================
async function handleStripeCheckout(merchant: any, params: CheckoutParams, amount: number, affiliateId: string | null) {
  const origin = headers().get("origin") || "https://app.syncra.jp";
  
  // 1. Create Pending Order FIRST (Database Record)
  // This ensures we have an ID to attach to the webhook
  const order = await prisma.order.create({
    data: {
      amount,
      currency: 'jpy',
      status: 'pending', // Waiting for payment
      funnelId: params.funnelId,
      contactId: params.contactId,
      affiliateId: affiliateId,
      provider: 'stripe',
      paymentMethod: 'card'
    }
  });

  // Application Fee (SaaS Revenue): e.g., 2%
  const appFee = Math.floor(amount * 0.02); 

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: params.items.map(item => ({
      price_data: {
        currency: 'jpy',
        product_data: { name: item.name, images: item.image ? [item.image] : [] },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    })),
    // STRIPE CONNECT: Send money to merchant, keep fee for platform
    payment_intent_data: {
      application_fee_amount: appFee,
      transfer_data: {
        destination: merchant.stripeAccountId, 
      },
      // IMPORTANT: Pass Order ID to Webhook
      metadata: {
        orderId: order.id,
        funnelId: params.funnelId
      }
    },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel`,
    // Also add metadata to the Session object for redundancy
    metadata: {
      orderId: order.id,
      funnelId: params.funnelId,
      contactId: params.contactId || '',
      affiliateId: affiliateId || '',
      provider: 'stripe'
    }
  });

  // Save the Stripe Session ID to the Order
  await prisma.order.update({
    where: { id: order.id },
    data: { transactionId: session.id }
  });

  return { url: session.url };
}

// ==============================================================================
// 🟣 UNIVAPAY HANDLER
// ==============================================================================
async function handleUnivaCheckout(merchant: any, params: CheckoutParams, amount: number, affiliateId: string | null) {
  // 1. Create Pending Order in DB
  const order = await prisma.order.create({
    data: {
      amount,
      currency: 'jpy',
      status: 'pending',
      funnelId: params.funnelId,
      contactId: params.contactId,
      affiliateId,
      provider: 'univapay', 
      paymentMethod: 'card'
    }
  });

  // 2. Real Implementation: Call UnivaPay API
  // For MVP: Mock Redirect
  const redirectUrl = `https://app.syncra.jp/payment/mock?provider=univapay&orderId=${order.id}&amount=${amount}&storeId=${merchant.univaStoreId}`;
  
  return { url: redirectUrl };
}

// ==============================================================================
// 🔵 AQUAGATES HANDLER
// ==============================================================================
async function handleAquaCheckout(merchant: any, params: CheckoutParams, amount: number, affiliateId: string | null) {
  // 1. Create Pending Order
  const order = await prisma.order.create({
    data: {
      amount,
      currency: 'jpy',
      status: 'pending',
      funnelId: params.funnelId,
      contactId: params.contactId,
      affiliateId,
      provider: 'aquagates',
      paymentMethod: 'card'
    }
  });

  // 2. Real Implementation: Call AquaGates API or Form Post
  // For MVP: Mock Redirect
  const redirectUrl = `https://app.syncra.jp/payment/mock?provider=aquagates&orderId=${order.id}&amount=${amount}&siteId=${merchant.aquaSiteId}`;

  return { url: redirectUrl };
}

// ==============================================================================
// 🏦 MANUAL / BANK TRANSFER HANDLER
// ==============================================================================
export async function createManualOrder(amount: number, funnelId: string, email: string, name: string) {
  try {
    const affiliateId = await getAffiliateId();

    const funnel = await prisma.funnel.findUnique({ 
      where: { id: funnelId },
      include: { user: true } 
    });
    
    if (!funnel) return { error: "Funnel not found" };

    // Find or Create Contact
    let contact = await prisma.contact.findFirst({
      where: { email, userId: funnel.userId }
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: { email, name, userId: funnel.userId, funnelId, affiliateId }
      });
    }

    // Create Order
    await prisma.order.create({
      data: {
        amount,
        currency: 'jpy',
        status: 'pending', 
        funnelId,
        contactId: contact.id,
        affiliateId,
        paymentMethod: 'manual',
        provider: 'manual'
      }
    });

    // SEND LINE MESSAGE
    if (funnel.user.lineAccessToken && contact.lineUserId) {
      try {
        const message = `ご注文ありがとうございます！🏦\n\n銀行振込の受付が完了しました。\n金額: ¥${amount.toLocaleString()}\n\n振込先情報は購入画面、または確認メールをご確認ください。`;
        await sendLineMessage(funnel.user.lineAccessToken, contact.lineUserId, message);
      } catch (lineError) {
        console.error("❌ Failed to send LINE message:", lineError);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Manual Order Error:", error);
    return { error: "Failed to record order" };
  }
}