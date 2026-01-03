import { GoogleGenerativeAI } from "@google/generative-ai";
import { ParsedTransaction } from "./base";

export async function parseWithAI(
  text: string,
  bankName: string
): Promise<ParsedTransaction[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY не установлен");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Ты помощник для парсинга банковских выписок. 
Извлеки все транзакции из следующего текста банковской выписки (${bankName}).

Верни результат в формате JSON массива, где каждый объект содержит:
- date: дата в формате YYYY-MM-DD
- time: время в формате HH:mm (опционально)
- amount: сумма (отрицательная для расходов, положительная для доходов)
- description: описание транзакции
- balance: баланс после транзакции

Пример формата:
[
  {
    "date": "2026-01-03",
    "time": "14:30",
    "amount": -1500.50,
    "description": "Оплата в магазине Магнит",
    "balance": 50000.00
  }
]

Текст выписки:
${text}

Верни ТОЛЬКО JSON массив, без дополнительных объяснений.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text().trim();

    // Извлекаем JSON из ответа (может быть обернут в markdown код блоки)
    let jsonText = textResponse;
    
    // Удаляем markdown код блоки если есть
    const jsonMatch = textResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    // Парсим JSON
    const transactions: ParsedTransaction[] = JSON.parse(jsonText);

    // Валидация и нормализация
    return transactions
      .filter((t) => t.date && t.description && !isNaN(t.amount))
      .map((t) => ({
        date: t.date,
        time: t.time,
        amount: Number(t.amount),
        description: t.description.trim(),
        balance: Number(t.balance) || 0,
      }));
  } catch (error) {
    console.error("Ошибка AI парсинга:", error);
    throw new Error(`Не удалось распарсить выписку с помощью AI: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
  }
}


