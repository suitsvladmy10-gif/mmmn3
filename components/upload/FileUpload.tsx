"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface FileUploadProps {
  onUploadComplete: (result: any) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setResult(null);
    setAnalysis(null);
    setAnalysisError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Симуляция прогресса
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Ошибка загрузки файла");
      }

      const data = await response.json();
      setResult(data);
      onUploadComplete(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete]);

  const handleGeminiAnalysis = async () => {
    const payloadTransactions = result?.analysisTransactions || result?.transactions;
    if (!payloadTransactions) return;
    setAnalysis(null);
    setAnalysisError(null);
    setAnalysisLoading(true);

    try {
      const response = await fetch("/api/analysis/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: payloadTransactions }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Ошибка анализа");
      }

      setAnalysis(data.report);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "Ошибка анализа");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-primary/50"
            } ${uploading ? "pointer-events-none opacity-50" : ""}`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
                <div>
                  <p className="text-lg font-medium">Загрузка и обработка...</p>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {uploadProgress}%
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive
                      ? "Отпустите файл для загрузки"
                      : "Перетащите файл сюда или нажмите для выбора"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Поддерживаются изображения (JPG, PNG) и PDF файлы до 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-green-600 mb-2">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-medium">Файл успешно обработан!</p>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="grid gap-2 sm:grid-cols-2">
                <p>
                  <strong>Банк:</strong> {result.bank}
                </p>
                <p>
                  <strong>Транзакций в выписке:</strong> {result.transactionsCount}
                </p>
                <p>
                  <strong>Доходы (выписка):</strong> {result.summary?.income?.toFixed?.(2) ?? 0} ₽
                </p>
                <p>
                  <strong>Расходы (выписка):</strong> {result.summary?.expenses?.toFixed?.(2) ?? 0} ₽
                </p>
              </div>

              {result.summary?.dateRange && (
                <p>
                  <strong>Период:</strong> {result.summary.dateRange.start} — {result.summary.dateRange.end}
                </p>
              )}

              {result.summaryAll && (
                <div className="rounded-md border border-slate-200 bg-white/60 p-3">
                  <p className="font-medium mb-2">Итоги по всем выпискам</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <p>
                      <strong>Доходы (всего):</strong> {result.summaryAll.income?.toFixed?.(2) ?? 0} ₽
                    </p>
                    <p>
                      <strong>Расходы (всего):</strong> {result.summaryAll.expenses?.toFixed?.(2) ?? 0} ₽
                    </p>
                    <p>
                      <strong>Баланс (всего):</strong> {result.summaryAll.net?.toFixed?.(2) ?? 0} ₽
                    </p>
                    <p>
                      <strong>Транзакций (всего):</strong> {result.summaryAll.totalTransactions ?? 0}
                    </p>
                  </div>
                </div>
              )}

              {result.summary?.categories?.length > 0 && (
                <div>
                  <p className="font-medium">Категории (топ-5 по расходам):</p>
                  <ul className="list-disc list-inside mt-1">
                    {result.summary.categories.slice(0, 5).map((c: any) => (
                      <li key={c.category} className="text-xs">
                        {c.category}: {c.amount.toFixed(2)} ₽
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.summary?.topExpenses?.length > 0 && (
                <div>
                  <p className="font-medium">Крупные траты (топ-5):</p>
                  <ul className="list-disc list-inside mt-1">
                    {result.summary.topExpenses.map((t: any, idx: number) => (
                      <li key={`${t.date}-${idx}`} className="text-xs">
                        {t.date} · {t.category} · {t.amount.toFixed(2)} ₽ — {t.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.errors && result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium text-yellow-600">
                    Ошибки при обработке ({result.errors.length}):
                  </p>
                  <ul className="list-disc list-inside mt-1">
                    {result.errors.slice(0, 3).map((err: any, idx: number) => (
                      <li key={idx} className="text-xs">
                        {err.description}: {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="button"
                  onClick={handleGeminiAnalysis}
                  disabled={analysisLoading}
                >
                  {analysisLoading ? "Анализ..." : "Анализировать с Gemini"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisError && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4 text-sm text-red-600">
            {analysisError}
          </CardContent>
        </Card>
      )}

      {analysis && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4 text-sm space-y-3">
            <p className="font-medium">Gemini анализ</p>
            {analysis.summary && <p>{analysis.summary}</p>}
            {analysis.keyMetrics && (
              <div className="grid gap-2 sm:grid-cols-2">
                <p><strong>Доходы:</strong> {analysis.keyMetrics.income}</p>
                <p><strong>Расходы:</strong> {analysis.keyMetrics.expenses}</p>
                <p><strong>Баланс:</strong> {analysis.keyMetrics.net}</p>
                <p><strong>Топ категория:</strong> {analysis.keyMetrics.topCategory}</p>
              </div>
            )}
            {Array.isArray(analysis.insights) && analysis.insights.length > 0 && (
              <div>
                <p className="font-medium">Инсайты:</p>
                <ul className="list-disc list-inside">
                  {analysis.insights.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(analysis.risks) && analysis.risks.length > 0 && (
              <div>
                <p className="font-medium">Риски:</p>
                <ul className="list-disc list-inside">
                  {analysis.risks.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0 && (
              <div>
                <p className="font-medium">Рекомендации:</p>
                <ul className="list-disc list-inside">
                  {analysis.recommendations.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
