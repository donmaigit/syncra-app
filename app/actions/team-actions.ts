"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getTeamMembers() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  // Fetch invites sent by this user
  const invites = await prisma.teamInvite.findMany({
    where: { inviterId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  return invites;
}

export async function inviteTeamMember(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const email = formData.get("email") as string;
  if (!email) return { error: "Email is required" };

  try {
    // Check duplicates
    const existing = await prisma.teamInvite.findFirst({
      where: { inviterId: session.user.id, email }
    });
    if (existing) return { error: "Already invited" };

    // Create Invite
    await prisma.teamInvite.create({
      data: {
        email,
        inviterId: session.user.id,
        token: crypto.randomUUID(), // In a real app, email this token link
        status: "pending"
      }
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (e) {
    return { error: "Failed to invite" };
  }
}

export async function removeTeamMember(inviteId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.teamInvite.delete({
    where: { id: inviteId, inviterId: session.user.id }
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}