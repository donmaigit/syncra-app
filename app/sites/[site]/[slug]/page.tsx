import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlockRenderer from "@/components/builder/BlockRenderer";
import { Metadata } from "next";
import { Block } from "@/lib/editor-config";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker"; 

// --- SEO METADATA ---
export async function generateMetadata({ params }: { params: { site: string, slug: string } }): Promise<Metadata> {
  const data = await getFunnelData(params.site, params.slug);
  if (!data) return {};
  const { funnel, step } = data;
  
  return {
    title: step?.seoTitle || funnel.metaTitle || funnel.name,
    description: step?.seoDesc || funnel.metaDesc,
    openGraph: {
      images: funnel.ogImage ? [funnel.ogImage] : [],
    },
    icons: {
      icon: funnel.favicon || "/favicon.ico",
    }
  };
}

// --- HELPER: FETCH DATA (FIXED FOR CUSTOM DOMAINS) ---
async function getFunnelData(site: string, slug: string) {
  const include = {
    steps: { orderBy: { order: 'asc' as const } },
    user: { select: { stripeAccountId: true, univaStoreId: true, aquaSiteId: true } } // Added payment keys
  };

  let funnel = null;

  // 1. Try Custom Domain First (e.g. mybrand.com)
  if (site.includes('.')) {
    funnel = await prisma.funnel.findUnique({
      where: { customDomain: site },
      include
    });
  }

  // 2. Fallback to Subdomain (e.g. user123)
  if (!funnel) {
    funnel = await prisma.funnel.findFirst({
      where: {
        user: { subdomain: site },
        published: true
      },
      include
    });
  }

  if (!funnel) return null;

  // 3. Find the specific step
  const step = funnel.steps.find(s => s.slug === slug);
  if (!step) return null;

  return { funnel, step };
}

// --- MAIN PAGE ---
export default async function FunnelStepPage({ params }: { params: { site: string, slug: string } }) {
  const data = await getFunnelData(params.site, params.slug);

  if (!data) return notFound();

  const { funnel, step } = data;

  // 3. ANALYTICS (Legacy Counter)
  try {
    await prisma.funnelStep.update({
      where: { id: step.id },
      data: { visits: { increment: 1 } }
    });
    // Only increment funnel visit if this is the first step (optional, but good for accuracy)
    // await prisma.funnel.update({ where: { id: funnel.id }, data: { visits: { increment: 1 } } });
  } catch(e) {}

  // 4. BOOKING DATA
  const events = await prisma.meetingType.findMany({
    where: { userId: funnel.userId },
    select: { id: true, title: true }
  });

  // 5. CONTENT PREP
  let blocks: Block[] = [];
  let pageBg = '#ffffff';
  let pagePadding = '20px';

  if (step.content) {
    const content = step.content as any;
    if (Array.isArray(content)) {
      blocks = content; 
    } else {
      blocks = content.blocks || [];
      pageBg = content.settings?.background || '#ffffff';
      pagePadding = content.settings?.padding || '20px';
    }
  }

  return (
    <>
      <AnalyticsTracker funnelId={funnel.id} stepId={step.id} />

      {funnel.headCode && <div dangerouslySetInnerHTML={{ __html: funnel.headCode }} className="hidden" />}

      <main 
        className="min-h-screen transition-colors duration-300"
        style={{ backgroundColor: pageBg, padding: pagePadding }}
      >
        {blocks.length > 0 ? (
          blocks.map((block) => (
            <BlockRenderer 
              key={block.id} 
              block={{ ...block, funnelId: funnel.id } as Block} 
              isPreview={false}
              availableEvents={events}
            />
          ))
        ) : (
          <div className="py-20 text-center text-slate-500">
            <p>This page is empty.</p>
          </div>
        )}
      </main>

      {funnel.footerCode && <div dangerouslySetInnerHTML={{ __html: funnel.footerCode }} className="hidden" />}
    </>
  );
}