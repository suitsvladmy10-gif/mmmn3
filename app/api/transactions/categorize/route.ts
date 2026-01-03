import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { categorizeWithGemini } from "@/lib/categorization";

// POST - AI категоризация транзакции
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json(
        { error: "transactionId обязателен" },
        { status: 400 }
      );
    }

    // Получаем транзакцию
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Транзакция не найдена" },
        { status: 404 }
      );
    }

    if (transaction.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Нет доступа к этой транзакции" },
        { status: 403 }
      );
    }

    // Категоризация с Gemini AI
    const categorization = await categorizeWithGemini(
      transaction.description,
      transaction.amount
    );

    // Обновляем категорию
    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        category: categorization.category,
      },
    });

    return NextResponse.json({
      transaction: updated,
      categorization,
    });
  } catch (error) {
    console.error("Ошибка AI категоризации:", error);
    
    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        { error: "Gemini API ключ не настроен" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
