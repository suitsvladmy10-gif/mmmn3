export async function recognizeTextWithYandexVision(
  imageBase64: string
): Promise<string> {
  const apiKey = process.env.YANDEX_VISION_API_KEY;
  if (!apiKey) {
    throw new Error("YANDEX_VISION_API_KEY не установлен");
  }

  const folderId = process.env.YANDEX_FOLDER_ID; // Опционально, если используется

  const response = await fetch(
    "https://vision.api.cloud.yandex.net/vision/v1/batchAnalyze",
    {
      method: "POST",
      headers: {
        "Authorization": `Api-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        folderId: folderId || undefined,
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
        recognizer_specs: [
          {
            text_detection_config: {
              language_codes: ["ru", "en"],
            },
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
    const errorText = await response.text();
    throw new Error(`Yandex Vision API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // Извлекаем текст из ответа
  const textBlocks = data.results?.[0]?.results?.[0]?.textDetection?.pages?.[0]?.blocks || [];
  const textLines: string[] = [];

  for (const block of textBlocks) {
    for (const line of block.lines || []) {
      const words = (line.words || []).map((w: any) => w.text).join(" ");
      if (words.trim()) {
        textLines.push(words);
      }
    }
  }

  return textLines.join("\n");
}

// Альтернативный метод через синхронный API
export async function recognizeTextSync(imageBase64: string): Promise<string> {
  const apiKey = process.env.YANDEX_VISION_API_KEY;
  if (!apiKey) {
    throw new Error("YANDEX_VISION_API_KEY не установлен");
  }

  const folderId = process.env.YANDEX_FOLDER_ID;

  // Используем правильный формат для Yandex Vision API
  const response = await fetch(
    "https://vision.api.cloud.yandex.net/vision/v1/batchAnalyze",
    {
      method: "POST",
      headers: {
        "Authorization": `Api-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        folderId: folderId || undefined,
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
    const errorText = await response.text();
    throw new Error(`Yandex Vision API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // Извлекаем текст из ответа Yandex Vision API
  const textBlocks = data.results?.[0]?.results?.[0]?.textDetection?.pages?.[0]?.blocks || [];
  const textLines: string[] = [];

  for (const block of textBlocks) {
    for (const line of block.lines || []) {
      const words = (line.words || []).map((w: any) => w.text).join(" ");
      if (words.trim()) {
        textLines.push(words);
      }
    }
  }

  // Если структура ответа другая, пробуем альтернативный путь
  if (textLines.length === 0 && data.textAnnotation) {
    const blocks = data.textAnnotation.pages?.[0]?.blocks || [];
    for (const block of blocks) {
      for (const paragraph of block.paragraphs || []) {
        for (const word of paragraph.words || []) {
          const wordText = word.symbols?.map((s: any) => s.text).join("") || "";
          if (wordText.trim()) {
            textLines.push(wordText);
          }
        }
      }
    }
  }

  return textLines.join("\n");
}

