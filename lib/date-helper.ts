import { start } from "repl";

export const FALLBACK_PERIODS: Record<string, string> = {
  all_time: 'All Time',
  today: 'Today',
  yesterday: 'Yesterday',
  this_week: 'This Week (Mon - Today)',
  last_7d: 'Last 7 Days',
  last_week: 'Last Week (Mon - Sun)',
  last_28d: 'Last 28 Days',
  last_30d: 'Last 30 Days',
  this_month: 'This Month',
  last_month: 'Last Month',
  last_90d: 'Last 90 Days',
  quarter_to_date: 'Quarter to Date',
  this_year: 'This Year (Jan - Today)',
  last_year: 'Last Year'
};

export const getRange = (key: string) => {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  const setStartOfDay = (d: Date) => d.setHours(0, 0, 0, 0);
  const setEndOfDay = (d: Date) => d.setHours(23, 59, 59, 999);

  setStartOfDay(start);
  setEndOfDay(end);

  const getMonday = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  switch (key) {
    case 'all_time': start.setFullYear(2025, 0, 1); break;
    case 'today': break;
    case 'yesterday':
      start.setDate(now.getDate() - 1);
      end.setDate(now.getDate() - 1);
      break;
    case 'this_week':
      const currentMon = getMonday(new Date()); 
      start.setTime(currentMon.getTime());
      break;
    case 'last_7d':
      start.setDate(now.getDate() - 7);
      end.setDate(now.getDate() - 1);
      break;
    case 'last_week':
      const thisMon = getMonday(new Date());
      start.setTime(thisMon.getTime());
      start.setDate(start.getDate() - 7);
      end.setTime(thisMon.getTime());
      end.setDate(end.getDate() - 1);
      break;
    case 'last_28d':
      start.setDate(now.getDate() - 28);
      end.setDate(now.getDate() - 1);
      break;
    case 'last_30d':
      start.setDate(now.getDate() - 30);
      end.setDate(now.getDate() - 1);
      break;
    case 'this_month':
      start.setDate(1);
      break;
    case 'last_month':
      start.setMonth(now.getMonth() - 1);
      start.setDate(1);
      end.setDate(0); 
      break;
    case 'last_90d':
      start.setDate(now.getDate() - 90);
      end.setDate(now.getDate() - 1);
      break;
    case 'quarter_to_date':
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
      start.setMonth(quarterMonth, 1);
      break;
    case 'this_year': 
      start.setMonth(0, 1);
      break;
    case 'last_year': 
      start.setFullYear(now.getFullYear() - 1, 0, 1);
      end.setFullYear(now.getFullYear() - 1, 11, 31);
      break;
  }
  return { start, end };
};