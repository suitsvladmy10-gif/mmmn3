"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface CategoryChartProps {
  data: { category: string; amount: number }[];
}

const COLORS = [
  "#22d3ee",
  "#34d399",
  "#f59e0b",
  "#f97316",
  "#60a5fa",
  "#a78bfa",
  "#f43f5e",
  "#eab308",
  "#38bdf8",
];

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = data
    .filter((item) => item.amount < 0) // Только расходы
    .map((item) => ({
      name: item.category,
      value: Math.abs(item.amount),
    }))
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) {
    return (
      <Card className="panel rounded-2xl">
        <CardHeader>
          <CardTitle>Расходы по категориям</CardTitle>
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
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-100">Расходы по категориям</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
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
            <Legend wrapperStyle={{ color: "#cbd5f5" }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
