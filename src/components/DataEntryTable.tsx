import React, { useState } from 'react';
import { MsaRawData, PartMetadata, XbarRResults } from '../types/msa';
import {
  ClipboardPaste,
  Download,
  Dices,
  Plus,
  Trash2,
  Users,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { generateSyntheticLatheData } from '../utils/presetData';

interface DataEntryTableProps {
  data: MsaRawData;
  metadata: PartMetadata;
  xbarR: XbarRResults;
  onUpdateData: (newData: MsaRawData) => void;
  onOpenExcelModal: () => void;
}

export const DataEntryTable: React.FC<DataEntryTableProps> = ({
  data,
  metadata,
  xbarR,
  onUpdateData,
  onOpenExcelModal,
}) => {
  const [activeCell, setActiveCell] = useState<{ op: number; part: number; trial: number } | null>(null);

  const k = data.operators.length;
  const n = data.parts.length;
  const r = data.trials;

  // 處理單一單元格更新
  const handleCellChange = (opIdx: number, partIdx: number, trialIdx: number, valStr: string) => {
    const val = parseFloat(valStr);
    const newValues = data.values.map((opArr, oI) =>
      opArr.map((partArr, pI) =>
        partArr.map((tVal, tI) => {
          if (oI === opIdx && pI === partIdx && tI === trialIdx) {
            return isNaN(val) ? 0 : val;
          }
          return tVal;
        })
      )
    );
    onUpdateData({
      ...data,
      values: newValues,
    });
  };

  // 更新作業員名稱
  const handleOperatorNameChange = (opIdx: number, newName: string) => {
    const newOperators = [...data.operators];
    newOperators[opIdx] = newName;
    onUpdateData({ ...data, operators: newOperators });
  };

  // 新增工件
  const handleAddPart = () => {
    const nextIdx = n + 1;
    const nextPartName = `工件 #${String(nextIdx).padStart(2, '0')}`;
    const newParts = [...data.parts, nextPartName];
    const newValues = data.values.map((opArr) => {
      const defaultTrials = Array(r).fill(metadata.nominal);
      return [...opArr, defaultTrials];
    });
    onUpdateData({
      ...data,
      parts: newParts,
      values: newValues,
    });
  };

  // 刪除最後一個工件
  const handleRemovePart = () => {
    if (n <= 3) return;
    const newParts = data.parts.slice(0, n - 1);
    const newValues = data.values.map((opArr) => opArr.slice(0, n - 1));
    onUpdateData({
      ...data,
      parts: newParts,
      values: newValues,
    });
  };

  // 切換次數 (2 或 3 次)
  const handleToggleTrials = (newTrialCount: number) => {
    if (newTrialCount === r) return;
    const newValues = data.values.map((opArr) =>
      opArr.map((partArr) => {
        if (newTrialCount > r) {
          const lastVal = partArr[partArr.length - 1] ?? metadata.nominal;
          return [...partArr, lastVal];
        } else {
          return partArr.slice(0, newTrialCount);
        }
      })
    );
    onUpdateData({
      ...data,
      trials: newTrialCount,
      values: newValues,
    });
  };

  // 隨機仿真產生車削數據
  const handleSimulateData = (level: 'low' | 'medium' | 'high') => {
    const synth = generateSyntheticLatheData(
      metadata.nominal,
      metadata.tolerance || metadata.usl - metadata.lsl || 0.04,
      k,
      n,
      r,
      metadata.gaugeResolution || 0.001,
      level
    );
    synth.rawData.operators = [...data.operators];
    synth.rawData.parts = [...data.parts];
    onUpdateData(synth.rawData);
  };

  // 匯出 CSV 試算表
  const handleExportCSV = () => {
    let csv = '\uFEFF';
    csv += `車削工件量測數據 (MSA AIAG 4th Edition)\r\n`;
    csv += `零件名稱,${metadata.partName},料號,${metadata.partNumber},工序,${metadata.operationName}\r\n`;
    csv += `標稱尺寸,${metadata.nominal},公差上限 USL,${metadata.usl},公差下限 LSL,${metadata.lsl}\r\n\r\n`;

    const headers: string[] = ['工件編號'];
    data.operators.forEach((op) => {
      for (let t = 1; t <= r; t++) {
        headers.push(`${op}-試驗${t}`);
      }
      headers.push(`${op}-均值(Xbar)`);
      headers.push(`${op}-極差(R)`);
    });
    headers.push('零件總均值', '零件極差Rp');
    csv += headers.join(',') + '\r\n';

    data.parts.forEach((pName, pIdx) => {
      const row: (string | number)[] = [pName];
      data.operators.forEach((_, opIdx) => {
        for (let t = 0; t < r; t++) {
          row.push(data.values[opIdx][pIdx][t].toFixed(4));
        }
        row.push(xbarR.operatorPartMeans[opIdx][pIdx].toFixed(4));
        row.push(xbarR.operatorPartRanges[opIdx][pIdx].toFixed(4));
      });
      row.push(xbarR.partMeans[pIdx].toFixed(4));
      row.push((Math.max(...data.operators.map((_, oI) => xbarR.operatorPartMeans[oI][pIdx])) -
        Math.min(...data.operators.map((_, oI) => xbarR.operatorPartMeans[oI][pIdx]))).toFixed(4));
      csv += row.join(',') + '\r\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MSA_Lathe_${metadata.partNumber || 'Data'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* 工具欄 Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <span>車削尺寸量測數據矩陣</span>
            <span className="text-xs text-slate-500 font-normal">
              Spreadsheet Data Grid (即時聯動分析)
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            直接在格子中點擊修改數值，或點擊下方按鈕貼上 Excel 表格、隨機生成擬真數據
          </p>
        </div>

        {/* 快捷操作按鈕組 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 從 Excel 貼上 */}
          <button
            onClick={onOpenExcelModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium transition-colors shadow-xs"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            從 Excel 批次貼上
          </button>

          {/* 仿真模擬下拉或直接產生 */}
          <div className="flex items-center rounded-lg bg-slate-50 border border-slate-200 p-0.5 text-xs">
            <span className="text-slate-500 px-2 flex items-center gap-1">
              <Dices className="w-3.5 h-3.5 text-amber-500" />
              模擬車削:
            </span>
            <button
              onClick={() => handleSimulateData('low')}
              className="px-2 py-1 rounded text-slate-700 hover:text-emerald-700 hover:bg-white transition-colors"
              title="生成 GRR < 10% 合格數據"
            >
              優秀
            </button>
            <button
              onClick={() => handleSimulateData('medium')}
              className="px-2 py-1 rounded text-slate-700 hover:text-amber-700 hover:bg-white transition-colors"
              title="生成 GRR 10%~30% 臨界數據"
            >
              邊緣
            </button>
            <button
              onClick={() => handleSimulateData('high')}
              className="px-2 py-1 rounded text-slate-700 hover:text-rose-700 hover:bg-white transition-colors"
              title="生成 GRR > 30% 超標數據"
            >
              超差
            </button>
          </div>

          {/* 試驗次數切換 (2次 或 3次) */}
          <div className="flex items-center rounded-lg bg-slate-50 border border-slate-200 p-0.5 text-xs">
            <span className="text-slate-500 px-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              次數:
            </span>
            <button
              onClick={() => handleToggleTrials(2)}
              className={`px-2 py-1 rounded font-mono ${
                r === 2 ? 'bg-white text-sky-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2次
            </button>
            <button
              onClick={() => handleToggleTrials(3)}
              className={`px-2 py-1 rounded font-mono ${
                r === 3 ? 'bg-white text-sky-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3次
            </button>
          </div>

          {/* 增減工件數 */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleAddPart}
              className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs transition-colors"
              title="新增第 N+1 件零件"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRemovePart}
              disabled={n <= 3}
              className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-rose-600 disabled:opacity-40 text-xs transition-colors"
              title="移除最後一件零件"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 匯出 CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            匯出 CSV
          </button>
        </div>
      </div>

      {/* 資料矩陣表格容器 */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-2xs">
        <table className="w-full border-collapse text-xs text-left">
          {/* 第 1 層表頭：作業員分組 */}
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <th className="p-3 font-semibold text-slate-800 sticky left-0 bg-slate-50 z-10 w-28 border-r border-slate-200">
                工件編號 (n={n})
              </th>
              {data.operators.map((op, opIdx) => (
                <th
                  key={opIdx}
                  colSpan={r + 2}
                  className="p-2.5 text-center font-medium border-r border-slate-200 last:border-r-0"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-sky-600" />
                    <input
                      type="text"
                      value={op}
                      onChange={(e) => handleOperatorNameChange(opIdx, e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:outline-none text-center font-semibold text-slate-900 text-xs py-0.5"
                    />
                  </div>
                </th>
              ))}
              <th colSpan={2} className="p-2.5 text-center font-medium bg-slate-100 text-slate-700">
                跨作業員基準
              </th>
            </tr>

            {/* 第 2 層表頭：試驗次數與統計指標 */}
            <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] text-slate-500">
              <th className="p-2 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 text-slate-600 font-mono">
                規格: {metadata.nominal} {metadata.unit}
              </th>
              {data.operators.map((_, opIdx) => (
                <React.Fragment key={opIdx}>
                  {Array.from({ length: r }).map((_, tIdx) => (
                    <th key={tIdx} className="p-2 text-center font-mono w-20">
                      次數 #{tIdx + 1}
                    </th>
                  ))}
                  <th className="p-2 text-center font-mono text-sky-700 bg-sky-50/60 w-20 font-semibold">
                    均值 X̄
                  </th>
                  <th className="p-2 text-center font-mono text-amber-700 bg-amber-50/60 w-20 border-r border-slate-200 font-semibold">
                    極差 R
                  </th>
                </React.Fragment>
              ))}
              <th className="p-2 text-center font-mono text-emerald-700 bg-emerald-50/50 w-22 font-semibold">
                工件均值 X̄_p
              </th>
              <th className="p-2 text-center font-mono text-purple-700 bg-purple-50/50 w-22 font-semibold">
                偏差極差 Rp
              </th>
            </tr>
          </thead>

          {/* 表格主體數據 */}
          <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
            {data.parts.map((pName, partIdx) => {
              const partMean = xbarR.partMeans[partIdx] || 0;
              const pOpMeans = data.operators.map((_, oI) => xbarR.operatorPartMeans[oI][partIdx]);
              const pOpRange = Math.max(...pOpMeans) - Math.min(...pOpMeans);

              return (
                <tr
                  key={partIdx}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* 零件列名 */}
                  <td className="p-2.5 font-medium text-slate-900 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200">
                    <span className="flex items-center justify-between">
                      <span>{pName}</span>
                      <span className="text-[10px] text-slate-400 font-normal">#{partIdx + 1}</span>
                    </span>
                  </td>

                  {/* 各作業員的每次試驗數據 */}
                  {data.operators.map((_, opIdx) => {
                    const oMean = xbarR.operatorPartMeans[opIdx][partIdx];
                    const oRange = xbarR.operatorPartRanges[opIdx][partIdx];
                    const isRangeHigh = oRange > xbarR.uclR;

                    return (
                      <React.Fragment key={opIdx}>
                        {Array.from({ length: r }).map((_, trialIdx) => {
                          const val = data.values[opIdx]?.[partIdx]?.[trialIdx] ?? 0;
                          const isFocused =
                            activeCell?.op === opIdx &&
                            activeCell?.part === partIdx &&
                            activeCell?.trial === trialIdx;

                          return (
                            <td key={trialIdx} className="p-1 text-center">
                              <input
                                type="number"
                                step="0.001"
                                value={val}
                                onFocus={() =>
                                  setActiveCell({ op: opIdx, part: partIdx, trial: trialIdx })
                                }
                                onBlur={() => setActiveCell(null)}
                                onChange={(e) =>
                                  handleCellChange(opIdx, partIdx, trialIdx, e.target.value)
                                }
                                className={`w-full text-center px-1 py-1 rounded border text-slate-900 transition-colors text-xs font-mono focus:outline-none ${
                                  isFocused
                                    ? 'border-sky-500 ring-1 ring-sky-500 bg-white shadow-2xs'
                                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                                }`}
                              />
                            </td>
                          );
                        })}

                        {/* 該作業員該工件均值 */}
                        <td className="p-2 text-center text-sky-700 font-semibold bg-sky-50/30">
                          {oMean.toFixed(3)}
                        </td>

                        {/* 該作業員該工件極差 */}
                        <td
                          className={`p-2 text-center border-r border-slate-200 ${
                            isRangeHigh
                              ? 'text-rose-600 font-bold bg-rose-50'
                              : 'text-amber-700 bg-amber-50/30 font-medium'
                          }`}
                          title={isRangeHigh ? '超出極差管制上限 UCL_R！' : undefined}
                        >
                          {oRange.toFixed(3)}
                        </td>
                      </React.Fragment>
                    );
                  })}

                  {/* 跨作業員工件總均值 */}
                  <td className="p-2 text-center font-bold text-emerald-700 bg-emerald-50/30">
                    {partMean.toFixed(3)}
                  </td>

                  {/* 工件間作業員偏差極差 */}
                  <td className="p-2 text-center font-medium text-purple-700 bg-purple-50/30">
                    {pOpRange.toFixed(3)}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* 表尾統計匯總 (各作業員總平均 X̿_i, 平均極差 R̄_i) */}
          <tfoot>
            <tr className="bg-slate-50 border-t-2 border-slate-300 font-mono font-semibold text-slate-800">
              <td className="p-2.5 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 text-sky-700 font-bold">
                作業員匯總 (X̿_i / R̄_i)
              </td>
              {data.operators.map((_, opIdx) => {
                const opAvg = xbarR.operatorMeans[opIdx];
                const opRbar = xbarR.operatorRanges[opIdx];
                return (
                  <React.Fragment key={opIdx}>
                    <td colSpan={r} className="p-2 text-right text-slate-500 text-[11px] font-sans">
                      均值/極差:
                    </td>
                    <td className="p-2 text-center text-sky-700 bg-sky-50 font-bold">
                      {opAvg.toFixed(4)}
                    </td>
                    <td className="p-2 text-center text-amber-700 bg-amber-50 border-r border-slate-200 font-bold">
                      {opRbar.toFixed(4)}
                    </td>
                  </React.Fragment>
                );
              })}
              <td className="p-2 text-center text-emerald-700 bg-emerald-50 font-bold">
                X̿={xbarR.overallMean.toFixed(4)}
              </td>
              <td className="p-2 text-center text-amber-700 bg-amber-50 font-bold">
                R̄={xbarR.overallMeanRange.toFixed(4)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>鍵盤提示：直接在輸入框輸入數值，Enter 或 Tab 換格。</span>
        </div>
        <div>
          <span>作業員均值極差 X_diff: </span>
          <strong className="text-slate-800 font-mono font-medium">
            {xbarR.xDiff.toFixed(4)} {metadata.unit}
          </strong>
        </div>
      </div>
    </div>
  );
};
