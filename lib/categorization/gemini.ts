import { GoogleGenerativeAI } from "@google/generative-ai";
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

export async function categorizeWithGemini(
  description: string,
  amount: number
): Promise<CategorizationResult> {
  // Если сумма положительная, это доход
  if (amount > 0) {
    return {
      category: "Доходы",
      confidence: 1.0,
      method: "gemini",
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY не установлен");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  try {
    const prompt = `Ты помощник для категоризации банковских транзакций.
Твоя задача - определить категорию транзакции на основе описания.

Доступные категории: ${categories.join(", ")}.

Описание транзакции: "${description}"

Верни ТОЛЬКО название категории, без дополнительных объяснений.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const category = response.text().trim();

    // Проверяем, что категория валидна
    const validCategory = categories.includes(category) ? category : "Другое";

    return {
      category: validCategory,
      confidence: 0.9, // Gemini обычно более уверен
      method: "gemini",
    };
  } catch (error) {
    console.error("Ошибка Gemini категоризации:", error);
    throw error;
  }
}


