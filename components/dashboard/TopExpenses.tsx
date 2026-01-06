"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";

interface TopExpensesProps {
  expenses: { description: string; amount: number; category: string }[];
}

export function TopExpenses({ expenses }: TopExpensesProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  if (expenses.length === 0) {
    return (
      <Card className="panel rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingDown className="h-5 w-5" />
            <span>Топ-3 трат</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Нет данных</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="panel rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-xl font-semibold text-slate-100">
          <div className="p-2 rounded-lg bg-rose-500/15">
            <TrendingDown className="h-5 w-5 text-rose-300" />
          </div>
          <span>Топ-3 трат</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenses.slice(0, 3).map((expense, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b border-slate-800/70 pb-3 last:border-0"
            >
              <div className="flex-1">
                <div className="font-medium text-slate-100">{expense.description}</div>
                <div className="text-sm text-slate-400">
                  {expense.category}
                </div>
              </div>
              <div className="text-lg font-semibold text-rose-300">
                {formatCurrency(expense.amount)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
