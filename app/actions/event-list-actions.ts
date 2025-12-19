"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getEventsForSelector() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  const events = await prisma.event.findMany({
    where: { funnel: { user: { email: session.user.email } } },
    select: { id: true, title: true, startAt: true }
  });

  return events;
}