import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseBankStatement } from "@/lib/parsers";
import { categorize } from "@/lib/categorization";
import { recognizeTextSync } from "@/lib/yandex-vision";
import { convertFileToBase64, extractTextFromPDF, isImageFile, isPDFFile } from "@/lib/file-utils";

export const runtime = "nodejs";

type SummaryCategory = { category: string; amount: number };
type SummaryExpense = { date: string; amount: number; description: string; category: string; bank: string };

function buildSummary(transactions: Array<{
  date: string;
  amount: number;
  description: string;
  category: string;
  bank: string;
}>) {
  const total = transactions.length;
  const income = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const net = income - expenses;

  const categoryTotals = transactions.reduce((acc, t) => {
    const amount = t.amount < 0 ? Math.abs(t.amount) : 0;
    if (!acc[t.category]) {
      acc[t.category] = 0;
    }
    acc[t.category] += amount;
    return acc;
  }, {} as Record<string, number>);

  const categories: SummaryCategory[] = Object.entries(categoryTotals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const topExpenses: SummaryExpense[] = transactions
    .filter((t) => t.amount < 0)
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 5)
    .map((t) => ({
      date: t.date,
      amount: Math.abs(t.amount),
      description: t.description,
      category: t.category,
      bank: t.bank,
    }));

  const dates = transactions.map((t) => t.date).sort();
  const dateRange = dates.length
    ? { start: dates[0], end: dates[dates.length - 1] }
    : null;

  return {
    totalTransactions: total,
    income,
    expenses,
    net,
    dateRange,
    categories,
    topExpenses,
  };
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Файл не предоставлен" },
        { status: 400 }
      );
    }

    // Проверка размера файла (макс 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Файл слишком большой (максимум 10MB)" },
        { status: 400 }
      );
    }

    let recognizedText = "";

    // Обработка PDF
    if (isPDFFile(file)) {
      try {
        recognizedText = await extractTextFromPDF(file);
      } catch (error) {
        console.error("Ошибка извлечения текста из PDF:", error);
        return NextResponse.json(
          { error: "Не удалось извлечь текст из PDF" },
          { status: 400 }
        );
      }
    }
    // Обработка изображений
    else if (isImageFile(file)) {
      try {
        const base64 = await convertFileToBase64(file);
        recognizedText = await recognizeTextSync(base64);
      } catch (error) {
        console.error("Ошибка OCR:", error);
        return NextResponse.json(
          { error: "Не удалось распознать текст на изображении" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Неподдерживаемый формат файла. Используйте изображение (JPG, PNG) или PDF" },
        { status: 400 }
      );
    }

    if (!recognizedText || recognizedText.trim().length === 0) {
      return NextResponse.json(
        { error: "Не удалось распознать текст в файле" },
        { status: 400 }
      );
    }

    // Парсинг банковской выписки (используем AI если доступен)
    const parsed = await parseBankStatement(recognizedText, true);
    if (!parsed) {
      return NextResponse.json(
        { error: "Не удалось определить банк или распарсить выписку" },
        { status: 400 }
      );
    }

    // Категоризация и сохранение транзакций
    const savedTransactions = [];
    const errors = [];

    for (const transaction of parsed.transactions) {
      try {
        // Категоризация (используем AI если доступен Gemini ключ)
        const useAICategorization = !!process.env.GEMINI_API_KEY;
        const categorization = await categorize(
          transaction.description,
          transaction.amount,
          useAICategorization
        );

        // Сохранение в БД
        const saved = await prisma.transaction.create({
          data: {
            userId,
            bank: parsed.bank,
            date: transaction.date,
            time: transaction.time || null,
            amount: transaction.amount,
            description: transaction.description,
            category: categorization.category,
            balance: transaction.balance,
          },
        });

        savedTransactions.push(saved);

        // Обновление баланса банковского счета
        await prisma.bankAccount.upsert({
          where: {
            userId_bank: {
              userId,
              bank: parsed.bank,
            },
          },
          create: {
            userId,
            bank: parsed.bank,
            lastBalance: transaction.balance,
          },
          update: {
            lastBalance: transaction.balance,
            updatedAt: new Date(),
          },
        });
      } catch (error) {
        console.error("Ошибка сохранения транзакции:", error);
        errors.push({
          description: transaction.description,
          error: error instanceof Error ? error.message : "Неизвестная ошибка",
        });
      }
    }

    const summary = buildSummary(
      savedTransactions.map((t) => ({
        date: t.date,
        amount: t.amount,
        description: t.description,
        category: t.category,
        bank: t.bank,
      }))
    );

    const allTransactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    const summaryAll = buildSummary(
      allTransactions.map((t) => ({
        date: t.date,
        amount: t.amount,
        description: t.description,
        category: t.category,
        bank: t.bank,
      }))
    );

    const analysisTransactions = allTransactions.slice(0, 200).map((t) => ({
      date: t.date,
      amount: t.amount,
      description: t.description,
      category: t.category,
      bank: t.bank,
    }));

    return NextResponse.json({
      success: true,
      bank: parsed.bank,
      transactionsCount: savedTransactions.length,
      transactions: savedTransactions,
      summary,
      summaryAll,
      analysisTransactions,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Ошибка загрузки файла:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
