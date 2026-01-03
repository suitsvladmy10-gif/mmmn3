import axios from "axios";

export async function recognizeTextWithYandexVision(
  imageBase64: string
): Promise<string> {
  const apiKey = process.env.YANDEX_VISION_API_KEY;

  if (!apiKey) {
    throw new Error("YANDEX_VISION_API_KEY не установлен");
  }

  try {
    const response = await axios.post(
      "https://vision.api.cloud.yandex.net/vision/v1/batchAnalyze",
      {
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
      },
      {
        headers: {
          Authorization: `Api-Key ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Извлекаем текст из ответа
    const results = response.data.results?.[0]?.results?.[0]?.textDetection;
    if (!results) {
      throw new Error("Не удалось распознать текст");
    }

    // Объединяем все блоки текста
    const textBlocks = results.blocks?.map((block: any) =>
      block.lines?.map((line: any) => line.text).join("\n")
    );

    return textBlocks?.join("\n\n") || "";
  } catch (error: any) {
    console.error("Ошибка Yandex Vision API:", error.response?.data || error);
    throw new Error(
      `Ошибка при распознавании текста: ${error.message || "Неизвестная ошибка"}`
    );
  }
}

