import React, { useState } from 'react';
import { MsaRawData, PartMetadata, XbarRResults } from '../types/msa';

interface MsaChartsProps {
  data: MsaRawData;
  metadata: PartMetadata;
  xbarR: XbarRResults;
}

export const MsaCharts: React.FC<MsaChartsProps> = ({ data, metadata, xbarR }) => {
  const [activeTab, setActiveTab] = useState<'xbar' | 'range' | 'components' | 'parts' | 'interaction'>('xbar');

  // 白底專用高對比色彩
  const operatorColors = [
    '#0284c7', // sky-600
    '#059669', // emerald-600
    '#d97706', // amber-600
    '#db2777', // pink-600
    '#7c3aed', // purple-600
  ];

  const n = data.parts.length;
  const k = data.operators.length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* Chart Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <span>MSA 統計製程與管制圖表</span>
            <span className="text-xs text-slate-500 font-normal">
              AIAG 4th Edition 視覺化分析
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            即時計算管制界限 (UCL/LCL)、變異成分與人員/工件交互作用分佈
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('xbar')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'xbar'
                ? 'bg-white text-sky-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            均值圖 (X̄-bar)
          </button>
          <button
            onClick={() => setActiveTab('range')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'range'
                ? 'bg-white text-sky-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            極差圖 (R-Chart)
          </button>
          <button
            onClick={() => setActiveTab('components')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'components'
                ? 'bg-white text-sky-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            變異成分 (%Var)
          </button>
          <button
            onClick={() => setActiveTab('parts')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'parts'
                ? 'bg-white text-sky-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            工件散佈圖
          </button>
          <button
            onClick={() => setActiveTab('interaction')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'interaction'
                ? 'bg-white text-sky-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            交互作用圖
          </button>
        </div>
      </div>

      {/* Chart Content Area */}
      <div className="pt-2">
        {activeTab === 'xbar' && (
          <XbarChart
            data={data}
            xbarR={xbarR}
            colors={operatorColors}
            metadata={metadata}
          />
        )}
        {activeTab === 'range' && (
          <RangeChart
            data={data}
            xbarR={xbarR}
            colors={operatorColors}
          />
        )}
        {activeTab === 'components' && (
          <ComponentsChart xbarR={xbarR} />
        )}
        {activeTab === 'parts' && (
          <PartScatterChart
            data={data}
            metadata={metadata}
            xbarR={xbarR}
            colors={operatorColors}
          />
        )}
        {activeTab === 'interaction' && (
          <InteractionChart
            data={data}
            xbarR={xbarR}
            colors={operatorColors}
          />
        )}
      </div>

      {/* Legend & Operator Key */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-slate-700">作業員圖例:</span>
          {data.operators.map((op, idx) => (
            <div key={op} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-xs inline-block"
                style={{ backgroundColor: operatorColors[idx % operatorColors.length] }}
              />
              <span className="text-slate-800 font-mono font-medium">{op}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-slate-500">
            零件數 (n): <strong className="text-slate-800">{n}</strong>
          </span>
          <span>·</span>
          <span className="text-slate-500">
            人員數 (k): <strong className="text-slate-800">{k}</strong>
          </span>
          <span>·</span>
          <span className="text-slate-500">
            試驗次數 (r): <strong className="text-slate-800">{data.trials}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

// 1. X-bar 均值管制圖
const XbarChart: React.FC<{
  data: MsaRawData;
  xbarR: XbarRResults;
  colors: string[];
  metadata: PartMetadata;
}> = ({ data, xbarR, colors }) => {
  const n = data.parts.length;
  const k = data.operators.length;

  let allVals: number[] = [xbarR.uclXbar, xbarR.lclXbar, xbarR.overallMean];
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < n; j++) {
      allVals.push(xbarR.operatorPartMeans[i][j]);
    }
  }
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const span = Math.max(0.001, maxVal - minVal);
  const yPad = span * 0.15;
  const yMin = minVal - yPad;
  const yMax = maxVal + yPad;

  const width = 800;
  const height = 340;
  const padLeft = 85;
  const padRight = 80;
  const padTop = 35;
  const padBottom = 50;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const scaleX = (partIdx: number) => padLeft + (partIdx / (Math.max(1, n - 1))) * chartW;
  const scaleY = (val: number) => padTop + chartH - ((val - yMin) / (yMax - yMin)) * chartH;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
        <div>
          <span className="text-slate-900 font-semibold">均值圖 (X̄ by Operator & Part)</span>
          <span className="mx-2 text-slate-300">|</span>
          <span className="text-slate-600">
            管制界限由設備重複性決定。
            <strong className="text-emerald-700 ml-1">
              目標：多數零件點 (&gt;50%) 應落在管制界限外
            </strong>
            ，代表量具能靈敏感知工件間尺寸差異。
          </span>
        </div>
        <div className="font-mono text-emerald-700 font-semibold">
          超限比率: {xbarR.pctOutOfControlXbar.toFixed(1)}% ({xbarR.pctOutOfControlXbar >= 50 ? '合格達標' : '待加強'})
        </div>
      </div>

      <div className="w-full overflow-x-auto bg-white rounded-lg p-2 border border-slate-200 shadow-2xs">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[700px] h-auto font-sans"
        >
          {/* 背景輔助格線 */}
          <line
            x1={padLeft}
            y1={scaleY(xbarR.uclXbar)}
            x2={width - padRight}
            y2={scaleY(xbarR.uclXbar)}
            stroke="#e11d48"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <text
            x={width - padRight + 6}
            y={scaleY(xbarR.uclXbar) + 4}
            fill="#e11d48"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            UCL: {xbarR.uclXbar.toFixed(4)}
          </text>

          <line
            x1={padLeft}
            y1={scaleY(xbarR.overallMean)}
            x2={width - padRight}
            y2={scaleY(xbarR.overallMean)}
            stroke="#0284c7"
            strokeWidth="1.5"
          />
          <text
            x={width - padRight + 6}
            y={scaleY(xbarR.overallMean) + 4}
            fill="#0284c7"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            X̿: {xbarR.overallMean.toFixed(4)}
          </text>

          <line
            x1={padLeft}
            y1={scaleY(xbarR.lclXbar)}
            x2={width - padRight}
            y2={scaleY(xbarR.lclXbar)}
            stroke="#e11d48"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <text
            x={width - padRight + 6}
            y={scaleY(xbarR.lclXbar) + 4}
            fill="#e11d48"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            LCL: {xbarR.lclXbar.toFixed(4)}
          </text>

          {/* Y 軸刻度 */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft}
            y2={height - padBottom}
            stroke="#cbd5e1"
          />
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const v = yMin + pct * (yMax - yMin);
            const y = scaleY(v);
            return (
              <g key={pct}>
                <line x1={padLeft - 4} y1={y} x2={padLeft} y2={y} stroke="#94a3b8" />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {v.toFixed(3)}
                </text>
              </g>
            );
          })}

          {/* X 軸零件刻度 */}
          <line
            x1={padLeft}
            y1={height - padBottom}
            x2={width - padRight}
            y2={height - padBottom}
            stroke="#cbd5e1"
          />
          {data.parts.map((p, idx) => {
            const x = scaleX(idx);
            return (
              <g key={p}>
                <line
                  x1={x}
                  y1={height - padBottom}
                  x2={x}
                  y2={height - padBottom + 4}
                  stroke="#94a3b8"
                />
                <text
                  x={x}
                  y={height - padBottom + 18}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  P{idx + 1}
                </text>
              </g>
            );
          })}

          {/* 各作業員均值連線與數據點 */}
          {data.operators.map((_, opIdx) => {
            const points = data.parts.map((_, partIdx) => {
              const x = scaleX(partIdx);
              const y = scaleY(xbarR.operatorPartMeans[opIdx][partIdx]);
              return `${x},${y}`;
            });
            const polylineStr = points.join(' ');
            const color = colors[opIdx % colors.length];

            return (
              <g key={opIdx}>
                <polyline
                  points={polylineStr}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                {data.parts.map((_, partIdx) => {
                  const val = xbarR.operatorPartMeans[opIdx][partIdx];
                  const x = scaleX(partIdx);
                  const y = scaleY(val);
                  const isOutOfLimits = val > xbarR.uclXbar || val < xbarR.lclXbar;

                  return (
                    <circle
                      key={partIdx}
                      cx={x}
                      cy={y}
                      r={isOutOfLimits ? 4.5 : 3}
                      fill={isOutOfLimits ? '#059669' : color}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

// 2. R 極差管制圖
const RangeChart: React.FC<{
  data: MsaRawData;
  xbarR: XbarRResults;
  colors: string[];
}> = ({ data, xbarR, colors }) => {
  const n = data.parts.length;
  const k = data.operators.length;

  let allRanges = [xbarR.uclR, xbarR.overallMeanRange, 0];
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < n; j++) {
      allRanges.push(xbarR.operatorPartRanges[i][j]);
    }
  }
  const maxR = Math.max(...allRanges);
  const yMax = Math.max(0.005, maxR * 1.25);
  const yMin = 0;

  const width = 800;
  const height = 320;
  const padLeft = 85;
  const padRight = 80;
  const padTop = 30;
  const padBottom = 50;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const scaleX = (partIdx: number) => padLeft + (partIdx / Math.max(1, n - 1)) * chartW;
  const scaleY = (val: number) => padTop + chartH - ((val - yMin) / (yMax - yMin)) * chartH;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
        <div>
          <span className="text-slate-900 font-semibold">極差圖 (R-Chart by Operator)</span>
          <span className="mx-2 text-slate-300">|</span>
          <span>
            檢視各作業員多次量測的波動重複性。
            <strong className="text-amber-700 ml-1">
              所有點均應落在 UCL_R 之下
            </strong>
            。
          </span>
        </div>
        <div className="font-mono text-xs">
          超限點數:{' '}
          <span
            className={
              xbarR.rangesOutOfControlCount === 0
                ? 'text-emerald-700 font-bold'
                : 'text-rose-600 font-bold'
            }
          >
            {xbarR.rangesOutOfControlCount}
          </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto bg-white rounded-lg p-2 border border-slate-200 shadow-2xs">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[700px] h-auto font-sans"
        >
          {/* UCL_R */}
          <line
            x1={padLeft}
            y1={scaleY(xbarR.uclR)}
            x2={width - padRight}
            y2={scaleY(xbarR.uclR)}
            stroke="#e11d48"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <text
            x={width - padRight + 6}
            y={scaleY(xbarR.uclR) + 4}
            fill="#e11d48"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            UCL: {xbarR.uclR.toFixed(4)}
          </text>

          {/* R_bar */}
          <line
            x1={padLeft}
            y1={scaleY(xbarR.overallMeanRange)}
            x2={width - padRight}
            y2={scaleY(xbarR.overallMeanRange)}
            stroke="#0284c7"
            strokeWidth="1.5"
          />
          <text
            x={width - padRight + 6}
            y={scaleY(xbarR.overallMeanRange) + 4}
            fill="#0284c7"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            R̄: {xbarR.overallMeanRange.toFixed(4)}
          </text>

          {/* Y 軸刻度 */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft}
            y2={height - padBottom}
            stroke="#cbd5e1"
          />
          {[0, 0.33, 0.66, 1].map((pct) => {
            const v = yMin + pct * (yMax - yMin);
            const y = scaleY(v);
            return (
              <g key={pct}>
                <line x1={padLeft - 4} y1={y} x2={padLeft} y2={y} stroke="#94a3b8" />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {v.toFixed(4)}
                </text>
              </g>
            );
          })}

          {/* X 軸零件刻度 */}
          <line
            x1={padLeft}
            y1={height - padBottom}
            x2={width - padRight}
            y2={height - padBottom}
            stroke="#cbd5e1"
          />
          {data.parts.map((p, idx) => {
            const x = scaleX(idx);
            return (
              <g key={p}>
                <line
                  x1={x}
                  y1={height - padBottom}
                  x2={x}
                  y2={height - padBottom + 4}
                  stroke="#94a3b8"
                />
                <text
                  x={x}
                  y={height - padBottom + 18}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  P{idx + 1}
                </text>
              </g>
            );
          })}

          {/* 連線 */}
          {data.operators.map((_, opIdx) => {
            const points = data.parts.map((_, partIdx) => {
              const x = scaleX(partIdx);
              const y = scaleY(xbarR.operatorPartRanges[opIdx][partIdx]);
              return `${x},${y}`;
            });
            const polylineStr = points.join(' ');
            const color = colors[opIdx % colors.length];

            return (
              <g key={opIdx}>
                <polyline
                  points={polylineStr}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                {data.parts.map((_, partIdx) => {
                  const val = xbarR.operatorPartRanges[opIdx][partIdx];
                  const x = scaleX(partIdx);
                  const y = scaleY(val);
                  const isOut = val > xbarR.uclR;

                  return (
                    <circle
                      key={partIdx}
                      cx={x}
                      cy={y}
                      r={isOut ? 5 : 3}
                      fill={isOut ? '#e11d48' : color}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

// 3. 變異成分條形圖 (Components of Variation)
const ComponentsChart: React.FC<{ xbarR: XbarRResults }> = ({ xbarR }) => {
  const items = [
    {
      name: '量具總 R&R (GRR)',
      pctStudy: xbarR.pctGRR,
      pctTol: xbarR.pctTolGRR,
      contrib: xbarR.contribGRR,
      color:
        xbarR.pctGRR < 10
          ? '#059669'
          : xbarR.pctGRR <= 30
          ? '#d97706'
          : '#e11d48',
    },
    {
      name: '重複性 (EV / 設備)',
      pctStudy: xbarR.pctEV,
      pctTol: xbarR.pctTolEV,
      contrib: xbarR.contribEV,
      color: '#0284c7',
    },
    {
      name: '再現性 (AV / 人員)',
      pctStudy: xbarR.pctAV,
      pctTol: xbarR.pctTolAV,
      contrib: xbarR.contribAV,
      color: '#7c3aed',
    },
    {
      name: '零件變異 (PV / 工件)',
      pctStudy: xbarR.pctPV,
      pctTol: xbarR.pctTolPV,
      contrib: xbarR.contribPV,
      color: '#0d9488',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-600">
        AIAG 評估核心標準：<span className="text-emerald-700 font-semibold">&lt;10% 為合格</span>；
        <span className="text-amber-700 font-semibold">10%~30% 為條件接受</span>；
        <span className="text-rose-700 font-semibold">&gt;30% 為不可接受</span>。
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* % Study Variation 與 % Tolerance */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
            <span>變異研究百分比 (% Study Var vs % Tol)</span>
            <span className="text-slate-500 font-mono">10% / 30% 臨界值</span>
          </div>

          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-800 font-medium">{it.name}</span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-slate-500">
                      %TV: <strong className="text-slate-800">{it.pctStudy.toFixed(1)}%</strong>
                    </span>
                    <span className="text-slate-500">
                      %Tol: <strong className="text-slate-800">{it.pctTol.toFixed(1)}%</strong>
                    </span>
                  </div>
                </div>

                <div className="relative h-4 bg-slate-100 rounded overflow-hidden">
                  {/* 10% 參考線 */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-emerald-600 z-10"
                    style={{ left: '10%' }}
                    title="10% 合格上限"
                  />
                  {/* 30% 參考線 */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-rose-600 z-10"
                    style={{ left: '30%' }}
                    title="30% 警戒上限"
                  />

                  {/* 條形 */}
                  <div
                    className="h-full rounded-r transition-all"
                    style={{
                      width: `${Math.min(100, it.pctStudy)}%`,
                      backgroundColor: it.color,
                      opacity: 0.9,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-mono">
            <span>0%</span>
            <span className="text-emerald-700 font-semibold">10% 合格</span>
            <span className="text-rose-700 font-semibold">30% 警戒</span>
            <span>100%</span>
          </div>
        </div>

        {/* % Contribution (方差貢獻率) */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
            <span>方差貢獻率 (% Contribution)</span>
            <span className="text-slate-500 font-mono">σ² 比率</span>
          </div>

          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-800">{it.name}</span>
                  <span className="font-mono text-slate-900 font-semibold text-[11px]">
                    {it.contrib.toFixed(2)}%
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width: `${Math.min(100, it.contrib)}%`,
                      backgroundColor: it.color,
                      opacity: 0.85,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <span className="text-slate-800 font-semibold">備註：</span>
            %Contribution 是以變異方差（σ²）為基底計算，而 %Study Var 則以標準差（6σ）為基底。
            AIAG 4th Edition 標準評定通常依據 <span className="text-sky-700 font-mono font-semibold">%Study Var (%GRR)</span>。
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. 工件尺寸散佈圖 (Part Run Chart)
const PartScatterChart: React.FC<{
  data: MsaRawData;
  metadata: PartMetadata;
  xbarR: XbarRResults;
  colors: string[];
}> = ({ data, metadata, xbarR, colors }) => {
  const n = data.parts.length;
  const k = data.operators.length;
  const r = data.trials;

  let allVals: number[] = [metadata.usl, metadata.lsl, metadata.nominal];
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < n; j++) {
      for (let t = 0; t < r; t++) {
        allVals.push(data.values[i][j][t]);
      }
    }
  }

  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const span = Math.max(0.001, maxVal - minVal);
  const yMin = minVal - span * 0.1;
  const yMax = maxVal + span * 0.1;

  const width = 800;
  const height = 320;
  const padLeft = 85;
  const padRight = 80;
  const padTop = 30;
  const padBottom = 50;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const scaleX = (partIdx: number) => padLeft + (partIdx / Math.max(1, n - 1)) * chartW;
  const scaleY = (val: number) => padTop + chartH - ((val - yMin) / (yMax - yMin)) * chartH;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
        <div>
          <span className="text-slate-900 font-semibold">各工件實際量測值散佈圖 (By Part)</span>
          <span className="mx-2 text-slate-300">|</span>
          <span>呈現 10 件車削工件所有量測點的分佈範圍與零件均值趨勢</span>
        </div>
        <div className="font-mono text-slate-600 text-xs font-medium">
          公差規格: [{metadata.lsl.toFixed(3)}, {metadata.usl.toFixed(3)}] {metadata.unit}
        </div>
      </div>

      <div className="w-full overflow-x-auto bg-white rounded-lg p-2 border border-slate-200 shadow-2xs">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[700px] h-auto font-sans"
        >
          {/* USL */}
          <line
            x1={padLeft}
            y1={scaleY(metadata.usl)}
            x2={width - padRight}
            y2={scaleY(metadata.usl)}
            stroke="#e11d48"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          <text
            x={width - padRight + 6}
            y={scaleY(metadata.usl) + 4}
            fill="#e11d48"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            USL: {metadata.usl.toFixed(3)}
          </text>

          {/* LSL */}
          <line
            x1={padLeft}
            y1={scaleY(metadata.lsl)}
            x2={width - padRight}
            y2={scaleY(metadata.lsl)}
            stroke="#e11d48"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          <text
            x={width - padRight + 6}
            y={scaleY(metadata.lsl) + 4}
            fill="#e11d48"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            LSL: {metadata.lsl.toFixed(3)}
          </text>

          {/* X 軸與 Y 軸 */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft}
            y2={height - padBottom}
            stroke="#cbd5e1"
          />
          <line
            x1={padLeft}
            y1={height - padBottom}
            x2={width - padRight}
            y2={height - padBottom}
            stroke="#cbd5e1"
          />

          {/* 零件刻度 */}
          {data.parts.map((p, idx) => {
            const x = scaleX(idx);
            return (
              <g key={p}>
                <line
                  x1={x}
                  y1={height - padBottom}
                  x2={x}
                  y2={height - padBottom + 4}
                  stroke="#94a3b8"
                />
                <text
                  x={x}
                  y={height - padBottom + 18}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  P{idx + 1}
                </text>
              </g>
            );
          })}

          {/* 各工件零件總均值連線 */}
          {(() => {
            const meanPoints = xbarR.partMeans.map((mean, idx) => `${scaleX(idx)},${scaleY(mean)}`).join(' ');
            return (
              <polyline
                points={meanPoints}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            );
          })()}

          {/* 繪製各量測點 */}
          {data.operators.map((_, opIdx) => {
            const opOffset = (opIdx - (k - 1) / 2) * 5;
            const color = colors[opIdx % colors.length];

            return (
              <g key={opIdx}>
                {data.parts.map((_, partIdx) => {
                  const x = scaleX(partIdx) + opOffset;
                  return data.values[opIdx][partIdx].map((val, tIdx) => (
                    <circle
                      key={`${partIdx}-${tIdx}`}
                      cx={x}
                      cy={scaleY(val)}
                      r="3"
                      fill={color}
                      fillOpacity="0.85"
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                  ));
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

// 5. 人員與工件交互作用圖 (Operator * Part Interaction)
const InteractionChart: React.FC<{
  data: MsaRawData;
  xbarR: XbarRResults;
  colors: string[];
}> = ({ data, xbarR, colors }) => {
  const n = data.parts.length;
  const k = data.operators.length;

  let allMeans: number[] = [];
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < n; j++) {
      allMeans.push(xbarR.operatorPartMeans[i][j]);
    }
  }

  const minVal = Math.min(...allMeans);
  const maxVal = Math.max(...allMeans);
  const span = Math.max(0.001, maxVal - minVal);
  const yMin = minVal - span * 0.1;
  const yMax = maxVal + span * 0.1;

  const width = 800;
  const height = 320;
  const padLeft = 85;
  const padRight = 80;
  const padTop = 30;
  const padBottom = 50;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const scaleX = (partIdx: number) => padLeft + (partIdx / Math.max(1, n - 1)) * chartW;
  const scaleY = (val: number) => padTop + chartH - ((val - yMin) / (yMax - yMin)) * chartH;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
        <div>
          <span className="text-slate-900 font-semibold">
            人員與工件交互作用圖 (Operator × Part Interaction)
          </span>
          <span className="mx-2 text-slate-300">|</span>
          <span>
            若各作業員連線趨於平行，代表無顯著交互作用；若線條大量交叉，代表某些作業員對特定形體工件有習慣性量測偏差。
          </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto bg-white rounded-lg p-2 border border-slate-200 shadow-2xs">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[700px] h-auto font-sans"
        >
          {/* Y 軸與 X 軸 */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft}
            y2={height - padBottom}
            stroke="#cbd5e1"
          />
          <line
            x1={padLeft}
            y1={height - padBottom}
            x2={width - padRight}
            y2={height - padBottom}
            stroke="#cbd5e1"
          />

          {/* 零件刻度 */}
          {data.parts.map((p, idx) => {
            const x = scaleX(idx);
            return (
              <g key={p}>
                <line
                  x1={x}
                  y1={height - padBottom}
                  x2={x}
                  y2={height - padBottom + 4}
                  stroke="#94a3b8"
                />
                <text
                  x={x}
                  y={height - padBottom + 18}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  P{idx + 1}
                </text>
              </g>
            );
          })}

          {/* 各作業員折線 */}
          {data.operators.map((_, opIdx) => {
            const points = data.parts.map((_, partIdx) => {
              const x = scaleX(partIdx);
              const y = scaleY(xbarR.operatorPartMeans[opIdx][partIdx]);
              return `${x},${y}`;
            });
            const polylineStr = points.join(' ');
            const color = colors[opIdx % colors.length];

            return (
              <g key={opIdx}>
                <polyline
                  points={polylineStr}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {data.parts.map((_, partIdx) => (
                  <circle
                    key={partIdx}
                    cx={scaleX(partIdx)}
                    cy={scaleY(xbarR.operatorPartMeans[opIdx][partIdx])}
                    r="3.5"
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
