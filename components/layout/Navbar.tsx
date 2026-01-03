"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Wallet, Upload, BarChart3, LogOut, Sparkles } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Дашборд", icon: BarChart3 },
    { href: "/transactions", label: "Транзакции", icon: Wallet },
    { href: "/upload", label: "Загрузить", icon: Upload },
  ];

  return (
    <nav className="glass border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              <Sparkles className="h-6 w-6 text-blue-600" />
              <span>Money Planner</span>
            </Link>
            <div className="flex space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                        : "hover:bg-white/50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center space-x-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-700 dark:text-slate-300"
          >
            <LogOut className="h-4 w-4" />
            <span>Выйти</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
