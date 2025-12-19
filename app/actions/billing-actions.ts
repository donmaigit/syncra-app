"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import { redirect } from "next/navigation";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

// CONSTANT: Your Production App URL
const APP_URL = process.env.NEXTAUTH_URL || "https://app.syncra.jp";

// Helper: Ensure user has a Stripe Customer ID
async function getOrCreateCustomer(user: any) {
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: {
      userId: user.id,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

// Action 1: Create Checkout Session (Start Subscription)
export async function createSubscriptionCheckout(priceId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  // Fetch fresh user data
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return { error: "User not found" };

  try {
    const customerId = await getOrCreateCustomer(user);

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      
      // FORCE 3-DAY FREE TRIAL
      subscription_data: {
        trial_period_days: 3,
      },
      
      success_url: `${APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${APP_URL}/dashboard/billing?canceled=true`,
      metadata: {
        userId: user.id,
      },
    });

    if (!checkoutSession.url) throw new Error("Failed to create session");
    
    // We return the URL so the client can redirect
    return { url: checkoutSession.url };
  } catch (error) {
    console.error("Stripe Error:", error);
    return { error: "Failed to initiate billing" };
  }
}

// Action 2: Create Customer Portal (Manage/Cancel Subscription)
export async function createCustomerPortal() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user?.stripeCustomerId) return { error: "No billing account found" };

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${APP_URL}/dashboard/billing`,
    });

    return { url: portalSession.url };
  } catch (error) {
    console.error("Portal Error:", error);
    return { error: "Failed to create portal session" };
  }
}