import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsPDF } from "jspdf";

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { transactions: providedTransactions } = body;

    // Если транзакции не предоставлены, загружаем все
    let transactions = providedTransactions;
    if (!transactions) {
      transactions = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: "desc" },
      });
    }

    // Создаем PDF
    const doc = new jsPDF();
    let yPos = 20;

    // Заголовок
    doc.setFontSize(18);
    doc.text("Банковские транзакции", 14, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.text(
      `Дата экспорта: ${new Date().toLocaleDateString("ru-RU")}`,
      14,
      yPos
    );
    yPos += 15;

    // Статистика
    const income = transactions
      .filter((t: any) => t.amount > 0)
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    const expenses = transactions
      .filter((t: any) => t.amount < 0)
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

    doc.setFontSize(12);
    doc.text("Статистика:", 14, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.text(`Доходы: ${income.toFixed(2)} ₽`, 20, yPos);
    yPos += 5;
    doc.text(`Расходы: ${expenses.toFixed(2)} ₽`, 20, yPos);
    yPos += 5;
    doc.text(
      `Разница: ${(income - expenses).toFixed(2)} ₽`,
      20,
      yPos
    );
    yPos += 10;

    // Таблица транзакций
    doc.setFontSize(12);
    doc.text("Транзакции:", 14, yPos);
    yPos += 7;

    // Заголовки таблицы
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Дата", 14, yPos);
    doc.text("Банк", 40, yPos);
    doc.text("Описание", 70, yPos);
    doc.text("Категория", 130, yPos);
    doc.text("Сумма", 170, yPos);
    yPos += 5;

    doc.setFont("helvetica", "normal");
    doc.line(14, yPos, 200, yPos);
    yPos += 5;

    // Транзакции
    for (const transaction of transactions) {
      if (yPos > 270) {
        // Новая страница
        doc.addPage();
        yPos = 20;
      }

      const date = new Date(transaction.date).toLocaleDateString("ru-RU");
      const amount = transaction.amount.toFixed(2);
      const description =
        transaction.description.length > 30
          ? transaction.description.substring(0, 27) + "..."
          : transaction.description;

      doc.text(date, 14, yPos);
      doc.text(transaction.bank, 40, yPos);
      doc.text(description, 70, yPos);
      doc.text(transaction.category, 130, yPos);
      doc.text(`${amount} ₽`, 170, yPos);
      yPos += 6;
    }

    // Генерируем буфер
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Ошибка экспорта PDF:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
