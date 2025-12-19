"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ITEMS_PER_PAGE = 20;

export async function getContacts({ 
  query = "", 
  funnelId = "all", 
  page = 1,
  startDate, // <--- ADDED
  endDate    // <--- ADDED
}: { 
  query?: string, 
  funnelId?: string, 
  page?: number,
  startDate?: string, // <--- ADDED TYPE
  endDate?: string    // <--- ADDED TYPE
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = session.user.id;
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where: any = { funnel: { userId: userId } };

  if (funnelId && funnelId !== "all") {
    where.funnelId = funnelId;
  }

  if (query) {
    where.OR = [
      { email: { contains: query, mode: 'insensitive' } },
      { name: { contains: query, mode: 'insensitive' } }
    ];
  }

  // --- DATE FILTER LOGIC ---
  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate)
    };
  }

  try {
    const [contacts, totalCount, funnels] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: ITEMS_PER_PAGE,
        skip,
        include: { funnel: { select: { id: true, name: true } } }
      }),
      prisma.contact.count({ where }),
      prisma.funnel.findMany({
        where: { userId },
        select: { id: true, name: true }
      })
    ]);

    return { 
      contacts, 
      totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
      funnels
    };

  } catch (e) {
    console.error(e);
    return { error: "Failed to fetch contacts" };
  }
}