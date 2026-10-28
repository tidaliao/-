import React from 'react';
import { AnovaResults, MsaRawData, PartMetadata, XbarRResults } from '../types/msa';
import { Printer, ArrowLeft, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface PrintableReportProps {
  metadata: PartMetadata;
  data: MsaRawData;
  xbarR: XbarRResults;
  anova: AnovaResults;
  onBack: () => void;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  metadata,
  data,
  xbarR,
  anova,
  onBack,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const isAcceptable = xbarR.grrStatus === 'acceptable';
  const isMarginal = xbarR.grrStatus === 'marginal';

  return (
    <div className="space-y-4">
      {/* 頂部操作按鈕 (列印時自動隱藏) */}
      <div className="print:hidden flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回編輯分析視圖
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            請點選右側按鈕直接調用瀏覽器列印或另存為 PDF (建議紙張方向：縱向 A4)
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <Printer className="w-4 h-4" />
            立即列印 / 匯出 PDF
          </button>
        </div>
      </div>

      {/* 正式標準報告主體 (A4 紙張格式排版，白底黑字標準工程文件風格) */}
      <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-xl border border-slate-200 font-sans max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 print:max-w-none print:rounded-none">
        {/* 文件表頭 */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Metrology & Quality Assurance Department
              </div>
              <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-1">
                量測系統分析 (MSA) 評定報告書
              </h1>
              <div className="text-xs text-slate-600 mt-1">
                標準依據：AIAG MSA 4th Edition (Gage Repeatability & Reproducibility Study)
              </div>
            </div>

            <div className="text-right text-xs font-mono">
              <div className="font-bold text-slate-900">文件編號: MSA-RPT-{new Date().getFullYear()}-042</div>
              <div className="text-slate-500">版次: Rev 1.0</div>
              <div className="text-slate-500">日期: {metadata.inspectionDate}</div>
            </div>
          </div>
        </div>

        {/* 1. 工件與製程規格表 */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 p-1.5 px-2 rounded mb-2 border-l-4 border-slate-800">
            1. 工件與車削製程參數 (Workpiece & Turning Process Information)
          </h2>
          <table className="w-full text-xs border border-slate-300 border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-2 bg-slate-50 font-semibold w-28 text-slate-600">零件名稱</td>
                <td className="p-2 font-medium">{metadata.partName}</td>
                <td className="p-2 bg-slate-50 font-semibold w-28 text-slate-600">零件料號</td>
                <td className="p-2 font-mono">{metadata.partNumber}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 bg-slate-50 font-semibold text-slate-600">加工工序</td>
                <td className="p-2">{metadata.operationName}</td>
                <td className="p-2 bg-slate-50 font-semibold text-slate-600">機台型號</td>
                <td className="p-2">{metadata.machineName}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 bg-slate-50 font-semibold text-slate-600">檢驗特性</td>
                <td className="p-2 font-medium">{metadata.characteristic}</td>
                <td className="p-2 bg-slate-50 font-semibold text-slate-600">工程圖號</td>
                <td className="p-2 font-mono">{metadata.drawingNumber}</td>
              </tr>
              <tr>
                <td className="p-2 bg-slate-50 font-semibold text-slate-600">標稱尺寸</td>
                <td className="p-2 font-mono font-bold">
                  {metadata.nominal.toFixed(3)} {metadata.unit}
                </td>
                <td className="p-2 bg-slate-50 font-semibold text-slate-600">公差規格</td>
                <td className="p-2 font-mono">
                  [{metadata.lsl.toFixed(3)} ~ {metadata.usl.toFixed(3)}] {metadata.unit} (Tol: {metadata.tolerance.toFixed(3)})
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. 量具與量測條件 */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 p-1.5 px-2 rounded mb-2 border-l-4 border-slate-800">
            2. 計量檢驗器具規格 (Gauge & Metrology Equipment)
          </h2>
          <table className="w-full text-xs border border-slate-300 border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-2 bg-slate-50 font-semibold w-28 text-slate-600">量具名稱</td>
                <td className="p-2">{metadata.gaugeName}</td>
                <td className="p-2 bg-slate-50 font-semibold w-28 text-slate-600">量具編號</td>
                <td className="p-2 font-mono">{metadata.gaugeId}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 bg-slate-50 font-semibold text-slate-600">量具解析度</td>
                <td className="p-2 font-mono font-bold">
                  {metadata.gaugeResolution} {metadata.unit}
                </td>
                <td className="p-2 bg-slate-50 font-semibold text-slate-600">校正有效期</td>
                <td className="p-2 font-mono">{metadata.gaugeCalDueDate}</td>
              </tr>
              <tr>
                <td className="p-2 bg-slate-50 font-semibold text-slate-600">研究配置</td>
                <td className="p-2 font-mono" colSpan={3}>
                  評價人 (k) = {data.operators.length} 人 ({data.operators.join(', ')}) · 零件數 (n) = {data.parts.length} 件 · 試驗次數 (r) = {data.trials} 次
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 3. 判定結論大框 (核准印章風格) */}
        <div className="mb-6 p-4 rounded border-2 border-slate-900 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-600">MSA 綜合判定結論 (System Status)</div>
            <div className="text-xl font-black mt-1 tracking-wide flex items-center gap-2">
              {isAcceptable && (
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-6 h-6" /> 合格可接受 (ACCEPTABLE)
                </span>
              )}
              {isMarginal && (
                <span className="text-amber-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-6 h-6" /> 條件性接受 (MARGINAL / CONDITIONAL)
                </span>
              )}
              {!isAcceptable && !isMarginal && (
                <span className="text-rose-700 flex items-center gap-1.5">
                  <XCircle className="w-6 h-6" /> 不合格不可接受 (UNACCEPTABLE)
                </span>
              )}
            </div>
            <div className="text-xs text-slate-600 mt-1 font-mono">
              %GRR = {xbarR.pctGRR.toFixed(2)}% | %Tolerance = {xbarR.pctTolGRR.toFixed(2)}% | 分辨力 ndc = {xbarR.ndc} 組
            </div>
          </div>

          <div className="text-right border-l-2 border-slate-300 pl-6">
            <div className="text-[10px] text-slate-500 uppercase font-bold">AIAG 判定準則</div>
            <div className="text-xs text-slate-700 font-mono mt-0.5">&lt;10%: 合格</div>
            <div className="text-xs text-slate-700 font-mono">10%~30%: 條件性接受</div>
            <div className="text-xs text-slate-700 font-mono">&gt;30%: 不合格</div>
          </div>
        </div>

        {/* 4. AIAG 4th Xbar-R 統計計算明細表 */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 p-1.5 px-2 rounded mb-2 border-l-4 border-slate-800">
            3. Gage R&R 統計計算明細表 (X̄-R Method - 6σ Study Variation)
          </h2>
          <table className="w-full text-xs border border-slate-300 border-collapse font-mono">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                <th className="p-2 text-left font-sans">變異來源 (Source)</th>
                <th className="p-2 text-right">標準差 (1σ)</th>
                <th className="p-2 text-right">研究變異 (6σ)</th>
                <th className="p-2 text-right">%Study Var (%TV)</th>
                <th className="p-2 text-right">%Tolerance (%Tol)</th>
                <th className="p-2 text-right">%Contribution (σ²)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-2 font-sans font-medium text-slate-800">重複性 (EV / 設備變異)</td>
                <td className="p-2 text-right">{xbarR.sigmaEV.toFixed(5)}</td>
                <td className="p-2 text-right">{xbarR.EV.toFixed(4)}</td>
                <td className="p-2 text-right">{xbarR.pctEV.toFixed(2)}%</td>
                <td className="p-2 text-right">{xbarR.pctTolEV.toFixed(2)}%</td>
                <td className="p-2 text-right">{xbarR.contribEV.toFixed(2)}%</td>
              </tr>
              <tr>
                <td className="p-2 font-sans font-medium text-slate-800">再現性 (AV / 人員變異)</td>
                <td className="p-2 text-right">{xbarR.sigmaAV.toFixed(5)}</td>
                <td className="p-2 text-right">{xbarR.AV.toFixed(4)}</td>
                <td className="p-2 text-right">{xbarR.pctAV.toFixed(2)}%</td>
                <td className="p-2 text-right">{xbarR.pctTolAV.toFixed(2)}%</td>
                <td className="p-2 text-right">{xbarR.contribAV.toFixed(2)}%</td>
              </tr>
              <tr className="bg-slate-50 font-bold text-slate-950">
                <td className="p-2 font-sans">綜合量具 R&R (GRR)</td>
                <td className="p-2 text-right">{xbarR.sigmaGRR.toFixed(5)}</td>
                <td className="p-2 text-right">{xbarR.GRR.toFixed(4)}</td>
                <td className="p-2 text-right">{xbarR.pctGRR.toFixed(2)}%</td>
                <td className="p-2 text-right">{xbarR.pctTolGRR.toFixed(2)}%</td>
                <td className="p-2 text-right">{xbarR.contribGRR.toFixed(2)}%</td>
              </tr>
              <tr>
                <td className="p-2 font-sans font-medium text-slate-800">零件間變異 (PV)</td>
                <td className="p-2 text-right">{xbarR.sigmaPV.toFixed(5)}</td>
                <td className="p-2 text-right">{xbarR.PV.toFixed(4)}</td>
                <td className="p-2 text-right">{xbarR.pctPV.toFixed(2)}%</td>
                <td className="p-2 text-right">{xbarR.pctTolPV.toFixed(2)}%</td>
                <td className="p-2 text-right">{xbarR.contribPV.toFixed(2)}%</td>
              </tr>
              <tr className="font-semibold text-slate-900 border-t-2 border-slate-300">
                <td className="p-2 font-sans">總變異 (Total Variation, TV)</td>
                <td className="p-2 text-right">{xbarR.sigmaTV.toFixed(5)}</td>
                <td className="p-2 text-right">{xbarR.TV.toFixed(4)}</td>
                <td className="p-2 text-right">100.00%</td>
                <td className="p-2 text-right">{((xbarR.TV / metadata.tolerance) * 100).toFixed(2)}%</td>
                <td className="p-2 text-right">100.00%</td>
              </tr>
            </tbody>
          </table>
          <div className="text-[11px] text-slate-600 mt-2 font-mono flex items-center justify-between">
            <span>
              分辨力類別數 (ndc) = 1.41 × (PV / GRR) = <strong>{xbarR.ndc}</strong> ({xbarR.ndc >= 5 ? '充足' : '不足'})
            </span>
            <span>
              管制常數：K₁={xbarR.K1.toFixed(3)} · K₂={xbarR.K2.toFixed(3)} · K₃={xbarR.K3.toFixed(3)}
            </span>
          </div>
        </div>

        {/* 5. 簽核欄位 (Sign-off Approvals) */}
        <div className="pt-6 border-t-2 border-slate-900 mt-10">
          <div className="grid grid-cols-3 gap-6 text-xs">
            <div className="space-y-4">
              <span className="font-semibold text-slate-600 block">檢驗測試執行人 (Prepared by):</span>
              <div className="h-10 border-b border-slate-400 flex items-end pb-1 font-mono text-slate-800">
                {metadata.evaluationLeader}
              </div>
              <span className="text-[10px] text-slate-400 block">日期: {metadata.inspectionDate}</span>
            </div>

            <div className="space-y-4">
              <span className="font-semibold text-slate-600 block">品質工程審核人 (Reviewed by):</span>
              <div className="h-10 border-b border-slate-400 flex items-end pb-1 font-mono text-slate-800">
                品質工程師 / QE
              </div>
              <span className="text-[10px] text-slate-400 block">日期: ____________</span>
            </div>

            <div className="space-y-4">
              <span className="font-semibold text-slate-600 block">品保部主管核准 (Approved by QA):</span>
              <div className="h-10 border-b border-slate-400 flex items-end pb-1 font-mono text-slate-800">
                品保部處長 / QA Manager
              </div>
              <span className="text-[10px] text-slate-400 block">日期: ____________</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
