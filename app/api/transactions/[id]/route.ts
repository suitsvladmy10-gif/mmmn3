import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateTransactionSchema = z.object({
  bank: z.enum(["Сбербанк", "Тинькофф", "ВТБ"]).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  amount: z.number().optional(),
  description: z.string().min(1).optional(),
  category: z
    .enum([
      "Доходы",
      "Еда",
      "Транспорт",
      "Развлечения",
      "Покупки",
      "Коммунальные услуги",
      "Здоровье",
      "Образование",
      "Другое",
    ])
    .optional(),
  balance: z.number().optional(),
});

// PUT - обновление транзакции
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const transactionId = params.id;
    const body = await request.json();
    const data = updateTransactionSchema.parse(body);

    // Проверяем, что транзакция принадлежит пользователю
    const existing = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Транзакция не найдена" },
        { status: 404 }
      );
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Нет доступа к этой транзакции" },
        { status: 403 }
      );
    }

    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data,
    });

    return NextResponse.json(transaction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Ошибка обновления транзакции:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// DELETE - удаление транзакции
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const transactionId = params.id;

    // Проверяем, что транзакция принадлежит пользователю
    const existing = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Транзакция не найдена" },
        { status: 404 }
      );
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Нет доступа к этой транзакции" },
        { status: 403 }
      );
    }

    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка удаления транзакции:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
