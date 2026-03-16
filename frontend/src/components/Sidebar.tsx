"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HeartPulse, LayoutDashboard, ArrowUpRight, AlertTriangle, History, LogOut, Settings, Stethoscope, Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Visual Consult", href: "/dashboard/visual-consult", icon: Camera },
  { name: "AI Consultation", href: "/dashboard/doctors", icon: Stethoscope },
  { name: "Improvements", href: "/dashboard/improvements", icon: ArrowUpRight },
  { name: "Risk Assessment", href: "/dashboard/dangers", icon: AlertTriangle },
  { name: "Health History", href: "/dashboard/history", icon: History },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
  className?: string;
}

export function Sidebar({ onClose, className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className={cn("flex bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 w-64 h-full flex-col px-4 py-6", className)}>
      <div className="flex items-center justify-between px-2 mb-10">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-8 h-8 text-emerald-500" />
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            MyHealth<span className="text-emerald-500">AI</span>
          </span>
        </div>
        {onClose && (
           <button onClick={onClose} className="md:hidden p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
             <X className="w-5 h-5" />
           </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center pr-2 py-3 px-3 text-sm font-medium rounded-xl transition-colors",
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 flex-shrink-0 h-5 w-5",
                  isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-200 dark:border-slate-800 hidden sm:block">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System Status</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300">All telemetry sensors online.</p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-3 text-sm font-medium text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-red-500" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
