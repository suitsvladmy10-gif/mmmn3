import { BaseParser, ParsedTransaction } from "./base";

export class SberbankParser extends BaseParser {
  bankName = "Сбербанк";

  detectBank(text: string): boolean {
    const indicators = [
      /сбербанк/i,
      /sberbank/i,
      /сбер/i,
      /карта.*сбер/i,
    ];
    return indicators.some((pattern) => pattern.test(text));
  }

  parse(text: string): ParsedTransaction[] {
    const transactions: ParsedTransaction[] = [];
    const lines = text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);

    // Паттерны для Сбербанка
    // Формат может быть: ДД.ММ.ГГГГ ЧЧ:ММ | Описание | Сумма | Баланс
    // или: ДД.ММ.ГГГГ | Описание | -Сумма | Баланс

    const datePattern = /(\d{2}\.\d{2}\.\d{4})/;
    const timePattern = /(\d{2}:\d{2})/;
    const amountPattern = /([+-]?\d+[\s,]*\d*[.,]?\d*)\s*₽?/;
    const balancePattern = /баланс[:\s]+([\d\s,]+[.,]?\d*)/i;

    let currentDate = "";
    let currentTime: string | undefined;
    let currentDescription = "";
    let currentAmount = 0;
    let currentBalance = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Поиск даты
      const dateMatch = line.match(datePattern);
      if (dateMatch) {
        currentDate = this.parseDate(dateMatch[1]);
        
        // Поиск времени на той же строке
        const timeMatch = line.match(timePattern);
        if (timeMatch) {
          currentTime = this.parseTime(timeMatch[1]);
        }
      }

      // Поиск баланса
      const balanceMatch = line.match(balancePattern);
      if (balanceMatch) {
        currentBalance = this.parseAmount(balanceMatch[1]);
      }

      // Поиск суммы (обычно после описания)
      const amountMatch = line.match(amountPattern);
      if (amountMatch && dateMatch) {
        // Если на строке есть дата и сумма, это начало транзакции
        const amountStr = amountMatch[1];
        currentAmount = this.parseAmount(amountStr);
        
        // Описание - это часть строки между датой/временем и суммой
        const descStart = dateMatch.index! + dateMatch[0].length;
        const descEnd = amountMatch.index!;
        currentDescription = line.substring(descStart, descEnd).trim();
        
        // Если сумма положительная, это доход, иначе расход
        if (currentAmount > 0) {
          currentAmount = -currentAmount; // Инвертируем для расходов
        }

        if (currentDate && currentDescription) {
          transactions.push({
            date: currentDate,
            time: currentTime,
            amount: currentAmount,
            description: currentDescription,
            balance: currentBalance || 0,
          });
        }
      } else if (amountMatch && !dateMatch && currentDate) {
        // Сумма на отдельной строке после описания
        currentAmount = this.parseAmount(amountMatch[1]);
        if (currentAmount > 0) {
          currentAmount = -currentAmount;
        }
        
        // Описание может быть на предыдущей строке
        if (i > 0 && !lines[i - 1].match(datePattern)) {
          currentDescription = lines[i - 1].trim();
        }

        if (currentDate && currentDescription) {
          transactions.push({
            date: currentDate,
            time: currentTime,
            amount: currentAmount,
            description: currentDescription,
            balance: currentBalance || 0,
          });
        }
      }
    }

    return transactions;
  }
}
