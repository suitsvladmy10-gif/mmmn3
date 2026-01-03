import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {
      userId: session.user.id,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = startDate;
      }
      if (endDate) {
        where.date.lte = endDate;
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
    });

    const exportData = {
      exportDate: new Date().toISOString(),
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
      totalTransactions: transactions.length,
      transactions: transactions.map((t) => ({
        id: t.id,
        bank: t.bank,
        date: t.date,
        time: t.time,
        amount: t.amount,
        description: t.description,
        category: t.category,
        balance: t.balance,
        createdAt: t.createdAt.toISOString(),
      })),
    };

    return NextResponse.json(exportData, {
      headers: {
        "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Ошибка экспорта JSON:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
