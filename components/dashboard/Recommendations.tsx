"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, TrendingUp } from "lucide-react";

interface RecommendationsProps {
  recommendations: string[];
}

export function Recommendations({ recommendations }: RecommendationsProps) {
  if (recommendations.length === 0) {
    return (
      <Card className="panel rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Рекомендации</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            Пока нет рекомендаций. Загрузите больше транзакций для анализа.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="panel rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-xl font-semibold text-slate-100">
          <div className="p-2 rounded-lg bg-amber-500/15">
            <TrendingUp className="h-5 w-5 text-amber-300" />
          </div>
          <span>Рекомендации</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 rounded-lg border border-slate-800/70 p-3"
            >
              <AlertCircle className="h-5 w-5 text-amber-300 mt-0.5" />
              <div className="flex-1 text-sm text-slate-200">{rec}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
