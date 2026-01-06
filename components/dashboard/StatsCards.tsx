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
      <Card className="panel rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-widest text-slate-400">Общий баланс</CardTitle>
          <div className="p-2 rounded-lg bg-emerald-500/15">
            <Wallet className="h-5 w-5 text-emerald-300" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold text-slate-100">
            {formatCurrency(totalBalance)}
          </div>
        </CardContent>
      </Card>
      
      <Card className="panel rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-widest text-slate-400">Доходы</CardTitle>
          <div className="p-2 rounded-lg bg-emerald-500/15">
            <TrendingUp className="h-5 w-5 text-emerald-300" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold text-emerald-300">
            {formatCurrency(income)}
          </div>
        </CardContent>
      </Card>
      
      <Card className="panel rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-widest text-slate-400">Расходы</CardTitle>
          <div className="p-2 rounded-lg bg-rose-500/15">
            <TrendingDown className="h-5 w-5 text-rose-300" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold text-rose-300">
            {formatCurrency(Math.abs(expenses))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="panel rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-widest text-slate-400">Разница</CardTitle>
          <div className={`p-2 rounded-lg ${difference >= 0 ? "bg-emerald-500/15" : "bg-rose-500/15"}`}>
            <DollarSign className={`h-5 w-5 ${difference >= 0 ? "text-emerald-300" : "text-rose-300"}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`text-3xl font-semibold ${
              difference >= 0 ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {formatCurrency(difference)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
