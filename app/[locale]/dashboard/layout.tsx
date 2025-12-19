import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0F172A] overflow-hidden">
      
      {/* DESKTOP SIDEBAR (Fixed Left, Hidden on Mobile) */}
      <aside className="hidden md:flex w-64 h-full fixed left-0 top-0 border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F172A] z-50">
        <Sidebar user={session.user} />
      </aside>

      {/* MAIN CONTENT AREA (Pushed Right on Desktop) */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64 transition-all duration-300 h-full">
        
        {/* HEADER (Sticky Top) */}
        <Header user={session.user} />

        {/* SCROLLABLE PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-0">
          {children}
        </main>
      </div>
    </div>
  );
}