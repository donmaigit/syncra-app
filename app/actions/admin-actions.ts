"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// --- PERMISSIONS CHECK ---
async function checkPlatformAccess() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  return {
    isAuthorized: role === 'superadmin' || role === 'admin',
    session
  };
}

// --- GLOBAL SETTINGS ---
async function getSettings() {
  let settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
  if (!settings) {
    settings = await prisma.systemSettings.create({
      data: { 
        id: "global", 
        enableStripe: process.env.ENABLE_STRIPE !== 'false', 
        enableUniva: process.env.ENABLE_UNIVAPAY === 'true', 
        enableAqua: process.env.ENABLE_AQUAGATES === 'true'
      }
    });
  }
  return settings;
}

export async function getSystemSettings() {
  const { isAuthorized } = await checkPlatformAccess();
  if (!isAuthorized) return null;
  return await getSettings();
}

export async function updateSystemSettings(data: { enableStripe: boolean, enableUniva: boolean, enableAqua: boolean }) {
  const { isAuthorized } = await checkPlatformAccess();
  if (!isAuthorized) return { error: "Unauthorized" };

  await prisma.systemSettings.upsert({
    where: { id: "global" },
    update: data,
    create: { id: "global", ...data }
  });

  revalidatePath("/dashboard/admin/platform");
  return { success: true };
}

// --- PLATFORM STATISTICS ---
export async function getPlatformStats(startInput: string = 'all', endInput?: string) {
  const { isAuthorized } = await checkPlatformAccess();
  if (!isAuthorized) return null;

  // 1. Determine Dates from Input
  let startDate = new Date('2025-01-01'); // Default to service launch
  let endDate = new Date();

  // Handle Preset Strings vs ISO Strings
  if (startInput === '30d') {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
  } else if (startInput === '90d') {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
  } else if (startInput === 'all') {
    startDate = new Date('2025-01-01');
  } else {
    // Assume valid ISO string from DatePicker
    const parsed = new Date(startInput);
    if (!isNaN(parsed.getTime())) startDate = parsed;
  }

  if (endInput) {
    const parsed = new Date(endInput);
    if (!isNaN(parsed.getTime())) endDate = parsed;
    // Set to end of day to include data from that day
    endDate.setHours(23, 59, 59, 999);
  }

  const dateFilter = {
    createdAt: { gte: startDate, lte: endDate }
  };

  // 2. Execute Queries
  const [
    totalMerchants,
    totalContacts,
    funnelStats,   // Grouped by 'published' status
    totalEvents,   // Keeping as total for now (assumes 'Event' model exists)
    totalCalendars,// Keeping as total for now (assumes 'MeetingType' model exists)
    totalAffiliates,
    activeStripeUsers
  ] = await Promise.all([
    prisma.user.count({ where: { ...dateFilter, role: 'merchant' } }),
    prisma.contact.count({ where: dateFilter }),
    
    // Funnels: Group by 'published' to separate Live vs Drafts
    prisma.funnel.groupBy({
      by: ['published'],
      where: dateFilter,
      _count: true
    }),

    prisma.event.count({ where: dateFilter }),
    prisma.meetingType.count({ where: dateFilter }),
    prisma.affiliate.count({ where: dateFilter }),
    prisma.user.count({ where: { stripeConnectOnboarded: true } })
  ]);

  // 3. Process Funnel Counts (Live vs Draft)
  let liveFunnels = 0;
  let draftFunnels = 0;
  funnelStats.forEach(group => {
    if (group.published) liveFunnels += group._count;
    else draftFunnels += group._count;
  });

  // 4. MRR (Current Snapshot - Not strictly filtered by date range usually, but can be if needed)
  const userPlans = await prisma.user.groupBy({
    by: ['plan'],
    where: { role: 'merchant' }, // Snapshot of current active merchants
    _count: { plan: true }
  });

  let mrr = 0;
  const plans = { starter: 0, pro: 0, agency: 0, free: 0 };
  userPlans.forEach(p => {
    if (p.plan === 'starter') { plans.starter = p._count.plan; mrr += (p._count.plan * 4980); }
    if (p.plan === 'pro') { plans.pro = p._count.plan; mrr += (p._count.plan * 9800); }
    if (p.plan === 'agency') { plans.agency = p._count.plan; mrr += (p._count.plan * 29800); }
    if (p.plan === 'free') plans.free = p._count.plan;
  });

  // 5. GMV (Total Sales in Period)
  const gmvResult = await prisma.order.aggregate({
    where: { status: 'succeeded', createdAt: { gte: startDate, lte: endDate } },
    _sum: { amount: true }
  });
  const totalGmv = gmvResult._sum.amount || 0;

  // 6. GRAPH DATA GENERATION
  const orders = await prisma.order.findMany({
    where: { status: 'succeeded', createdAt: { gte: startDate, lte: endDate } },
    select: { createdAt: true, amount: true }
  });

  const graphMap = new Map<string, number>();
  
  // Create empty buckets for every day in range
  const loopStart = new Date(startDate);
  // Safety cap: don't loop more than 365 days to prevent crashes on huge ranges
  const maxDays = 365;
  let dayCount = 0;

  for (let d = new Date(loopStart); d <= endDate && dayCount < maxDays; d.setDate(d.getDate() + 1)) {
    graphMap.set(d.toISOString().split('T')[0], 0);
    dayCount++;
  }

  orders.forEach(o => {
    const dateKey = o.createdAt.toISOString().split('T')[0];
    if (graphMap.has(dateKey)) {
      graphMap.set(dateKey, (graphMap.get(dateKey) || 0) + o.amount);
    }
  });

  const graphData = Array.from(graphMap.entries()).map(([date, sales]) => ({
    name: date.slice(5).replace('-', '/'),
    sales: sales,
    revenue: Math.floor(mrr / 30) // Approximation of daily MRR baseline
  }));

  return {
    totalMerchants,
    totalContacts,
    totalFunnels: liveFunnels, // Main Metric: Live Funnels
    draftFunnels: draftFunnels, // Secondary Metric: Drafts
    totalEvents,
    totalCalendars,
    totalAffiliates,
    activeStripeUsers,
    mrr,
    totalGmv,
    plans,
    graphData
  };
}

