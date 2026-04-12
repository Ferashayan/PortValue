import { StatsCards } from "@/components/dashboard/StatsCards";

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-10">
      {/* Hero Header */}
      <header className="relative space-y-2 mb-12 border-l-2 border-tertiary pl-6">
        <h1 className="text-5xl font-extrabold tracking-tighter text-on-surface">
          Agent <span className="text-transparent bg-clip-text bg-gradient-to-r from-tertiary to-white">Dashboard</span>
        </h1>
        <p className="text-on-surface-variant font-label text-[10px] tracking-widest uppercase opacity-70">Neural Link Active - v2.4.0</p>
      </header>

      {/* Bottom Stats */}
      <StatsCards />
    </div>
  );
}