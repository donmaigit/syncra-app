"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getDashboardStats(startDate?: Date, endDate?: Date, funnelId?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { funnels: true }
  });

  if (!user) throw new Error("User not found");

  // --- 1. RESOLVE DATE FILTERS ---
  const currentFilter: any = {};
  const previousFilter: any = {};
  
  let start = startDate || new Date(new Date().setDate(new Date().getDate() - 30));
  let end = endDate || new Date();
  
  if (endDate) {
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
  }

  if (startDate && endDate) {
    const duration = end.getTime() - startDate.getTime();
    const prevStart = new Date(startDate.getTime() - duration);
    const prevEnd = new Date(startDate.getTime());
    
    currentFilter.createdAt = { gte: startDate, lte: end };
    previousFilter.createdAt = { gte: prevStart, lte: prevEnd };
  } else {
    currentFilter.createdAt = { gte: start };
    const prevStart = new Date(new Date().setDate(new Date().getDate() - 60));
    previousFilter.createdAt = { gte: prevStart, lte: start };
  }

  // --- 2. APPLY FUNNEL FILTER ---
  // If funnelId is "all" or undefined, we fetch for all user's funnels.
  // Otherwise, we constrain the query to that specific funnel.
  const funnelFilter = funnelId && funnelId !== 'all' ? { funnelId } : { funnel: { userId: user.id } };
  
  // Combine date and funnel filters
  const currentWhere = { ...funnelFilter, ...currentFilter };
  const prevWhere = { ...funnelFilter, ...previousFilter };

  // --- 3. FETCH DATA ---
  const [
    currentOrders, 
    prevOrders, 
    currentContacts, 
    totalContactsCount,
    trafficStats,
    totalPageViews,
    // Asset Counts (For Row 3)
    funnelStats,
    eventStats,
    calendarStats,
    affiliateStats,
    // Customer Count (Unique emails in orders)
    uniqueCustomers
  ] = await Promise.all([
    // Revenue & Orders
    prisma.order.findMany({
      where: { ...currentWhere, status: 'succeeded' },
      select: { amount: true, createdAt: true, contact: { select: { email: true } } }
    }),
    prisma.order.aggregate({
      where: { ...prevWhere, status: 'succeeded' },
      _sum: { amount: true }
    }),
    // Leads List
    prisma.contact.findMany({
      where: currentWhere,
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { funnel: { select: { name: true } } }
    }),
    // Total Leads Count
    prisma.contact.count({ where: currentWhere }),
    // Traffic Sources
    prisma.pageView.groupBy({
      by: ['sourceType'],
      where: currentWhere,
      _count: { sourceType: true }
    }),
    // Total Page Views
    prisma.pageView.count({ where: currentWhere }),
    
    // ASSETS (Snapshot counts, usually not filtered by date, but strictly by funnel if selected)
    prisma.funnel.groupBy({ by: ['published'], where: funnelId && funnelId !== 'all' ? { id: funnelId } : { userId: user.id }, _count: true }),
    prisma.event.count({ where: funnelId && funnelId !== 'all' ? { funnelId } : { funnel: { userId: user.id } } }),
    prisma.meetingType.count({ where: funnelId && funnelId !== 'all' ? { /* meetings usually global per user */ userId: user.id } : { userId: user.id } }),
    prisma.affiliate.count({ where: { userId: user.id } }), // Affiliates are global per user usually
    
    // Unique Customers
    prisma.order.groupBy({
      by: ['contactId'],
      where: { ...currentWhere, status: 'succeeded' },
      _count: true
    })
  ]);

  // --- 4. CALCULATE METRICS ---
  
  const totalRevenue = currentOrders.reduce((sum, o) => sum + o.amount, 0);
  const totalSalesCount = currentOrders.length;
  const totalCustomers = uniqueCustomers.length;
  const prevRevenue = prevOrders._sum.amount || 0;
  
  // Trend
  let trend = 0;
  if (prevRevenue > 0) trend = ((totalRevenue - prevRevenue) / prevRevenue) * 100;
  else if (totalRevenue > 0) trend = 100;

  // Conversion Rate (Orders / Views) - More standard than Leads
  // You can swap to (Orders / Leads) if you prefer.
  const conversionRate = totalPageViews > 0 
    ? ((totalSalesCount / totalPageViews) * 100).toFixed(2) 
    : "0.0";

  // AOV (Average Order Value)
  const aov = totalSalesCount > 0 ? Math.round(totalRevenue / totalSalesCount) : 0;

  // EPC (Earnings Per Click/View)
  const epc = totalPageViews > 0 ? Math.round(totalRevenue / totalPageViews) : 0;

  // Funnel Counts (Live vs Draft)
  let liveFunnels = 0;
  let draftFunnels = 0;
  funnelStats.forEach(g => { if(g.published) liveFunnels += g._count; else draftFunnels += g._count; });

  // Charts
  const chartMap = new Map<string, {sales: number, orders: number}>();
  currentOrders.forEach(order => {
    const date = order.createdAt.toISOString().split('T')[0];
    const prev = chartMap.get(date) || { sales: 0, orders: 0 };
    chartMap.set(date, { sales: prev.sales + order.amount, orders: prev.orders + 1 });
  });
  
  const chartData = Array.from(chartMap.entries())
    .map(([date, data]) => ({ date, value: data.sales, orders: data.orders }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const trafficData = trafficStats.map(s => ({ name: s.sourceType || 'Direct', value: s._count.sourceType }));
  if (trafficData.length === 0) trafficData.push({ name: 'No Data', value: 0 });

  const funnelChartData = [
    { name: 'Views', value: totalPageViews, fill: '#8884d8' },
    { name: 'Leads', value: totalContactsCount, fill: '#82ca9d' },
    { name: 'Orders', value: totalSalesCount, fill: '#ffc658' },
  ];

  // Recent Sales List
  const recentSales = await prisma.order.findMany({
    where: { ...currentWhere, status: 'succeeded' },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { funnel: { select: { name: true } }, contact: { select: { email: true } } }
  });

  return {
    totalRevenue,
    totalLeads: totalContactsCount,
    totalSalesCount,
    totalPageViews,
    totalCustomers,
    conversionRate,
    aov,
    epc,
    trend,
    chartData,
    recentLeads: currentContacts,
    recentSales,
    trafficData,
    funnelChartData,
    assets: {
      liveFunnels,
      draftFunnels,
      events: eventStats,
      calendars: calendarStats,
      affiliates: affiliateStats
    },
    funnelsList: user.funnels.map(f => ({ id: f.id, name: f.name })) // For dropdown
  };
}