"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { ExpenseTrend } from "@/components/dashboard/ExpenseTrend";
import { TopExpenses } from "@/components/dashboard/TopExpenses";
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

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

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
  const difference = income + expenses;

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

  const trendData = transactions.map((t) => ({
    date: t.date,
    amount: t.amount,
  }));

  const topExpenses = transactions
    .filter((t) => t.amount < 0)
    .sort((a, b) => a.amount - b.amount)
    .slice(0, 5)
    .map((t) => ({
      description: t.description,
      amount: t.amount,
      category: t.category,
    }));

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
    <AppShell
      title="Analytics"
      subtitle="Графики, аналитика и AI-инсайты"
      actions={
        <Button size="sm" onClick={handleGeminiAnalysis} disabled={analysisLoading}>
          <Sparkles className="mr-2 h-4 w-4" />
          {analysisLoading ? "Анализ..." : "Gemini анализ"}
        </Button>
      }
    >
      <div className="space-y-6">
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
          <div className="panel rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-slate-100">Gemini Report</h3>
            {analysisError && (
              <p className="mt-3 text-sm text-rose-300">{analysisError}</p>
            )}
            {!analysis && !analysisError && (
              <p className="mt-3 text-sm text-slate-400">
                Запустите Gemini анализ, чтобы получить детальные выводы.
              </p>
            )}
            {analysis && (
              <div className="mt-3 space-y-3 text-sm text-slate-200">
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
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
