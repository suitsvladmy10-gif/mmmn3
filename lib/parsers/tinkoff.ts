import { BaseParser, ParsedTransaction } from "./base";

export class TinkoffParser extends BaseParser {
  bankName = "Тинькофф";

  detectBank(text: string): boolean {
    const indicators = [
      /тинькофф/i,
      /tinkoff/i,
      /тинькоф/i,
      /карта.*тинькофф/i,
    ];
    return indicators.some((pattern) => pattern.test(text));
  }

  parse(text: string): ParsedTransaction[] {
    const transactions: ParsedTransaction[] = [];
    const lines = text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);

    // Паттерны для Тинькофф
    // Формат обычно: ДД.ММ.ГГГГ ЧЧ:ММ Описание -Сумма₽ Баланс: X₽

    const datePattern = /(\d{2}\.\d{2}\.\d{4})/;
    const timePattern = /(\d{2}:\d{2})/;
    const amountPattern = /([+-]?\d+[\s,]*\d*[.,]?\d*)\s*₽/;
    const balancePattern = /баланс[:\s]+([\d\s,]+[.,]?\d*)\s*₽?/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const dateMatch = line.match(datePattern);
      if (!dateMatch) continue;

      const date = this.parseDate(dateMatch[1]);
      
      const timeMatch = line.match(timePattern);
      const time = timeMatch ? this.parseTime(timeMatch[1]) : undefined;

      const amountMatch = line.match(amountPattern);
      if (!amountMatch) continue;

      let amount = this.parseAmount(amountMatch[1]);
      if (amount > 0) {
        amount = -amount; // Расходы отрицательные
      }

      // Описание - текст между временем и суммой
      const descStart = timeMatch 
        ? timeMatch.index! + timeMatch[0].length 
        : dateMatch.index! + dateMatch[0].length;
      const descEnd = amountMatch.index!;
      const description = line.substring(descStart, descEnd).trim();

      // Поиск баланса на этой же строке или следующей
      let balance = 0;
      const balanceMatch = line.match(balancePattern);
      if (balanceMatch) {
        balance = this.parseAmount(balanceMatch[1]);
      } else if (i + 1 < lines.length) {
        const nextLineBalance = lines[i + 1].match(balancePattern);
        if (nextLineBalance) {
          balance = this.parseAmount(nextLineBalance[1]);
        }
      }

      if (description) {
        transactions.push({
          date,
          time,
          amount,
          description,
          balance,
        });
      }
    }

    return transactions;
  }
}
