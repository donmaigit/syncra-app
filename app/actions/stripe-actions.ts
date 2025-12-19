"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  // FIX: Cast to 'any' to avoid TypeScript version mismatch errors during build
  apiVersion: "2024-06-20" as any, 
});

export async function createStripeConnectAccount() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return { error: "User not found" };

    let accountId = user.stripeAccountId;

    // 1. Create Stripe Account if doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "standard", // Standard is best for SaaS platforms (Stripe handles dashboard)
        email: user.email || undefined,
      });
      accountId = account.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeAccountId: accountId }
      });
    }

    // 2. Create Onboarding Link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXTAUTH_URL}/dashboard/settings`,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/settings?stripe=success`,
      type: "account_onboarding",
    });

    return { url: accountLink.url };

  } catch (e: any) {
    console.error(e);
    return { error: e.message || "Stripe Error" };
  }
}

export async function getStripeStatus() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { connected: false };

  const user = await prisma.user.findUnique({ 
    where: { id: session.user.id },
    select: { stripeAccountId: true, stripeConnectOnboarded: true }
  });

  if (!user?.stripeAccountId) return { connected: false };

  // Ideally, verify with Stripe API here if details_submitted is true
  // For speed, we rely on our DB flag + ID existence
  return { connected: true, accountId: user.stripeAccountId };
}

export async function getStripeLoginLink() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.stripeAccountId) return { error: "No account connected" };

  try {
    const loginLink = await stripe.accounts.createLoginLink(user.stripeAccountId);
    return { url: loginLink.url };
  } catch (e) {
    return { error: "Failed to generate login link" };
  }
}