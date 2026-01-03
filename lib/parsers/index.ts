import { BaseParser } from "./base";
import { SberbankParser } from "./sberbank";
import { TinkoffParser } from "./tinkoff";
import { VTBParser } from "./vtb";
import { parseWithAI } from "./ai-parser";
import type { ParsedTransaction } from "./base";

const parsers: BaseParser[] = [
  new SberbankParser(),
  new TinkoffParser(),
  new VTBParser(),
];

export function detectBank(text: string): BaseParser | null {
  for (const parser of parsers) {
    if (parser.detectBank(text)) {
      return parser;
    }
  }
  return null;
}

export async function parseBankStatement(
  text: string,
  useAI: boolean = true
): Promise<{
  bank: string;
  transactions: ParsedTransaction[];
} | null> {
  const parser = detectBank(text);
  if (!parser) {
    return null;
  }

  try {
    let transactions: ParsedTransaction[];

    // Пробуем использовать AI парсинг если доступен
    if (useAI && process.env.GEMINI_API_KEY) {
      try {
        transactions = await parseWithAI(text, parser.bankName);
        // Если AI вернул пустой массив, используем обычный парсер
        if (transactions.length === 0) {
          throw new Error("AI вернул пустой результат");
        }
      } catch (aiError) {
        console.warn("AI парсинг не удался, используем обычный парсер:", aiError);
        transactions = parser.parse(text);
      }
    } else {
      transactions = parser.parse(text);
    }

    return {
      bank: parser.bankName,
      transactions,
    };
  } catch (error) {
    console.error("Ошибка парсинга:", error);
    return null;
  }
}

export { BaseParser };
export type { ParsedTransaction };
