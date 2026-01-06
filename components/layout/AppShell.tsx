"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CircleDollarSign,
  Gauge,
  LayoutGrid,
  Upload,
  Wallet,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/plans", label: "Plans", icon: Gauge },
  { href: "/transactions", label: "Transactions", icon: Wallet },
  { href: "/upload", label: "Upload", icon: Upload },
];

type AppShellProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function AppShell({ title, subtitle, actions, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <div className="grid min-h-screen grid-cols-[260px_1fr]">
        <aside className="sidebar px-5 py-6">
          <div className="flex items-center gap-3 text-lg font-semibold text-slate-100">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <LayoutGrid className="h-5 w-5" />
            </div>
            Money Planner
          </div>

          <div className="mt-8 space-y-2 text-xs uppercase tracking-[0.2em] text-slate-500">
            Navigation
          </div>
          <nav className="mt-3 space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                    active
                      ? "bg-emerald-500/20 text-emerald-200"
                      : "text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-10 space-y-3">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Quick Views
            </div>
            <div className="panel-muted rounded-xl p-3">
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <CircleDollarSign className="h-4 w-4 text-emerald-300" />
                Daily Cashflow
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Быстрый обзор ключевых метрик и расходов за день.
              </p>
            </div>
          </div>
        </aside>

        <div className="px-6 py-6">
          <header className="panel rounded-2xl px-6 py-4 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>
              {subtitle && (
                <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </header>

          {children}
        </div>
      </div>
    </div>
  );
}
