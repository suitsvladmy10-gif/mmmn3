"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { FileUpload } from "@/components/upload/FileUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  const handleUploadComplete = (result: any) => {
    // Можно добавить редирект на страницу транзакций или обновить данные
    setTimeout(() => {
      router.push("/transactions");
      router.refresh();
    }, 2000);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Загрузка выписки
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Загрузите скриншот или PDF из личного кабинета банка</p>
          </div>

          <Card className="mb-6 glass border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Инструкция</CardTitle>
              <CardDescription className="text-base">
                Загрузите скриншот или PDF файл из личного кабинета банка
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
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
      </div>
    </div>
  );
}
