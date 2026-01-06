"use client";

import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/upload/FileUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppShell } from "@/components/layout/AppShell";

export default function UploadPage() {
  const router = useRouter();

  const handleUploadComplete = (result: any) => {
    // Можно добавить редирект на страницу транзакций или обновить данные
    setTimeout(() => {
      router.push("/transactions");
      router.refresh();
    }, 2000);
  };

  return (
    <AppShell title="Upload" subtitle="Загрузка PDF и изображений">
      <div className="max-w-3xl">
        <Card className="mb-6 panel">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-100">Инструкция</CardTitle>
            <CardDescription className="text-base text-slate-400">
              Загрузите скриншот или PDF файл из личного кабинета банка
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-400">
              <li>Поддерживаются изображения (JPG, PNG) и PDF файлы</li>
              <li>Максимальный размер файла: 10MB</li>
              <li>Поддерживаемые банки: Сбербанк, Тинькофф, ВТБ</li>
              <li>Приложение автоматически распознает текст и извлечет транзакции</li>
              <li>Транзакции будут автоматически категоризированы</li>
            </ul>
          </CardContent>
        </Card>

        <FileUpload onUploadComplete={handleUploadComplete} />
      </div>
    </AppShell>
  );
}
