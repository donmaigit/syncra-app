import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import BlockRenderer from "@/components/builder/BlockRenderer"; 
import { Block } from "@/lib/editor-config";

export async function generateMetadata({ params }: { params: { domain: string } }): Promise<Metadata> {
  const domain = decodeURIComponent(params.domain);
  
  const funnel = await prisma.funnel.findUnique({
    where: { customDomain: domain },
    include: { steps: { orderBy: { order: 'asc' }, take: 1 } }
  });

  if (!funnel) return { title: "Page Not Found" };

  const activeStep = funnel.steps[0];

  return {
    title: activeStep?.seoTitle || funnel.metaTitle || funnel.name,
    description: activeStep?.seoDesc || funnel.metaDesc,
    icons: funnel.favicon ? { icon: funnel.favicon } : undefined,
    openGraph: funnel.ogImage ? { images: [funnel.ogImage] } : undefined,
  };
}

export default async function CustomDomainPage({ params }: { params: { domain: string } }) {
  // 1. Decode Domain
  const domain = decodeURIComponent(params.domain);

  // 2. Fetch Funnel & First Step
  const funnel = await prisma.funnel.findUnique({
    where: { customDomain: domain },
    include: { 
      steps: { orderBy: { order: 'asc' }, take: 1 } 
    }
  });

  if (!funnel || !funnel.published) return notFound();

  // 3. Get Active Step (Home Page)
  const activeStep = funnel.steps[0];

  if (!activeStep) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        <p>This site has no pages yet.</p>
      </div>
    );
  }

  // 4. Analytics
  try {
    await prisma.funnelStep.update({
      where: { id: activeStep.id },
      data: { visits: { increment: 1 } }
    });
    await prisma.funnel.update({ where: { id: funnel.id }, data: { visits: { increment: 1 } } });
  } catch(e) {}

  // 5. Booking Data
  const events = await prisma.meetingType.findMany({
    where: { userId: funnel.userId },
    select: { id: true, title: true }
  });

  // 6. Content Prep (Updated Logic)
  let blocks: Block[] = [];
  let pageBg = '#ffffff';
  let pagePadding = '0px';

  if (activeStep.content) {
    const content = activeStep.content as any;
    if (Array.isArray(content)) {
      blocks = content;
    } else {
      blocks = content.blocks || [];
      pageBg = content.settings?.background || '#ffffff';
      pagePadding = content.settings?.padding || '0px';
    }
  }

  // 7. Render
  return (
    <main 
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: pageBg, padding: pagePadding }}
    >
      {funnel.headCode && <div dangerouslySetInnerHTML={{ __html: funnel.headCode }} className="hidden" />}

      {blocks.map((block) => (
        <BlockRenderer 
          key={block.id} 
          block={{ ...block, funnelId: funnel.id } as Block} 
          isPreview={false}
          availableEvents={events}
        />
      ))}

      {funnel.footerCode && <div dangerouslySetInnerHTML={{ __html: funnel.footerCode }} className="hidden" />}
    </main>
  );
}