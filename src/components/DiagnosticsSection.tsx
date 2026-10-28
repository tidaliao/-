import React from 'react';
import { DiagnosticFinding } from '../types/msa';
import {
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Wrench,
  HelpCircle,
} from 'lucide-react';

interface DiagnosticsSectionProps {
  findings: DiagnosticFinding[];
}

export const DiagnosticsSection: React.FC<DiagnosticsSectionProps> = ({ findings }) => {
  const getIcon = (type: DiagnosticFinding['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'danger':
        return <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-sky-400 shrink-0" />;
    }
  };

  const getBorderColor = (type: DiagnosticFinding['type']) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 bg-emerald-950/20';
      case 'warning':
        return 'border-amber-500/30 bg-amber-950/20';
      case 'danger':
        return 'border-rose-500/30 bg-rose-950/20';
      case 'info':
      default:
        return 'border-sky-500/30 bg-sky-950/20';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              車削現場工程診斷與改善建議 (Root Cause & Action Plan)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              依據 AIAG 統計特徵，自動推導車削加工、量具機構與人員手勢之根本成因對策
            </p>
          </div>
        </div>
      </div>

      {/* 診斷列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {findings.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${getBorderColor(
              item.type
            )}`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getIcon(item.type)}
                  <h4 className="text-xs font-semibold text-slate-100">{item.title}</h4>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  {item.value}
                </span>
              </div>

              <div className="text-[11px] font-mono text-slate-400">
                指標依據：<span className="text-slate-300">{item.metric}</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* 車削加工現場合理處置對策 */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="text-[11px] font-medium text-amber-300 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                現場處置與對策建議：
              </div>
              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800/60">
                {item.recommendation}
              </p>
              <div className="text-[10px] text-slate-400 italic">
                💡 車削製程背景：{item.machiningContext}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