// --- SYSTEM HEALTH ---
export async function getSystemHealth() {
  const { isAuthorized } = await checkPlatformAccess();
  // Allow dashboard to check health without superadmin rights if needed, or restrict:
  // if (!isAuthorized) return null; 

  // Simple check: Can we query the DB?
  let dbStatus = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = true;
  } catch (e) {
    dbStatus = false;
  }

  return {
    database: dbStatus,
    stripeWebhook: !!process.env.STRIPE_WEBHOOK_SECRET,
    resend: !!process.env.RESEND_API_KEY,
  };
}

// --- USER MANAGEMENT ---
export async function getAdminUsers(query: string = "") {
  const { isAuthorized } = await checkPlatformAccess();
  if (!isAuthorized) return [];

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } }
      ]
    },
    select: {
      id: true, name: true, email: true, plan: true, role: true, 
      createdAt: true, lastLogin: true, accountStatus: true, stripeConnectOnboarded: true,
      _count: { select: { funnels: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  // Serialize Dates
  return users.map(u => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    lastLogin: u.lastLogin ? u.lastLogin.toISOString() : null
  }));
}

export async function updateUserStatus(userId: string, status: string) {
  const { isAuthorized } = await checkPlatformAccess();
  if (!isAuthorized) return { error: "Unauthorized" };

  await prisma.user.update({
    where: { id: userId },
    data: { accountStatus: status }
  });

  revalidatePath('/dashboard/admin/platform');
  return { success: true };
}

// --- WAITLIST ---
export async function getWaitlistLeads() {
  const { isAuthorized } = await checkPlatformAccess();
  if (!isAuthorized) return [];
  
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
  return leads.map(l => ({
    ...l,
    createdAt: l.createdAt.toISOString()
  }));
}