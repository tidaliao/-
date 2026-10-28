import React from 'react';
import { ALL_PRESETS, PresetProfile } from '../utils/presetData';
import {
  Compass,
  FileCheck2,
  FolderOpen,
  RotateCcw,
  Download,
} from 'lucide-react';

interface HeaderProps {
  currentPresetId: string;
  onSelectPreset: (preset: PresetProfile) => void;
  isPrintMode: boolean;
  onTogglePrintMode: () => void;
  onResetData: () => void;
  onOpenDownloadModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPresetId,
  onSelectPreset,
  isPrintMode,
  onTogglePrintMode,
  onResetData,
  onOpenDownloadModal,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                車削工件 MSA 量測系統分析
              </h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/80 font-semibold">
                AIAG 4th Edition
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              輸入精密車削尺寸數據 · 即時計算 Gage R&R · 自動生成品質檢驗評定報告
            </p>
          </div>
        </div>

        {/* Action Controls & Preset Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 車削範本預設選單 */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <FolderOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-slate-400 text-[11px] whitespace-nowrap">車削案例:</span>
            <select
              value={currentPresetId}
              onChange={(e) => {
                const found = ALL_PRESETS.find((p) => p.id === e.target.value);
                if (found) onSelectPreset(found);
              }}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
            >
              {ALL_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id} className="bg-slate-900 text-slate-200">
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          {/* 重設按鈕 */}
          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800 text-xs font-medium transition-colors"
            title="重設為當前案例預設值"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重設
          </button>

          {/* 下載系統指引按鈕 */}
          <button
            onClick={onOpenDownloadModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-sky-400 hover:text-sky-300 border border-sky-500/30 text-xs font-medium transition-colors"
            title="下載專案原始碼或在本地端離線執行"
          >
            <Download className="w-3.5 h-3.5" />
            下載系統 / 原始碼
          </button>

          {/* 正式報告生成 / 列印視圖切換 */}
          <button
            onClick={onTogglePrintMode}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm ${
              isPrintMode
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-sky-600 hover:bg-sky-500 text-white'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            {isPrintMode ? '返回工作台' : '產生正式 MSA 報告'}
          </button>
        </div>
      </div>
    </header>
  );
};
