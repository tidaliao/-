import React, { useState, useMemo } from 'react';
import { MsaRawData, PartMetadata } from './types/msa';
import {
  ALL_PRESETS,
  PRESET_LATHE_SHAFT_OD,
  PresetProfile,
} from './utils/presetData';
import {
  calculateAnova,
  calculateXbarR,
  generateMachiningDiagnostics,
} from './utils/msaCalculations';
import { Header } from './components/Header';
import { PartInfoCard } from './components/PartInfoCard';
import { MsaSummaryCards } from './components/MsaSummaryCards';
import { DataEntryTable } from './components/DataEntryTable';
import { MsaCharts } from './components/MsaCharts';
import { MsaDetailTable } from './components/MsaDetailTable';
import { AnovaTable } from './components/AnovaTable';
import { DiagnosticsSection } from './components/DiagnosticsSection';
import { ExcelPasteModal } from './components/ExcelPasteModal';
import { PrintableReport } from './components/PrintableReport';
import { DownloadModal } from './components/DownloadModal';
import {
  BarChart3,
  TableProperties,
  Split,
  Lightbulb,
  FileSpreadsheet,
} from 'lucide-react';

export default function App() {
  const [currentPreset, setCurrentPreset] = useState<PresetProfile>(PRESET_LATHE_SHAFT_OD);
  const [metadata, setMetadata] = useState<PartMetadata>(PRESET_LATHE_SHAFT_OD.metadata);
  const [rawData, setRawData] = useState<MsaRawData>(PRESET_LATHE_SHAFT_OD.rawData);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [activeAnalysisView, setActiveAnalysisView] = useState<
    'charts' | 'detail' | 'anova' | 'diagnostics'
  >('charts');

  // 切換範本案例
  const handleSelectPreset = (preset: PresetProfile) => {
    setCurrentPreset(preset);
    setMetadata({ ...preset.metadata });
    setRawData(JSON.parse(JSON.stringify(preset.rawData)));
  };

  // 重設為當前案例原始數據
  const handleResetData = () => {
    setMetadata({ ...currentPreset.metadata });
    setRawData(JSON.parse(JSON.stringify(currentPreset.rawData)));
  };

  // 實時計算 Xbar-R 統計量
  const xbarR = useMemo(() => {
    return calculateXbarR(rawData, metadata, 6.0);
  }, [rawData, metadata]);

  // 實時計算 ANOVA 方差分析
  const anova = useMemo(() => {
    return calculateAnova(rawData, metadata, 6.0);
  }, [rawData, metadata]);

  // 實時產生工程診斷與改善處置對策
  const diagnostics = useMemo(() => {
    return generateMachiningDiagnostics(xbarR, metadata);
  }, [xbarR, metadata]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-900">
      {/* 頂部導航欄 */}
      <Header
        currentPresetId={currentPreset.id}
        onSelectPreset={handleSelectPreset}
        isPrintMode={isPrintMode}
        onTogglePrintMode={() => setIsPrintMode(!isPrintMode)}
        onResetData={handleResetData}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
      />

      {/* 內容主體 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {isPrintMode ? (
          /* 正式 MSA 檢驗報告列印視圖 */
          <PrintableReport
            metadata={metadata}
            data={rawData}
            xbarR={xbarR}
            anova={anova}
            onBack={() => setIsPrintMode(false)}
          />
        ) : (
          /* 互動工作台分析視圖 */
          <>
            {/* 1. 工件規格與量具資訊卡片 */}
            <PartInfoCard
              metadata={metadata}
              onUpdateMetadata={setMetadata}
            />

            {/* 2. 核心 KPI 狀態卡片 (AIAG 合格性橫幅與四大指標) */}
            <MsaSummaryCards
              xbarR={xbarR}
              metadata={metadata}
            />

            {/* 3. 數據錄入與即時編輯表格 */}
            <DataEntryTable
              data={rawData}
              metadata={metadata}
              xbarR={xbarR}
              onUpdateData={setRawData}
              onOpenExcelModal={() => setIsExcelModalOpen(true)}
            />

            {/* 4. 深入分析分頁控制 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-1 p-1 bg-slate-200/80 border border-slate-300/80 rounded-lg text-xs">
                  <button
                    onClick={() => setActiveAnalysisView('charts')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-medium transition-colors ${
                      activeAnalysisView === 'charts'
                        ? 'bg-white text-sky-800 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    管制圖與視覺化圖表
                  </button>
                  <button
                    onClick={() => setActiveAnalysisView('detail')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-medium transition-colors ${
                      activeAnalysisView === 'detail'
                        ? 'bg-white text-sky-800 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TableProperties className="w-3.5 h-3.5" />
                    AIAG 4th 數值明細表
                  </button>
                  <button
                    onClick={() => setActiveAnalysisView('anova')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-medium transition-colors ${
                      activeAnalysisView === 'anova'
                        ? 'bg-white text-sky-800 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Split className="w-3.5 h-3.5" />
                    Two-Way ANOVA 方差分析
                  </button>
                  <button
                    onClick={() => setActiveAnalysisView('diagnostics')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-medium transition-colors ${
                      activeAnalysisView === 'diagnostics'
                        ? 'bg-white text-amber-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    車削現場診斷與對策
                  </button>
                </div>

                <div className="hidden sm:block text-xs text-slate-500 font-mono">
                  公差規格：±{((metadata.tolerance || 0.04) / 2).toFixed(3)} {metadata.unit}
                </div>
              </div>

              {/* 切換子面板 */}
              {activeAnalysisView === 'charts' && (
                <MsaCharts
                  data={rawData}
                  metadata={metadata}
                  xbarR={xbarR}
                />
              )}

              {activeAnalysisView === 'detail' && (
                <MsaDetailTable
                  xbarR={xbarR}
                  metadata={metadata}
                />
              )}

              {activeAnalysisView === 'anova' && (
                <AnovaTable
                  anova={anova}
                  metadata={metadata}
                />
              )}

              {activeAnalysisView === 'diagnostics' && (
                <DiagnosticsSection findings={diagnostics} />
              )}
            </div>
          </>
        )}
      </main>

      {/* Excel 批次貼上彈窗 */}
      <ExcelPasteModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        data={rawData}
        metadata={metadata}
        onApplyData={setRawData}
      />

      {/* 下載與離線部署指引彈窗 */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />

      {/* 頁尾 */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 print:hidden font-mono">
        車削加工量測系統分析 (MSA) 自動化報告系統 · 遵循 AIAG MSA 第 4 版標準規範 · 支援 IATF 16949 / ISO 9001
      </footer>
    </div>
  );
}
