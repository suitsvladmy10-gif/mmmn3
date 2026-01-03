"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface StatsCardsProps {
  totalBalance: number;
  income: number;
  expenses: number;
  difference: number;
}

export function StatsCards({
  totalBalance,
  income,
  expenses,
  difference,
}: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="gradient-card border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Общий баланс</CardTitle>
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {formatCurrency(totalBalance)}
          </div>
        </CardContent>
      </Card>
      
      <Card className="gradient-card border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Доходы</CardTitle>
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(income)}
          </div>
        </CardContent>
      </Card>
      
      <Card className="gradient-card border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-500/10" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Расходы</CardTitle>
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
            <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(Math.abs(expenses))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="gradient-card border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${difference >= 0 ? 'from-green-500/10 to-emerald-500/10' : 'from-red-500/10 to-rose-500/10'}`} />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Разница</CardTitle>
          <div className={`p-2 rounded-lg ${difference >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            <DollarSign className={`h-5 w-5 ${difference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div
            className={`text-3xl font-bold ${
              difference >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatCurrency(difference)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
