"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface ExpenseTrendProps {
  data: { date: string; amount: number }[];
}

export function ExpenseTrend({ data }: ExpenseTrendProps) {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  // Фильтруем и группируем данные по периоду
  const filteredData = data
    .filter((item) => item.amount < 0) // Только расходы
    .map((item) => ({
      date: item.date,
      amount: Math.abs(item.amount),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Группируем по дням
  const groupedData = filteredData.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += item.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(groupedData)
    .map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
      }),
      amount,
    }))
    .slice(-30); // Последние 30 дней

  if (chartData.length === 0) {
    return (
      <Card className="panel rounded-2xl">
        <CardHeader>
          <CardTitle>Тренд расходов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Нет данных для отображения
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="panel rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold text-slate-100">Тренд расходов</CardTitle>
        <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
          <SelectTrigger className="w-[120px] panel-muted">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Неделя</SelectItem>
            <SelectItem value="month">Месяц</SelectItem>
            <SelectItem value="year">Год</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis
              stroke="#64748b"
              tickFormatter={(value) =>
                new Intl.NumberFormat("ru-RU", {
                  notation: "compact",
                  style: "currency",
                  currency: "RUB",
                }).format(value)
              }
            />
            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat("ru-RU", {
                  style: "currency",
                  currency: "RUB",
                }).format(value)
              }
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(51, 65, 85, 0.6)",
                borderRadius: "8px",
                color: "#e2e8f0",
              }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#22d3ee"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
