export interface ParsedTransaction {
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  amount: number; // отрицательное = расход
  description: string;
  balance: number;
}

export type BankType = "Сбербанк" | "Тинькофф" | "ВТБ";

