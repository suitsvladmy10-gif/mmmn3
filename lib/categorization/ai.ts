import type { CategorizationResult } from "./local";

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

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
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
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const category = data.choices?.[0]?.message?.content?.trim() || "Другое";
  const validCategory = categories.includes(category) ? category : "Другое";

  return {
    category: validCategory,
    confidence: 0.9,
    method: "ai",
  };
}
