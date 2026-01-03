import { getCategoryByKeywords } from "./keywords";

export type CategorizationMethod = "keywords" | "ai" | "gemini";

export interface CategorizationResult {
  category: string;
  confidence: number; // 0-1, где 1 - высокая уверенность
  method: CategorizationMethod;
}

export function categorizeTransaction(
  description: string,
  amount: number
): CategorizationResult {
  // Если сумма положительная, это доход
  if (amount > 0) {
    return {
      category: "Доходы",
      confidence: 1.0,
      method: "keywords",
    };
  }

  // Используем ключевые слова для категоризации
  const category = getCategoryByKeywords(description);

  // Определяем уверенность на основе количества совпадений
  const lowerDescription = description.toLowerCase();
  let confidence = 0.5; // Базовая уверенность

  // Если описание содержит несколько ключевых слов из одной категории, повышаем уверенность
  const categoryKeywords = require("./keywords").categoryKeywords[category];
  if (categoryKeywords) {
    const matches = categoryKeywords.filter((keyword: string) =>
      lowerDescription.includes(keyword.toLowerCase())
    ).length;
    confidence = Math.min(0.5 + matches * 0.15, 0.9);
  }

  return {
    category,
    confidence,
    method: "keywords",
  };
}
