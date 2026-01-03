export interface ParsedTransaction {
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  amount: number; // отрицательное = расход
  description: string;
  balance: number;
}

export abstract class BaseParser {
  abstract bankName: string;
  abstract detectBank(text: string): boolean;
  abstract parse(text: string): ParsedTransaction[];

  protected parseDate(dateStr: string): string {
    // Конвертирует различные форматы дат в YYYY-MM-DD
    // Примеры: "03.01.2026", "03/01/2026", "2026-01-03"
    const formats = [
      /(\d{2})\.(\d{2})\.(\d{4})/, // DD.MM.YYYY
      /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
      /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        if (format === formats[2]) {
          // YYYY-MM-DD
          return dateStr;
        } else {
          // DD.MM.YYYY or DD/MM/YYYY
          const [, day, month, year] = match;
          return `${year}-${month}-${day}`;
        }
      }
    }

    throw new Error(`Не удалось распарсить дату: ${dateStr}`);
  }

  protected parseAmount(amountStr: string): number {
    // Удаляет пробелы, запятые, знаки валюты
    const cleaned = amountStr
      .replace(/\s/g, "")
      .replace(/,/g, ".")
      .replace(/[₽$€]/g, "")
      .trim();

    const amount = parseFloat(cleaned);
    if (isNaN(amount)) {
      throw new Error(`Не удалось распарсить сумму: ${amountStr}`);
    }

    return amount;
  }

  protected parseTime(timeStr: string): string | undefined {
    // Формат HH:mm или HH:mm:ss
    const match = timeStr.match(/(\d{2}):(\d{2})/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }
    return undefined;
  }
}




