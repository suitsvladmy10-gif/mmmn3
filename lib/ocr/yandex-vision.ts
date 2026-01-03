export async function recognizeTextWithYandexVision(
  imageBase64: string
): Promise<string> {
  const apiKey = process.env.YANDEX_VISION_API_KEY;

  if (!apiKey) {
    throw new Error("YANDEX_VISION_API_KEY не установлен");
  }

  try {
    const response = await fetch(
      "https://vision.api.cloud.yandex.net/vision/v1/batchAnalyze",
      {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderId: process.env.YANDEX_FOLDER_ID || "",
          analyze_specs: [
            {
              features: [
                {
                  type: "TEXT_DETECTION",
                  text_detection_config: {
                    language_codes: ["ru", "en"],
                  },
                },
              ],
              mime_type: "image/jpeg",
            },
          ],
          images: [
            {
              data: imageBase64,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorPayload = await response.text();
      throw new Error(
        `Yandex Vision API error: ${response.status} ${errorPayload}`
      );
    }

    const payload = await response.json();

    // Извлекаем текст из ответа
    const results = payload.results?.[0]?.results?.[0]?.textDetection;
    if (!results) {
      throw new Error("Не удалось распознать текст");
    }

    // Объединяем все блоки текста
    const textBlocks = results.blocks?.map((block: any) =>
      block.lines?.map((line: any) => line.text).join("\n")
    );

    return textBlocks?.join("\n\n") || "";
  } catch (error) {
    console.error("Ошибка Yandex Vision API:", error);
    if (error instanceof Error) {
      throw new Error(
        `Ошибка при распознавании текста: ${error.message || "Неизвестная ошибка"}`
      );
    }
    throw new Error("Ошибка при распознавании текста: Неизвестная ошибка");
  }
}
