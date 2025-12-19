import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import BlockRenderer from "@/components/builder/BlockRenderer"; 
import { Block } from "@/lib/editor-config";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker"; // <--- IMPORT

// --- SEO METADATA ---
export async function generateMetadata({ params }: { params: { site: string } }): Promise<Metadata> {
  const funnel = await getHomePageFunnel(params.site);
  if (!funnel) return { title: "Page Not Found" };

  const activeStep = funnel.steps[0];

  return {
    title: activeStep?.seoTitle || funnel.metaTitle || funnel.name,
    description: activeStep?.seoDesc || funnel.metaDesc,
    icons: funnel.favicon ? { icon: funnel.favicon } : undefined,
    openGraph: funnel.ogImage ? { images: [funnel.ogImage] } : undefined,
  };
}

// --- MAIN PAGE COMPONENT ---
export default async function UserHomePage({ params }: { params: { site: string } }) {
  const funnel = await getHomePageFunnel(params.site);

  if (!funnel) return notFound();

  const activeStep = funnel.steps[0];
  
  if (!activeStep) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        <p>This funnel has no pages yet.</p>
      </div>
    );
  }

  // 1. LEGACY ANALYTICS (Simple Counter) - KEEP AS FALLBACK
  try {
    await prisma.funnelStep.update({
      where: { id: activeStep.id },
      data: { visits: { increment: 1 } }
    });
    await prisma.funnel.update({ 
      where: { id: funnel.id }, 
      data: { visits: { increment: 1 } } 
    });
  } catch(e) {}

  // 2. Fetch Booking Calendars
  const events = await prisma.meetingType.findMany({
    where: { userId: funnel.userId },
    select: { id: true, title: true }
  });

  // 3. Prepare Content
  let blocks: Block[] = [];
  let pageBg = '#ffffff';

  if (activeStep.content) {
    const content = activeStep.content as any;
    if (Array.isArray(content)) {
      blocks = content; 
    } else {
      blocks = content.blocks || [];
      pageBg = content.settings?.background || '#ffffff';
    }
  }

  return (
    <main 
      className="min-h-screen transition-colors duration-300" 
      style={{ backgroundColor: pageBg }}
    >
      {/* --- INSERT ANALYTICS TRACKER --- */}
      <AnalyticsTracker funnelId={funnel.id} stepId={activeStep.id} />

      {funnel.headCode && <div dangerouslySetInnerHTML={{ __html: funnel.headCode }} className="hidden" />}

      {blocks.length > 0 ? (
        blocks.map((block) => (
          <BlockRenderer 
            key={block.id} 
            block={{ 
              ...block, 
              funnelId: funnel.id 
            } as Block} 
            isPreview={false}
            availableEvents={events} 
          />
        ))
      ) : (
        <div className="py-20 text-center text-slate-500">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{funnel.name}</h1>
          <p>This page is currently empty.</p>
        </div>
      )}

      {funnel.footerCode && <div dangerouslySetInnerHTML={{ __html: funnel.footerCode }} className="hidden" />}
    </main>
  );
}

// --- HELPER ---
async function getHomePageFunnel(site: string) {
  const include = { 
    steps: { orderBy: { order: 'asc' as const }, take: 1 },
    user: { select: { stripeAccountId: true } } 
  };

  // 1. Custom Domain Root
  if (site.includes(".")) {
    return await prisma.funnel.findUnique({
      where: { customDomain: site },
      include
    });
  }

  // 2. User Subdomain Root
	return await prisma.funnel.findFirst({
    where: {
      user: { subdomain: site },
      published: true
    },
    orderBy: { updatedAt: 'desc' },
    include
  });
}