// syncra-app/app/api/auth/line/login/route.ts

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { LINE_OAUTH_URL } from "@/lib/line";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const funnelId = searchParams.get('funnelId');

  if (!funnelId) return NextResponse.json({ error: "Missing funnelId" }, { status: 400 });

  // 1. Find the Merchant's Channel ID via the Funnel
  const funnel = await prisma.funnel.findUnique({
    where: { id: funnelId },
    include: { user: true }
  });

  if (!funnel || !funnel.user.lineChannelId) {
    return NextResponse.json({ error: "LINE not configured for this funnel owner." }, { status: 400 });
  }

  // 2. Construct OAuth URL
  const channelId = funnel.user.lineChannelId;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/line/callback`;
  const state = funnelId; // Pass funnelId as state to know where to go back
  const scope = "profile openid"; // 'email' requires special permission application to LINE

  const url = `${LINE_OAUTH_URL}?response_type=code&client_id=${channelId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}`;

  return NextResponse.redirect(url);
}