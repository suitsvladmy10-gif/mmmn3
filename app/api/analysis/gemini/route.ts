import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY не установлен" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const transactions = Array.isArray(body.transactions) ? body.transactions : [];

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: "transactions обязателен" },
        { status: 400 }
      );
    }

    const trimmed = transactions.slice(0, 200).map((t) => ({
      date: t.date,
      amount: t.amount,
      description: t.description,
      category: t.category,
      bank: t.bank,
    }));

    const prompt = `Ты финансовый аналитик. На основе списка транзакций верни СТРОГО JSON без пояснений.
Схема:
{
  "summary": string,
  "keyMetrics": { "income": number, "expenses": number, "net": number, "topCategory": string },
  "insights": string[],
  "risks": string[],
  "recommendations": string[]
}
Если данных мало, заполни поля короткими выводами.
Транзакции: ${JSON.stringify(trimmed)}
`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    try {
      const parsed = JSON.parse(text);
      return NextResponse.json({ report: parsed });
    } catch {
      return NextResponse.json({ report: { summary: text } });
    }
  } catch (error) {
    console.error("Ошибка Gemini анализа:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
