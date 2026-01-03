import { BaseParser, ParsedTransaction } from "./base";

export class VTBParser extends BaseParser {
  bankName = "ВТБ";

  detectBank(text: string): boolean {
    const indicators = [
      /втб/i,
      /vtb/i,
      /втб24/i,
      /карта.*втб/i,
    ];
    return indicators.some((pattern) => pattern.test(text));
  }

  parse(text: string): ParsedTransaction[] {
    const transactions: ParsedTransaction[] = [];
    const lines = text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);

    // Паттерны для ВТБ
    // Формат может быть: ДД.ММ.ГГГГ | Описание | Сумма | Баланс

    const datePattern = /(\d{2}\.\d{2}\.\d{4})/;
    const timePattern = /(\d{2}:\d{2})/;
    const amountPattern = /([+-]?\d+[\s,]*\d*[.,]?\d*)\s*₽?/;
    const balancePattern = /баланс[:\s]+([\d\s,]+[.,]?\d*)/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const dateMatch = line.match(datePattern);
      if (!dateMatch) continue;

      const date = this.parseDate(dateMatch[1]);
      
      const timeMatch = line.match(timePattern);
      const time = timeMatch ? this.parseTime(timeMatch[1]) : undefined;

      // Поиск суммы
      const amountMatches = [...line.matchAll(amountPattern)];
      if (amountMatches.length < 1) continue;

      // Обычно последняя сумма - это баланс, предпоследняя - сумма транзакции
      let amount = 0;
      let balance = 0;

      if (amountMatches.length >= 2) {
        // Предпоследняя - сумма транзакции
        amount = this.parseAmount(amountMatches[amountMatches.length - 2][1]);
        // Последняя - баланс
        balance = this.parseAmount(amountMatches[amountMatches.length - 1][1]);
      } else if (amountMatches.length === 1) {
        // Только одна сумма - это сумма транзакции
        amount = this.parseAmount(amountMatches[0][1]);
      }

      if (amount > 0) {
        amount = -amount; // Расходы отрицательные
      }

      // Описание - текст между датой/временем и суммами
      const descStart = timeMatch 
        ? timeMatch.index! + timeMatch[0].length 
        : dateMatch.index! + dateMatch[0].length;
      const descEnd = amountMatches[0].index!;
      const description = line.substring(descStart, descEnd).trim();

      // Альтернативный поиск баланса
      if (balance === 0) {
        const balanceMatch = line.match(balancePattern);
        if (balanceMatch) {
          balance = this.parseAmount(balanceMatch[1]);
        }
      }

      if (description && amount !== 0) {
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
