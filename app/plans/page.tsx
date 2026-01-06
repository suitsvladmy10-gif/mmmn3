"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Plan = {
  id: string;
  name: string;
  type: "limit" | "goal";
  amount: number;
  category?: string;
};

type Transaction = {
  date: string;
  amount: number;
  category: string;
};

const categories = [
  "Доходы",
  "Еда",
  "Транспорт",
  "Развлечения",
  "Покупки",
  "Коммунальные услуги",
  "Здоровье",
  "Образование",
  "Другое",
];

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<Plan["type"]>("limit");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Еда");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("money-planner-plans");
    if (stored) {
      try {
        setPlans(JSON.parse(stored));
      } catch {
        setPlans([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("money-planner-plans", JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    fetch("/api/transactions?limit=1000")
      .then((res) => res.json())
      .then((data) => setTransactions(data.transactions || []))
      .catch((error) => console.error("Ошибка загрузки транзакций:", error));
  }, []);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = useMemo(
    () =>
      transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }),
    [transactions, currentMonth, currentYear]
  );

  const handleAddPlan = () => {
    const numericAmount = Number(amount);
    if (!name || !numericAmount) return;
    const newPlan: Plan = {
      id: crypto.randomUUID(),
      name,
      type,
      amount: numericAmount,
      category: type === "limit" ? category : undefined,
    };
    setPlans((prev) => [newPlan, ...prev]);
    setName("");
    setAmount("");
  };

  const handleRemovePlan = (id: string) => {
    setPlans((prev) => prev.filter((plan) => plan.id !== id));
  };

  const getUsedAmount = (plan: Plan) => {
    if (plan.type === "limit" && plan.category) {
      return monthlyTransactions
        .filter((t) => t.category === plan.category && t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    }

    const income = monthlyTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    return income;
  };

  const handleSuggestPlans = async () => {
    setAiError(null);
    setAiSuggestions([]);
    setAiLoading(true);
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
      const suggestions = data.report?.recommendations || [];
      setAiSuggestions(Array.isArray(suggestions) ? suggestions : []);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Ошибка анализа");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <AppShell title="Plans" subtitle="Лимиты и финансовые цели">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="panel rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-slate-100">Добавить лимит или цель</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Название плана"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Сумма"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Select value={type} onValueChange={(value) => setType(value as Plan["type"])}>
              <SelectTrigger>
                <SelectValue placeholder="Тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="limit">Лимит</SelectItem>
                <SelectItem value="goal">Цель</SelectItem>
              </SelectContent>
            </Select>
            {type === "limit" ? (
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-slate-400 flex items-center">
                Цель по общему доходу за месяц
              </div>
            )}
          </div>
          <Button className="mt-4" onClick={handleAddPlan}>
            Создать
          </Button>
        </div>

        <div className="panel rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-slate-100">Сводка за месяц</h3>
          <p className="mt-2 text-sm text-slate-400">
            Используем транзакции текущего месяца для расчета прогресса.
          </p>
          <div className="mt-4 space-y-3">
            {plans.length === 0 && (
              <p className="text-sm text-slate-400">Добавьте первый план.</p>
            )}
            {plans.map((plan) => {
              const used = getUsedAmount(plan);
              const percent = Math.min((used / plan.amount) * 100, 100);
              return (
                <div key={plan.id} className="rounded-xl border border-slate-800/70 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-100">{plan.name}</p>
                      <p className="text-xs text-slate-400">
                        {plan.type === "limit"
                          ? `Лимит · ${plan.category}`
                          : "Цель дохода"}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleRemovePlan(plan.id)}>
                      Удалить
                    </Button>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-emerald-400"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-slate-400 flex justify-between">
                    <span>Использовано: {used.toFixed(0)} ₽</span>
                    <span>Цель: {plan.amount.toFixed(0)} ₽</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">Gemini подсказки</h3>
            <Button size="sm" onClick={handleSuggestPlans} disabled={aiLoading}>
              {aiLoading ? "Анализ..." : "Сгенерировать"}
            </Button>
          </div>
          {aiError && <p className="mt-3 text-sm text-rose-300">{aiError}</p>}
          {aiSuggestions.length > 0 ? (
            <ul className="mt-3 list-disc list-inside text-sm text-slate-200 space-y-1">
              {aiSuggestions.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-400">
              Запустите Gemini, чтобы получить идеи по лимитам и целям.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
