import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - статистика для дашборда
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {
      userId: session.user.id,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    // Общий баланс по всем банкам
    const bankAccounts = await prisma.bankAccount.findMany({
      where: { userId: session.user.id },
    });
    const totalBalance = bankAccounts.reduce(
      (sum, acc) => sum + acc.lastBalance,
      0
    );

    // Доходы и расходы
    const transactions = await prisma.transaction.findMany({
      where,
    });

    const income = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = Math.abs(
      transactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    );

    // Расходы по категориям
    const categoryExpenses = transactions
      .filter((t) => t.amount < 0)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);

    // Топ-3 самых больших трат
    const topExpenses = transactions
      .filter((t) => t.amount < 0)
      .sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount))
      .reverse()
      .slice(0, 3)
      .map((t) => ({
        id: t.id,
        date: t.date,
        amount: Math.abs(t.amount),
        description: t.description,
        category: t.category,
      }));

    // Расходы по дням (для графика тренда)
    const dailyExpenses = transactions
      .filter((t) => t.amount < 0)
      .reduce((acc, t) => {
        const date = t.date;
        acc[date] = (acc[date] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);

    const dailyExpensesArray = Object.entries(dailyExpenses)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      totalBalance,
      income,
      expenses,
      net: income - expenses,
      categoryExpenses,
      topExpenses,
      dailyExpenses: dailyExpensesArray,
    });
  } catch (error) {
    console.error("Ошибка при получении статистики:", error);
    return NextResponse.json(
      { error: "Ошибка при получении статистики" },
      { status: 500 }
    );
  }
}
