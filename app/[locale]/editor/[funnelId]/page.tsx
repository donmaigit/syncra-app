import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { getFunnelEditorData } from "@/app/actions/builder-actions"; 
import { prisma } from "@/lib/prisma";
import EditorClient from "@/components/editor/EditorClient";

export default async function EditorPage({ params }: { params: { funnelId: string; locale: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect("/login");
  }

  // 1. FETCH FUNNEL DATA
  const data = await getFunnelEditorData(params.funnelId);

  if ('error' in data || !data.funnel) {
    return notFound();
  }

  const { funnel, subdomain } = data;

  // 2. FETCH EVENTS AND CALENDARS
  const [events, calendars] = await Promise.all([
    prisma.event.findMany({
      where: { funnel: { userId: session.user.id } },
      select: { id: true, title: true, startAt: true },
      orderBy: { startAt: 'desc' }
    }),
    prisma.meetingType.findMany({
      where: { userId: session.user.id },
      // UPDATED: Fetch createdAt so we have a real date to use
      select: { id: true, title: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  // 3. COMBINE & FORMAT FOR EDITOR
  // We use the actual creation date for calendars, which is cleaner than a dummy date.
  const availableItems = [
    ...calendars.map(c => ({ 
      id: c.id, 
      title: `📅 ${c.title} (Calendar)`,
      date: c.createdAt // Real Data
    })),
    ...events.map(e => ({ 
      id: e.id, 
      title: `🎟️ ${e.title} (Event)`,
      date: e.startAt // Real Data
    }))
  ];

  // 4. RENDER CLIENT
  return (
    <EditorClient 
      funnel={funnel} 
      userSubdomain={subdomain || ""} 
      availableEvents={availableItems}
      locale={params.locale} 
    />
  );
}