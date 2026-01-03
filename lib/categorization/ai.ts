import OpenAI from "openai";
import { CategorizationResult } from "./local";

const categories = [
  "Доходы",
  "Еда",
  "Транспорт",
  "Развлечения",
  "Покупки",
  "Коммунальные услуги",
  "Здоровье",
  "Образование",
  "Другое",
];

export async function categorizeWithAI(
  description: string,
  amount: number
): Promise<CategorizationResult> {
  // Если сумма положительная, это доход
  if (amount > 0) {
    return {
      category: "Доходы",
      confidence: 1.0,
      method: "ai",
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY не установлен");
  }

  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Ты помощник для категоризации банковских транзакций. 
Твоя задача - определить категорию транзакции на основе описания.
Доступные категории: ${categories.join(", ")}.
Отвечай только названием категории, без дополнительных объяснений.`,
        },
        {
          role: "user",
          content: `Определи категорию для транзакции: "${description}"`,
        },
      ],
      temperature: 0.3,
      max_tokens: 20,
    });

    const category = response.choices[0]?.message?.content?.trim() || "Другое";

    // Проверяем, что категория валидна
    const validCategory = categories.includes(category) ? category : "Другое";

    return {
      category: validCategory,
      confidence: 0.9, // AI обычно более уверен
      method: "ai",
    };
  } catch (error) {
    console.error("Ошибка AI категоризации:", error);
    throw error;
  }
}
