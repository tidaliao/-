import React, { useState } from 'react';
import { PartMetadata } from '../types/msa';
import {
  Cog,
  Sliders,
  Calendar,
  Ruler,
  Check,
  Building2,
  FileText,
} from 'lucide-react';

interface PartInfoCardProps {
  metadata: PartMetadata;
  onUpdateMetadata: (newMeta: PartMetadata) => void;
}

export const PartInfoCard: React.FC<PartInfoCardProps> = ({
  metadata,
  onUpdateMetadata,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PartMetadata>({ ...metadata });

  const handleOpenEdit = () => {
    setFormData({ ...metadata });
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const usl = Number(formData.usl);
    const lsl = Number(formData.lsl);
    const tol = Math.max(0.0001, usl - lsl);
    onUpdateMetadata({
      ...formData,
      nominal: Number(formData.nominal),
      usl,
      lsl,
      tolerance: tol,
      gaugeResolution: Number(formData.gaugeResolution),
    });
    setIsEditing(false);
  };

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Cog className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <span>{metadata.partName}</span>
                <span className="text-xs text-slate-400 font-normal font-mono">
                  ({metadata.partNumber})
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                工序：{metadata.operationName} · 機台：{metadata.machineName}
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800 text-xs font-medium transition-colors self-start sm:self-auto"
          >
            <Sliders className="w-3.5 h-3.5" />
            編輯工件與公差規格
          </button>
        </div>

        {/* 規格詳細欄位 Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
            <span className="text-slate-500 block text-[11px] mb-1">檢驗尺寸特性</span>
            <span className="font-semibold text-slate-200 block truncate" title={metadata.characteristic}>
              {metadata.characteristic}
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
            <span className="text-slate-500 block text-[11px] mb-1">標稱尺寸 (Nominal)</span>
            <span className="font-mono font-bold text-sky-400 text-sm">
              {metadata.nominal.toFixed(3)} {metadata.unit}
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
            <span className="text-slate-500 block text-[11px] mb-1">公差規格 (USL / LSL)</span>
            <span className="font-mono text-slate-200">
              [{metadata.lsl.toFixed(3)} ~ {metadata.usl.toFixed(3)}]
            </span>
            <span className="text-[10px] text-slate-500 block font-mono">
              總公差: {metadata.tolerance.toFixed(3)} {metadata.unit}
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
            <span className="text-slate-500 block text-[11px] mb-1">使用量具名稱</span>
            <span className="font-medium text-slate-200 block truncate" title={metadata.gaugeName}>
              {metadata.gaugeName}
            </span>
            <span className="text-[10px] text-slate-500 font-mono block">
              編號: {metadata.gaugeId}
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
            <span className="text-slate-500 block text-[11px] mb-1">量具解析度</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {metadata.gaugeResolution} {metadata.unit}
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
            <span className="text-slate-500 block text-[11px] mb-1">負責人 / 檢驗日</span>
            <span className="text-slate-200 truncate block">{metadata.evaluationLeader}</span>
            <span className="text-[10px] text-slate-500 font-mono block">{metadata.inspectionDate}</span>
          </div>
        </div>
      </div>

      {/* 編輯規格 Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-sky-400" />
                編輯車削工件與量測系統規格參數
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* 工件基本資訊 */}
              <div>
                <h4 className="text-slate-300 font-medium mb-2.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-sky-400" />
                  零件與加工工序資訊
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">工件名稱</label>
                    <input
                      type="text"
                      value={formData.partName}
                      onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">零件料號 (Part No.)</label>
                    <input
                      type="text"
                      value={formData.partNumber}
                      onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">工程圖號 (Drawing No.)</label>
                    <input
                      type="text"
                      value={formData.drawingNumber}
                      onChange={(e) => setFormData({ ...formData, drawingNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">加工工序 (Operation)</label>
                    <input
                      type="text"
                      value={formData.operationName}
                      onChange={(e) => setFormData({ ...formData, operationName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">CNC機台型號 (Machine)</label>
                    <input
                      type="text"
                      value={formData.machineName}
                      onChange={(e) => setFormData({ ...formData, machineName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">檢驗尺寸特性 (Characteristic)</label>
                    <input
                      type="text"
                      value={formData.characteristic}
                      onChange={(e) => setFormData({ ...formData, characteristic: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* 尺寸公差規格 */}
              <div className="pt-2 border-t border-slate-800">
                <h4 className="text-slate-300 font-medium mb-2.5 flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-emerald-400" />
                  尺寸公差設定 (用於計算 %Tolerance / P/T Ratio)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">標稱尺寸 (Nominal)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.nominal}
                      onChange={(e) => setFormData({ ...formData, nominal: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">公差上限 (USL)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.usl}
                      onChange={(e) => setFormData({ ...formData, usl: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">公差下限 (LSL)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.lsl}
                      onChange={(e) => setFormData({ ...formData, lsl: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">單位 (Unit)</label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* 量具資訊與人員 */}
              <div className="pt-2 border-t border-slate-800">
                <h4 className="text-slate-300 font-medium mb-2.5 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  計量器具與評估簽核資訊
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">量具名稱 (Gauge Name)</label>
                    <input
                      type="text"
                      value={formData.gaugeName}
                      onChange={(e) => setFormData({ ...formData, gaugeName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">量具管制編號 (Gauge ID)</label>
                    <input
                      type="text"
                      value={formData.gaugeId}
                      onChange={(e) => setFormData({ ...formData, gaugeId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">量具解析度 (Resolution)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.gaugeResolution}
                      onChange={(e) =>
                        setFormData({ ...formData, gaugeResolution: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">校正有效日期</label>
                    <input
                      type="date"
                      value={formData.gaugeCalDueDate}
                      onChange={(e) => setFormData({ ...formData, gaugeCalDueDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">檢驗評估單位</label>
                    <input
                      type="text"
                      value={formData.inspectorDepartment}
                      onChange={(e) => setFormData({ ...formData, inspectorDepartment: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">評估負責人</label>
                    <input
                      type="text"
                      value={formData.evaluationLeader}
                      onChange={(e) => setFormData({ ...formData, evaluationLeader: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  儲存並更新計算
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
