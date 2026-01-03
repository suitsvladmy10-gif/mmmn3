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
      <Card>
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
    <Card className="gradient-card border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-xl font-bold">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
            <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <span>Топ-3 трат</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenses.slice(0, 3).map((expense, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b pb-3 last:border-0"
            >
              <div className="flex-1">
                <div className="font-medium">{expense.description}</div>
                <div className="text-sm text-muted-foreground">
                  {expense.category}
                </div>
              </div>
              <div className="text-lg font-bold text-red-600">
                {formatCurrency(expense.amount)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
