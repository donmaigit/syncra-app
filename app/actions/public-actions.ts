"use server";

import { prisma } from "@/lib/prisma";
import { Resend } from 'resend';
import { WelcomeEmail } from "@/components/emails/WelcomeEmail";
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers'; // NEW IMPORT

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitLead(formData: FormData) {
  const funnelId = formData.get("funnelId") as string;
  const email = formData.get("email") as string;
  const locale = (formData.get("locale") as string) || 'ja'; 
  
  if (!funnelId || !email) return { error: "Email is required" };

  try {
    // 1. Verify Funnel
    const funnel = await prisma.funnel.findUnique({ 
      where: { id: funnelId },
      include: { user: true } 
    });

    if (!funnel) return { error: "Funnel not found" };

    // --- NEW: CHECK AFFILIATE COOKIE ---
    const cookieStore = cookies();
    const affiliateCode = cookieStore.get('syncra_affiliate')?.value;
    let affiliateId = null;

    if (affiliateCode) {
      const affiliate = await prisma.affiliate.findUnique({ where: { code: affiliateCode } });
      if (affiliate) affiliateId = affiliate.id;
    }
    // -----------------------------------

    // 2. Create Contact with Attribution
    await prisma.contact.create({
      data: {
        email,
        funnelId,
        userId: funnel.userId,
        affiliateId: affiliateId, // NEW FIELD
        custom: {} 
      }
    });

    // 3. Analytics
    await prisma.funnelEvent.create({
      data: { type: 'opt_in', funnelId, metadata: { email } }
    });

    // 4. Send Email
    if (process.env.RESEND_API_KEY) {
      const t = await getTranslations({ locale, namespace: 'Emails' });
      await resend.emails.send({
        from: 'SYNCRA <onboarding@resend.dev>',
        to: email,
        subject: t('welcome_subject'),
        react: WelcomeEmail({ 
          email,
          texts: {
            title: t('welcome_title'),
            body1: t('welcome_body_1'),
            body2: t('welcome_body_2'),
            body3: t('welcome_body_3'),
            signoff: t('welcome_signoff')
          }
        }),
      });
    }

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: true }; 
  }
}