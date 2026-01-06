"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { EditTransactionDialog } from "./EditTransactionDialog";

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

interface TransactionTableProps {
  transactions: Transaction[];
  onUpdate: () => void;
}

export function TransactionTable({
  transactions,
  onUpdate,
}: TransactionTableProps) {
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ru-RU");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту транзакцию?")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Ошибка при удалении транзакции");
        return;
      }

      onUpdate();
    } catch (error) {
      alert("Произошла ошибка при удалении");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="rounded-2xl panel overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Банк</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead className="text-right">Сумма</TableHead>
              <TableHead className="text-right">Баланс</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Нет транзакций
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {formatDate(transaction.date)}
                    {transaction.time && (
                      <span className="text-slate-400 ml-2">
                        {transaction.time}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{transaction.bank}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {transaction.description}
                  </TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell
                    className={`text-right ${
                      transaction.amount >= 0
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }`}
                  >
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(transaction.balance)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingTransaction(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(transaction.id)}
                        disabled={deletingId === transaction.id}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditTransactionDialog
        transaction={editingTransaction}
        open={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSave={onUpdate}
      />
    </>
  );
}
