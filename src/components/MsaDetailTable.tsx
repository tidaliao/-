import React from 'react';
import { PartMetadata, XbarRResults } from '../types/msa';
import { Table } from 'lucide-react';

interface MsaDetailTableProps {
  xbarR: XbarRResults;
  metadata: PartMetadata;
}

export const MsaDetailTable: React.FC<MsaDetailTableProps> = ({ xbarR, metadata }) => {
  const rows = [
    {
      source: '重複性 (Equipment Variation, EV)',
      desc: '同一人使用同量具量測同零件的設備內部波動',
      formula: 'EV = R̿ × K₁',
      sigma: xbarR.sigmaEV,
      studyVar: xbarR.EV,
      pctStudy: xbarR.pctEV,
      pctTol: xbarR.pctTolEV,
      contrib: xbarR.contribEV,
      highlight: false,
    },
    {
      source: '再現性 (Appraiser Variation, AV)',
      desc: '不同作業員間的系統性量測手法偏差',
      formula: 'AV = √[(X_diff × K₂)² - EV²/(n·r)]',
      sigma: xbarR.sigmaAV,
      studyVar: xbarR.AV,
      pctStudy: xbarR.pctAV,
      pctTol: xbarR.pctTolAV,
      contrib: xbarR.contribAV,
      highlight: false,
    },
    {
      source: '綜合量具 R&R (Gage R&R, GRR)',
      desc: '量測系統總變異 (重複性與再現性合成)',
      formula: 'GRR = √(EV² + AV²)',
      sigma: xbarR.sigmaGRR,
      studyVar: xbarR.GRR,
      pctStudy: xbarR.pctGRR,
      pctTol: xbarR.pctTolGRR,
      contrib: xbarR.contribGRR,
      highlight: true,
    },
    {
      source: '零件間變異 (Part-to-Part, PV)',
      desc: '車削工件本身尺寸自然分佈差異',
      formula: 'PV = Rₚ × K₃',
      sigma: xbarR.sigmaPV,
      studyVar: xbarR.PV,
      pctStudy: xbarR.pctPV,
      pctTol: xbarR.pctTolPV,
      contrib: xbarR.contribPV,
      highlight: false,
    },
    {
      source: '總變異 (Total Variation, TV)',
      desc: '製程工件與量測系統總合成變異',
      formula: 'TV = √(GRR² + PV²)',
      sigma: xbarR.sigmaTV,
      studyVar: xbarR.TV,
      pctStudy: 100.0,
      pctTol: (xbarR.TV / (metadata.tolerance || 0.04)) * 100,
      contrib: 100.0,
      highlight: false,
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Table className="w-4 h-4 text-sky-600" />
            <span>AIAG MSA 4th 統計計算明細分析表 (X̄-R 法)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            完整呈現標準差估計值 (1σ)、變異研究值 (6σ)、%Study Var、%Tolerance 與 %Contribution
          </p>
        </div>
        <div className="text-xs font-mono text-slate-600">
          總公差 (Tol): <strong className="text-slate-900 font-bold">{metadata.tolerance.toFixed(4)}</strong> {metadata.unit}
        </div>
      </div>

      {/* 數據明細表格 */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-2xs">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
              <th className="p-3 font-semibold">變異來源 (Source)</th>
              <th className="p-3 font-semibold">計算公式</th>
              <th className="p-3 font-semibold text-right font-mono">標準差 (1σ)</th>
              <th className="p-3 font-semibold text-right font-mono">研究變異 (6σ)</th>
              <th className="p-3 font-semibold text-right font-mono text-sky-700">%Study Var (%TV)</th>
              <th className="p-3 font-semibold text-right font-mono text-emerald-700">%Tolerance (%Tol)</th>
              <th className="p-3 font-semibold text-right font-mono text-amber-800">%Contribution (σ²)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
            {rows.map((row) => (
              <tr
                key={row.source}
                className={
                  row.highlight
                    ? 'bg-sky-50/70 font-semibold text-slate-900'
                    : 'hover:bg-slate-50/70 transition-colors'
                }
              >
                <td className="p-3 font-sans">
                  <div className="font-semibold text-slate-900">{row.source}</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    {row.desc}
                  </div>
                </td>
                <td className="p-3 text-slate-500 text-[11px] font-sans">
                  {row.formula}
                </td>
                <td className="p-3 text-right text-slate-700">
                  {row.sigma.toFixed(5)}
                </td>
                <td className="p-3 text-right font-bold text-slate-900">
                  {row.studyVar.toFixed(4)}
                </td>
                <td className="p-3 text-right font-bold text-sky-700">
                  {row.pctStudy.toFixed(2)}%
                </td>
                <td className="p-3 text-right font-bold text-emerald-700">
                  {row.pctTol.toFixed(2)}%
                </td>
                <td className="p-3 text-right text-amber-800 font-medium">
                  {row.contrib.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 因子常數與分辨力 ndc 參數卡 */}
      <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        <div>
          <span className="text-slate-500 block text-[11px] font-sans">AIAG 常數因子</span>
          <span className="text-slate-800 font-medium">
            K₁={xbarR.K1.toFixed(4)} · K₂={xbarR.K2.toFixed(4)} · K₃={xbarR.K3.toFixed(4)}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px] font-sans">無偏因子 d₂*</span>
          <span className="text-slate-800 font-medium">
            d₂*(r)={xbarR.d2Star_r.toFixed(3)} · d₂*(k)={xbarR.d2Star_k.toFixed(3)} · d₂*(n)={xbarR.d2Star_n.toFixed(3)}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px] font-sans">極差管制因子</span>
          <span className="text-slate-800 font-medium">
            D₃={xbarR.D3.toFixed(3)} · D₄={xbarR.D4.toFixed(3)} · A₂={xbarR.A2.toFixed(3)}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px] font-sans">分辨力類別 (ndc)</span>
          <span className={xbarR.ndc >= 5 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
            ndc = 1.41 × ({xbarR.PV.toFixed(4)} / {xbarR.GRR.toFixed(4)}) = {xbarR.ndc}
          </span>
        </div>
      </div>
    </div>
  );
};
