// syncra-app/app/api/auth/line/callback/route.ts

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getLineToken, getLineProfile, sendLineMessage } from "@/lib/line";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const funnelId = searchParams.get('state'); // We passed funnelId as state

  if (!code || !funnelId) return NextResponse.json({ error: "Invalid callback" }, { status: 400 });

  try {
    // 1. Get Merchant Credentials
    const funnel = await prisma.funnel.findUnique({
      where: { id: funnelId },
      include: { user: true }
    });

    if (!funnel || !funnel.user.lineChannelId || !funnel.user.lineChannelSecret) {
      return NextResponse.json({ error: "Configuration missing" }, { status: 400 });
    }

    const { lineChannelId, lineChannelSecret, lineAccessToken } = funnel.user;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/line/callback`;

    // 2. Exchange Code for Token
    const tokenData = await getLineToken(code, redirectUri, lineChannelId, lineChannelSecret);
    if (!tokenData.access_token) throw new Error("Failed to get access token");

    // 3. Get User Profile
    const profile = await getLineProfile(tokenData.access_token);
    const lineUserId = profile.userId;
    const displayName = profile.displayName;

    // 4. Save/Update Contact
    // Note: Since we might not have email, we use lineUserId as the unique key if email is missing.
    // Ideally, Contact schema should allow email to be optional OR we use a dummy email.
    // For now, we will create a dummy email if needed to satisfy the schema unique constraint.
    const dummyEmail = `${lineUserId}@line.user`;

    await prisma.contact.upsert({
      where: { email_funnelId: { email: dummyEmail, funnelId } },
      create: {
        email: dummyEmail,
        name: displayName,
        lineUserId: lineUserId,
        lineDisplayName: displayName,
        funnelId: funnelId,
        userId: funnel.userId,
        source: "LINE_LOGIN"
      },
      update: {
        lineUserId: lineUserId, // Link LINE ID to existing contact if matched
        lineDisplayName: displayName
      }
    });

    // 5. Send "Thank You" Message (L-Step Lite Feature)
    if (lineAccessToken) {
      const message = `ご登録ありがとうございます！\n\n${funnel.name}への参加が完了しました。\n今後こちらから情報をお届けします。`;
      await sendLineMessage(lineAccessToken, lineUserId, message);
    }

    // 6. Redirect to "Thank You" Step
    // Find the next step after the current one, or just the first thank_you page.
    // For simplicity, we redirect to a standard /thank-you slug relative to the site.
    // In a real app, you'd find the specific 'next step' URL.
    
    // Construct return URL: subdomain.syncra.page/thank-you
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = req.headers.get('host'); // This might be the app domain, not the funnel domain
    
    // Better: Redirect to the funnel's domain if possible, or a success page
    const finalRedirect = funnel.customDomain 
      ? `https://${funnel.customDomain}/thank-you`
      : `${protocol}://${funnel.user.subdomain}.syncra.page/${funnel.slug}/thank-you`; // Fallback assumption

    return NextResponse.redirect(finalRedirect);

  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}