import React from 'react';
import { AnovaResults, PartMetadata } from '../types/msa';
import { Split, Info } from 'lucide-react';

interface AnovaTableProps {
  anova: AnovaResults;
  metadata: PartMetadata;
}

export const AnovaTable: React.FC<AnovaTableProps> = ({ anova, metadata }) => {
  const isInteractionSig = anova.pInteraction < 0.05;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Split className="w-4 h-4 text-emerald-400" />
            <span>Two-Way ANOVA 雙因子方差分析表</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            現代品質工程與 Minitab 相容之高級方差分析（含人員與工件交互作用顯著性檢定）
          </p>
        </div>
        <div className="text-xs font-mono">
          交互作用檢定:{' '}
          <span className={isInteractionSig ? 'text-amber-400 font-bold' : 'text-slate-300'}>
            p = {anova.pInteraction.toFixed(4)} ({isInteractionSig ? '交互作用顯著' : '無顯著交互作用'})
          </span>
        </div>
      </div>

      {/* ANOVA 表格 */}
      <div className="overflow-x-auto border border-slate-800 rounded-lg">
        <table className="w-full text-xs text-left border-collapse font-mono">
          <thead>
            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] font-sans">
              <th className="p-3 font-medium">變異來源 (Source)</th>
              <th className="p-3 text-right font-medium">自由度 (DF)</th>
              <th className="p-3 text-right font-medium">平方和 (SS)</th>
              <th className="p-3 text-right font-medium">均方 (MS)</th>
              <th className="p-3 text-right font-medium">F 檢定統計量</th>
              <th className="p-3 text-right font-medium">p-value</th>
              <th className="p-3 text-right font-medium text-emerald-400">方差分量 (Var)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-300">
            {/* 零件 Part */}
            <tr className="hover:bg-slate-800/30">
              <td className="p-3 font-sans font-medium text-slate-200">
                零件間 (Parts)
              </td>
              <td className="p-3 text-right text-slate-400">{anova.dfPart}</td>
              <td className="p-3 text-right">{anova.ssPart.toFixed(5)}</td>
              <td className="p-3 text-right text-slate-200">{anova.msPart.toFixed(5)}</td>
              <td className="p-3 text-right font-bold text-sky-400">{anova.fPart.toFixed(2)}</td>
              <td className="p-3 text-right text-slate-300">
                {anova.pPart < 0.001 ? '<0.001' : anova.pPart.toFixed(3)}
              </td>
              <td className="p-3 text-right text-emerald-400">{anova.varPart.toFixed(6)}</td>
            </tr>

            {/* 評價人員 Appraiser / Operator */}
            <tr className="hover:bg-slate-800/30">
              <td className="p-3 font-sans font-medium text-slate-200">
                作業員間 (Operators)
              </td>
              <td className="p-3 text-right text-slate-400">{anova.dfOperator}</td>
              <td className="p-3 text-right">{anova.ssOperator.toFixed(5)}</td>
              <td className="p-3 text-right text-slate-200">{anova.msOperator.toFixed(5)}</td>
              <td className="p-3 text-right font-bold text-sky-400">{anova.fOperator.toFixed(2)}</td>
              <td className="p-3 text-right text-slate-300">
                {anova.pOperator < 0.001 ? '<0.001' : anova.pOperator.toFixed(3)}
              </td>
              <td className="p-3 text-right text-emerald-400">{anova.varOperator.toFixed(6)}</td>
            </tr>

            {/* 交互作用 Part * Operator */}
            <tr className="hover:bg-slate-800/30">
              <td className="p-3 font-sans text-slate-300">
                人員 × 零件交互 (Part × Op)
              </td>
              <td className="p-3 text-right text-slate-400">{anova.dfInteraction}</td>
              <td className="p-3 text-right">{anova.ssInteraction.toFixed(5)}</td>
              <td className="p-3 text-right text-slate-200">{anova.msInteraction.toFixed(5)}</td>
              <td className="p-3 text-right text-slate-300">{anova.fInteraction.toFixed(2)}</td>
              <td className="p-3 text-right text-slate-300">
                {anova.pInteraction < 0.001 ? '<0.001' : anova.pInteraction.toFixed(3)}
              </td>
              <td className="p-3 text-right text-emerald-400">{anova.varInteraction.toFixed(6)}</td>
            </tr>

            {/* 重複性 / 誤差 Repeatability */}
            <tr className="hover:bg-slate-800/30">
              <td className="p-3 font-sans text-slate-300">
                重複性 / 隨機誤差 (Repeatability)
              </td>
              <td className="p-3 text-right text-slate-400">{anova.dfRepeatability}</td>
              <td className="p-3 text-right">{anova.ssRepeatability.toFixed(5)}</td>
              <td className="p-3 text-right text-slate-200">{anova.msRepeatability.toFixed(5)}</td>
              <td className="p-3 text-right text-slate-500">—</td>
              <td className="p-3 text-right text-slate-500">—</td>
              <td className="p-3 text-right text-emerald-400">{anova.varRepeatability.toFixed(6)}</td>
            </tr>

            {/* 合計 Total */}
            <tr className="bg-slate-950 font-bold text-slate-200">
              <td className="p-3 font-sans">總計 (Total)</td>
              <td className="p-3 text-right text-slate-400">{anova.dfTotal}</td>
              <td className="p-3 text-right">{anova.ssTotal.toFixed(5)}</td>
              <td className="p-3 text-right text-slate-500">—</td>
              <td className="p-3 text-right text-slate-500">—</td>
              <td className="p-3 text-right text-slate-500">—</td>
              <td className="p-3 text-right text-emerald-400">{anova.varTotal.toFixed(6)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ANOVA 結論摘要 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[11px] font-sans">ANOVA GRR (6σ)</span>
          <span className="text-slate-100 font-bold text-sm">
            {anova.grrAnova.toFixed(4)} {metadata.unit}
          </span>
          <span className="text-[11px] text-sky-400 block mt-0.5">
            %Study Var = {anova.pctGrrAnovaStudy.toFixed(2)}%
          </span>
        </div>

        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[11px] font-sans">ANOVA 佔公差 (%Tol)</span>
          <span className="text-slate-100 font-bold text-sm">
            {anova.pctGrrAnovaTol.toFixed(2)}%
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            公差帶: {metadata.tolerance.toFixed(4)} {metadata.unit}
          </span>
        </div>

        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[11px] font-sans">ANOVA 分辨力類別 (ndc)</span>
          <span
            className={`font-bold text-sm ${
              anova.ndcAnova >= 5 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {anova.ndcAnova} 組
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {anova.ndcAnova >= 5 ? '分辨力充足 (≥5)' : '分辨力不足 (<5)'}
          </span>
        </div>
      </div>
    </div>
  );
};
