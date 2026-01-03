import pdfParse from "pdf-parse";

export async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Удаляем префикс data:image/...;base64, или data:application/pdf;base64,
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const data = await pdfParse(buffer);
  return data.text;
}

export async function convertPDFToImages(file: File): Promise<string[]> {
  // Для простоты, если PDF содержит текст, извлекаем его напрямую
  // В продакшене можно использовать pdf-lib или pdf.js для конвертации в изображения
  const text = await extractTextFromPDF(file);
  return [text]; // Возвращаем как текст, а не изображения
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function isPDFFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}


