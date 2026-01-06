"use client";

import { useCallback, useEffect, useState } from "react";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";

interface Transaction {
  id: string;
  bank: string;
  date: string;
  time?: string | null;
  amount: number;
  description: string;
  category: string;
  balance: number;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [bankFilter, setBankFilter] = useState<string>("all");

  const fetchTransactions = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") {
        params.append("category", categoryFilter);
      }
      if (bankFilter !== "all") {
        params.append("bank", bankFilter);
      }
      params.append("limit", "1000");

      const response = await fetch(`/api/transactions?${params.toString()}`);
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Ошибка загрузки транзакций:", error);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, bankFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    try {
      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions }),
      });

      if (!response.ok) {
        alert("Ошибка при экспорте PDF");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `transactions-${new Date().toISOString().split("T")[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Произошла ошибка при экспорте PDF");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Загрузка...</div>
      </div>
    );
  }

  const categories = [
    "all",
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

  const banks = ["all", "Сбербанк", "Тинькофф", "ВТБ"];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Транзакции
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Управление вашими транзакциями</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={handleExportJSON}
              className="glass border-0 shadow-md hover:shadow-lg transition-shadow"
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportPDF}
              className="glass border-0 shadow-md hover:shadow-lg transition-shadow"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="flex space-x-4 mb-6">
          <div className="w-48">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Все категории" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "Все категории" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <Select value={bankFilter} onValueChange={setBankFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Все банки" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank === "all" ? "Все банки" : bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TransactionTable
          transactions={transactions}
          onUpdate={fetchTransactions}
        />
      </div>
    </div>
  );
}
