"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// Helper to categorize traffic
function getSourceType(referrer: string | null): string {
  if (!referrer) return "Direct";
  const url = referrer.toLowerCase();
  if (url.includes("google") || url.includes("bing") || url.includes("yahoo")) return "Organic Search";
  if (url.includes("facebook") || url.includes("twitter") || url.includes("instagram") || url.includes("t.co") || url.includes("linkedin")) return "Social";
  if (url.includes("youtube")) return "Video";
  return "Referral";
}

// Helper to detect device (simplified)
function getDeviceType(ua: string): string {
  if (/mobile/i.test(ua)) return "Mobile";
  if (/tablet|ipad/i.test(ua)) return "Tablet";
  return "Desktop";
}

export async function trackPageView({
  funnelId,
  funnelStepId,
  referrer // Passed from client because server referrer can be tricky with Next.js navigation
}: {
  funnelId: string;
  funnelStepId?: string;
  referrer?: string;
}) {
  const headersList = headers();
  const userAgent = headersList.get("user-agent") || "Unknown";
  const ip = headersList.get("x-forwarded-for") || "127.0.0.1";
  
  // Create a privacy-friendly hash for Visitor ID (IP + UA + Date)
  // In a real production app, use a proper library or cookie-based ID.
  // This is a "good enough" stateless fingerprint for v1.
  const today = new Date().toISOString().split('T')[0];
  const rawFingerprint = `${ip}-${userAgent}-${today}`; 
  const visitorId = Buffer.from(rawFingerprint).toString('base64'); // Simple hash

  // Session ID could be the same as visitor ID for daily unique calculation
  const sessionId = visitorId; 

  const sourceType = getSourceType(referrer || null);
  const deviceType = getDeviceType(userAgent);

  try {
    await prisma.pageView.create({
      data: {
        funnelId,
        funnelStepId,
        visitorId,
        sessionId,
        userAgent,
        referrer: referrer || null,
        sourceType,
        deviceType
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Tracking Failed:", error);
    // Fail silently so we don't break the user experience
    return { success: false };
  }
}