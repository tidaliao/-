import React, { useState } from 'react';
import { MsaRawData, PartMetadata } from '../types/msa';
import { X, ClipboardPaste, Check, AlertCircle } from 'lucide-react';

interface ExcelPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MsaRawData;
  metadata: PartMetadata;
  onApplyData: (newData: MsaRawData) => void;
}

export const ExcelPasteModal: React.FC<ExcelPasteModalProps> = ({
  isOpen,
  onClose,
  data,
  metadata,
  onApplyData,
}) => {
  const [pasteText, setPasteText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const k = data.operators.length;
  const r = data.trials;

  const handleParseAndApply = () => {
    setErrorMsg(null);
    if (!pasteText.trim()) {
      setErrorMsg('請先在下方輸入框中貼上文字數據！');
      return;
    }

    const lines = pasteText
      .trim()
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setErrorMsg('無有效數據行！');
      return;
    }

    // 解析每一列（以 tab 或逗號分隔）
    const parsedRows: number[][] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // 支援 Tab 或逗號分隔
      const tokens = line.includes('\t')
        ? line.split('\t')
        : line.split(',');

      // 嘗試將純數字讀出
      const numTokens = tokens
        .map((t) => parseFloat(t.trim().replace(/[^0-9.-]/g, '')))
        .filter((n) => !isNaN(n));

      if (numTokens.length > 0) {
        parsedRows.push(numTokens);
      }
    }

    if (parsedRows.length === 0) {
      setErrorMsg('未能從貼上的內容中辨識出有效數值，請確認格式。');
      return;
    }

    // 檢查欄位數量：預期每個零件有 k * r 個數值
    const expectedCols = k * r;
    const partCount = parsedRows.length;
    const newPartNames = Array.from({ length: partCount }, (_, idx) => `工件 #${String(idx + 1).padStart(2, '0')}`);

    // 重組 values 矩陣：values[op][part][trial]
    const newValues: number[][][] = [];
    for (let opIdx = 0; opIdx < k; opIdx++) {
      const opParts: number[][] = [];
      for (let pIdx = 0; pIdx < partCount; pIdx++) {
        const row = parsedRows[pIdx];
        const trialVals: number[] = [];
        for (let tIdx = 0; tIdx < r; tIdx++) {
          const colIndex = opIdx * r + tIdx;
          // 若欄位數不足，預設使用該列平均或標稱值
          const val = colIndex < row.length ? row[colIndex] : metadata.nominal;
          trialVals.push(val);
        }
        opParts.push(trialVals);
      }
      newValues.push(opParts);
    }

    onApplyData({
      ...data,
      parts: newPartNames,
      values: newValues,
    });

    onClose();
  };

  // 生成範例格式字串供使用者一鍵複製測試
  const handleLoadSample = () => {
    const sampleRows: string[] = [];
    for (let p = 1; p <= 10; p++) {
      const rowVals: number[] = [];
      for (let op = 0; op < k; op++) {
        for (let t = 0; t < r; t++) {
          const v = metadata.nominal + (p - 5.5) * 0.003 + (op - 1) * 0.001 + (t - 1) * 0.0005;
          rowVals.push(Math.round(v * 1000) / 1000);
        }
      }
      sampleRows.push(rowVals.join('\t'));
    }
    setPasteText(sampleRows.join('\n'));
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ClipboardPaste className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-semibold text-slate-900">
              從 Excel / Google 試算表批次貼上量測數據
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 說明區 */}
        <div className="text-xs text-slate-700 space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
          <p className="font-semibold text-slate-900">
            格式說明 (直接從 Excel 選取儲存格區域並 Ctrl+C / ⌘+C 複製)：
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>
              每一行代表 1 個車削工件；欄位順序依序為：
              <span className="text-sky-700 font-mono font-medium">
                {' '}
                [作業員 1 試驗 1, 2, 3...] [作業員 2 試驗 1, 2, 3...] ...
              </span>
            </li>
            <li>
              目前設定需具備{' '}
              <strong className="text-slate-900 font-mono font-bold">
                {k} 位作業員 × {r} 次試驗 = {k * r} 欄
              </strong>
              。不足欄位將自動補入標稱值。
            </li>
          </ul>
        </div>

        {/* 錯誤提示 */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 輸入 Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>在此貼上複製的數值矩陣 (TSV 或 CSV)：</span>
            <button
              onClick={handleLoadSample}
              className="text-sky-600 hover:underline hover:text-sky-700 font-medium"
            >
              載入示範數據範例
            </button>
          </div>
          <textarea
            rows={8}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={`24.992\t24.993\t24.992\t24.993\t24.992\t24.994\t24.991\t24.993\t24.992\n25.008\t25.009\t25.008\t25.009\t25.008\t25.010\t25.007\t25.009\t25.008\n...`}
            className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleParseAndApply}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium transition-colors shadow-xs"
          >
            <Check className="w-4 h-4" />
            解析並匯入數據
          </button>
        </div>
      </div>
    </div>
  );
};
