export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Удаляем префикс data:image/...;base64,
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Неподдерживаемый тип файла. Используйте JPG, PNG или PDF",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "Файл слишком большой. Максимальный размер: 10MB",
    };
  }

  return { valid: true };
}

