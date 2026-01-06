"use client";

import { useEffect, useMemo, useState } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { ExpenseTrend } from "@/components/dashboard/ExpenseTrend";
import { TopExpenses } from "@/components/dashboard/TopExpenses";
import { Recommendations } from "@/components/dashboard/Recommendations";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  bank: string;
}

type Plan = {
  id: string;
  name: string;
  type: "limit" | "goal";
  amount: number;
  category?: string;
};

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("money-planner-plans");
    if (stored) {
      try {
        setPlans(JSON.parse(stored));
      } catch {
        setPlans([]);
      }
    }
  }, []);

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

  const localInsights = useMemo(() => {
    if (transactions.length === 0) {
      return ["Загрузите выписку, чтобы получить персональный анализ."];
    }
    const categoryTotals = transactions.reduce((acc, t) => {
      if (t.amount < 0) {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      }
      return acc;
    }, {} as Record<string, number>);
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0];
    const insights = [
      `Самая затратная категория: ${topCategory || "нет данных"}.`,
    ];
    if (difference < 0) {
      insights.push("Расходы превышают доходы. Нужна коррекция бюджета.");
    }
    if (income === 0) {
      insights.push("Доходы не зафиксированы, возможно не загружены все выписки.");
    }
    return insights;
  }, [transactions, difference, income]);

  const handleGeminiAnalysis = async () => {
    setAnalysis(null);
    setAnalysisError(null);
    setAnalysisLoading(true);
    try {
      const response = await fetch("/api/analysis/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: transactions.slice(0, 200) }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Ошибка Gemini анализа");
      }
      setAnalysis(data.report);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Ошибка анализа");
    } finally {
      setAnalysisLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-300">
        Загрузка...
      </div>
    );
  }

  return (
    <AppShell title="Overview" subtitle="Главный обзор финансов и планов">
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="space-y-6">
          <StatsCards
            totalBalance={totalBalance}
            income={income}
            expenses={expenses}
            difference={difference}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <CategoryChart data={categoryChartData} />
            <ExpenseTrend data={trendData} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <TopExpenses expenses={topExpenses} />
            <Recommendations recommendations={recommendations} />
          </div>

          <div className="panel rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-slate-100">Recent Transactions</h3>
            <div className="mt-4 space-y-3">
              {transactions.slice(0, 6).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800/70 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-100">{t.description}</p>
                    <p className="text-xs text-slate-400">
                      {t.date} · {t.category} · {t.bank}
                    </p>
                  </div>
                  <div className={t.amount >= 0 ? "text-emerald-300" : "text-rose-300"}>
                    {t.amount >= 0 ? "+" : "-"}
                    {Math.abs(t.amount).toFixed(2)} ₽
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-sm text-slate-400">Пока нет транзакций.</p>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="panel rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">Plans & Goals</h3>
              <span className="text-xs text-slate-400">Local</span>
            </div>
            <div className="mt-4 space-y-3">
              {plans.slice(0, 4).map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-xl border border-slate-800/70 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-100">{plan.name}</p>
                    <span className="text-xs text-slate-400">
                      {plan.type === "limit" ? "Limit" : "Goal"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    {plan.category ? `Категория: ${plan.category}` : "Общая цель"}
                  </p>
                  <p className="mt-1 text-sm text-emerald-300">
                    {plan.amount.toFixed(0)} ₽
                  </p>
                </div>
              ))}
              {plans.length === 0 && (
                <p className="text-sm text-slate-400">
                  Добавьте лимиты и цели на странице Plans.
                </p>
              )}
            </div>
          </div>

          <div className="panel rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">Gemini Insights</h3>
              <Button size="sm" onClick={handleGeminiAnalysis} disabled={analysisLoading}>
                <Sparkles className="mr-2 h-4 w-4" />
                {analysisLoading ? "Анализ..." : "Запустить"}
              </Button>
            </div>
            {analysisError && (
              <p className="text-sm text-rose-300">{analysisError}</p>
            )}
            {analysis ? (
              <div className="space-y-3 text-sm text-slate-200">
                {analysis.summary && <p>{analysis.summary}</p>}
                {analysis.insights && (
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.insights.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
                {analysis.recommendations && (
                  <div>
                    <p className="font-medium">Рекомендации</p>
                    <ul className="list-disc list-inside space-y-1">
                      {analysis.recommendations.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 text-sm text-slate-400">
                {localInsights.map((item, idx) => (
                  <p key={idx}>{item}</p>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
