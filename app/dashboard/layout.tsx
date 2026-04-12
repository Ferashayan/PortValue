import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopNav } from "@/components/dashboard/TopNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      {/* تأثيرات الخلفية */}
      <div className="neural-glow top-[-10%] left-[-10%] fixed w-[600px] h-[600px] bg-tertiary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="neural-glow bottom-[-10%] right-[-10%] fixed w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <TopNav />
      <Sidebar />
      
      <main className="lg:pl-64 pt-24 pb-12 px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}