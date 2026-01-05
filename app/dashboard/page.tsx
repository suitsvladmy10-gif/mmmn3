"use client";

import { useEffect, useState } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { ExpenseTrend } from "@/components/dashboard/ExpenseTrend";
import { TopExpenses } from "@/components/dashboard/TopExpenses";
import { Recommendations } from "@/components/dashboard/Recommendations";
import { Navbar } from "@/components/layout/Navbar";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  bank: string;
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/transactions?limit=1000");
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Ошибка загрузки транзакций:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Загрузка...</div>
      </div>
    );
  }

  // Вычисляем статистику
  const totalBalance = transactions.reduce(
    (sum, t) => sum + (t.amount > 0 ? t.amount : 0),
    0
  );
  const income = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const difference = income + expenses; // expenses уже отрицательные

  // Данные для графика категорий
  const categoryData = transactions.reduce((acc, t) => {
    if (!acc[t.category]) {
      acc[t.category] = 0;
    }
    acc[t.category] += t.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData).map(
    ([category, amount]) => ({
      category,
      amount,
    })
  );

  // Данные для тренда
  const trendData = transactions.map((t) => ({
    date: t.date,
    amount: t.amount,
  }));

  // Топ-3 трат
  const topExpenses = transactions
    .filter((t) => t.amount < 0)
    .sort((a, b) => a.amount - b.amount) // Самые большие расходы (наиболее отрицательные)
    .slice(0, 3)
    .map((t) => ({
      description: t.description,
      amount: t.amount,
      category: t.category,
    }));

  // Генерируем рекомендации
  const recommendations: string[] = [];
  const currentMonthExpenses = transactions
    .filter(
      (t) =>
        t.amount < 0 &&
        new Date(t.date).getMonth() === new Date().getMonth()
    )
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const lastMonthExpenses = transactions
    .filter(
      (t) =>
        t.amount < 0 &&
        new Date(t.date).getMonth() === new Date().getMonth() - 1
    )
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  if (lastMonthExpenses > 0) {
    const changePercent =
      ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
    if (changePercent > 20) {
      recommendations.push(
        `Вы потратили на ${changePercent.toFixed(0)}% больше, чем в прошлом месяце`
      );
    }
  }

  // Рекомендации по категориям
  const foodExpenses = transactions
    .filter((t) => t.category === "Еда" && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalExpenses = Math.abs(expenses);
  if (totalExpenses > 0 && foodExpenses / totalExpenses > 0.4) {
    recommendations.push(
      "Вы тратите более 40% бюджета на еду. Рассмотрите возможность экономии."
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Дашборд
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Обзор ваших финансов</p>
        </div>

        <StatsCards
          totalBalance={totalBalance}
          income={income}
          expenses={expenses}
          difference={difference}
        />

        <div className="grid gap-6 md:grid-cols-2 mt-8">
          <CategoryChart data={categoryChartData} />
          <ExpenseTrend data={trendData} />
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-8">
          <TopExpenses expenses={topExpenses} />
          <Recommendations recommendations={recommendations} />
        </div>
      </div>
    </div>
  );
}
