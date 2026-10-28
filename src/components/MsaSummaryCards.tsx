import React from 'react';
import { PartMetadata, XbarRResults } from '../types/msa';
import { CheckCircle2, AlertTriangle, XCircle, Gauge, Activity, Layers, Crosshair } from 'lucide-react';

interface MsaSummaryCardsProps {
  xbarR: XbarRResults;
  metadata: PartMetadata;
}

export const MsaSummaryCards: React.FC<MsaSummaryCardsProps> = ({ xbarR, metadata }) => {
  // 決定狀態視覺風格
  const getStatusBadge = () => {
    if (xbarR.grrStatus === 'acceptable') {
      return {
        bg: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
        label: '量測系統合格 (Acceptable)',
        sub: '依據 AIAG MSA 4th: %GRR < 10%，變異極小，完全勝任製程管制。',
      };
    } else if (xbarR.grrStatus === 'marginal') {
      return {
        bg: 'bg-amber-950/60 border-amber-500/40 text-amber-400',
        icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
        label: '條件性接受 (Marginal / Conditional)',
        sub: '依據 AIAG MSA 4th: 10% ≤ %GRR ≤ 30%，需評估工件公差等級與改善成本。',
      };
    } else {
      return {
        bg: 'bg-rose-950/60 border-rose-500/40 text-rose-400',
        icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
        label: '不合格不可接受 (Unacceptable)',
        sub: '依據 AIAG MSA 4th: %GRR > 30%，量測波動過大，必須停用並實施改進。',
      };
    }
  };

  const status = getStatusBadge();

  return (
    <div className="space-y-3">
      {/* 總結性大橫幅 (AIAG 判定結論) */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${status.bg}`}>
        <div className="flex items-start gap-3">
          {status.icon}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base tracking-wide text-slate-100">
                {status.label}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700/60 font-mono text-slate-200">
                %GRR = {xbarR.pctGRR.toFixed(2)}% · %Tol = {xbarR.pctTolGRR.toFixed(2)}%
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {status.sub}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">工件公差 (Tol)</div>
            <div className="text-slate-100 font-bold">
              ±{((metadata.tolerance || 0.04) / 2).toFixed(3)} {metadata.unit}
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">量具解析度</div>
            <div className="text-slate-100 font-bold">
              {metadata.gaugeResolution} {metadata.unit}
            </div>
          </div>
        </div>
      </div>

      {/* 4 個核心計量指標卡 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 卡片 1: %GRR */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-sky-400" />
              %GRR (量具變異比率)
            </span>
            <span className="text-[11px] text-slate-500 font-mono">%Study Var</span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-slate-100">
              {xbarR.pctGRR.toFixed(2)}
              <span className="text-sm font-normal text-slate-400 ml-1">%</span>
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              GRR = {xbarR.GRR.toFixed(4)} {metadata.unit}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] flex items-center justify-between text-slate-400">
            <span>佔公差 (%Tol):</span>
            <span className="font-mono font-medium text-slate-200">
              {xbarR.pctTolGRR.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* 卡片 2: 分辨力類別數 ndc */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-emerald-400" />
              分辨力類別數 (ndc)
            </span>
            <span className="text-[11px] text-slate-500 font-mono">1.41 × PV/GRR</span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <div
                className={`text-2xl font-bold font-mono ${
                  xbarR.ndc >= 5 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {xbarR.ndc}
              </div>
              <span className="text-xs text-slate-400">組</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {xbarR.ndc >= 5 ? (
                <span className="text-emerald-400">達標 (≥ 5，可分辨零件)</span>
              ) : (
                <span className="text-rose-400 font-medium">警告 (&lt; 5，解析度不足)</span>
              )}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] flex items-center justify-between text-slate-400">
            <span>零件間變異 (PV):</span>
            <span className="font-mono font-medium text-slate-200">
              {xbarR.PV.toFixed(4)} {metadata.unit}
            </span>
          </div>
        </div>

        {/* 卡片 3: 重複性 (EV) vs 再現性 (AV) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              變異組成 (EV vs AV)
            </span>
            <span className="text-[11px] text-slate-500 font-mono">設備 vs 人員</span>
          </div>
          <div className="my-2 space-y-1 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">重複性 EV (設備):</span>
              <span className="font-bold text-slate-200">
                {xbarR.pctEV.toFixed(1)}%{' '}
                <span className="text-[10px] text-slate-400">({xbarR.EV.toFixed(4)})</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">再現性 AV (人員):</span>
              <span className="font-bold text-slate-200">
                {xbarR.pctAV.toFixed(1)}%{' '}
                <span className="text-[10px] text-slate-400">({xbarR.AV.toFixed(4)})</span>
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] flex items-center justify-between text-slate-400">
            <span>主導變異源:</span>
            <span className="font-medium text-sky-400">
              {xbarR.EV >= xbarR.AV ? '設備重複性 (EV)' : '作業員手勢 (AV)'}
            </span>
          </div>
        </div>

        {/* 卡片 4: 管制圖靈敏度指標 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-400" />
              管制圖判讀檢驗
            </span>
            <span className="text-[11px] text-slate-500 font-mono">X̄-R 界限</span>
          </div>
          <div className="my-2 space-y-1 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">均值圖超限比率:</span>
              <span
                className={`font-bold ${
                  xbarR.pctOutOfControlXbar >= 50 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {xbarR.pctOutOfControlXbar.toFixed(0)}% (目標 ≥50%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">極差圖失控點:</span>
              <span
                className={`font-bold ${
                  xbarR.rangesOutOfControlCount === 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {xbarR.rangesOutOfControlCount} 點 (目標 0)
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] flex items-center justify-between text-slate-400">
            <span>製程總變異 (TV):</span>
            <span className="font-mono font-medium text-slate-200">
              {xbarR.TV.toFixed(4)} {metadata.unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
