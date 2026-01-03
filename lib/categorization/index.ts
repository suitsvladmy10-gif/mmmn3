import { categorizeTransaction } from "./local";
import { categorizeWithGemini } from "./gemini";
import type { CategorizationResult } from "./local";

export { categorizeTransaction };
export type { CategorizationResult };
export { categorizeWithGemini };

export async function categorize(
  description: string,
  amount: number,
  useAI: boolean = false
): Promise<CategorizationResult> {
  if (useAI) {
    try {
      return await categorizeWithGemini(description, amount);
    } catch (error) {
      console.warn("Gemini категоризация не удалась, используем локальную:", error);
      // Fallback на локальную категоризацию
      return categorizeTransaction(description, amount);
    }
  }

  return categorizeTransaction(description, amount);
}
