export interface PartMetadata {
  partName: string; // 工件名稱 (如: 精密伺服馬達傳動軸)
  partNumber: string; // 零件料號 (如: SH-2026-T08)
  drawingNumber: string; // 圖紙編號 (如: DWG-4402-A)
  operationName: string; // 車削工序 (如: OP30 CNC外徑精車削)
  machineName: string; // 機台型號 (如: MAZAK Quick Turn 250)
  characteristic: string; // 檢驗特性 (如: 軸端外徑 Ø25 h6)
  unit: string; // 單位 (如: mm)
  nominal: number; // 標稱尺寸 (如: 25.000)
  usl: number; // 上限公差 (如: 25.015)
  lsl: number; // 下限公差 (如: 24.985)
  tolerance: number; // 總公差 (USL - LSL)
  gaugeName: string; // 量具名稱 (如: Mitutoyo 數位外徑分厘卡)
  gaugeId: string; // 量具編號 (如: QC-MIC-042)
  gaugeResolution: number; // 量具解析度 (如: 0.001)
  gaugeCalDueDate: string; // 校正有效期限 (如: 2026-12-31)
  inspectorDepartment: string; // 檢驗單位 (如: 品保部 Metrology Lab)
  inspectionDate: string; // 評估日期 (如: 2026-10-13)
  evaluationLeader: string; // 評估負責人 (如: 陳立凱 高級品保工程師)
}

export interface MsaRawData {
  operators: string[]; // 評價人員列表，長度 k
  parts: string[]; // 零件編號列表，長度 n
  trials: number; // 測試次數 r (通常 2 或 3)
  // 數值陣列：values[operatorIndex][partIndex][trialIndex]
  values: number[][][];
}

export interface XbarRResults {
  // 中間統計量
  operatorPartMeans: number[][]; // [operatorIndex][partIndex]
  operatorPartRanges: number[][]; // [operatorIndex][partIndex]
  operatorMeans: number[]; // 各作業員總均值 [operatorIndex]
  operatorRanges: number[]; // 各作業員平均極差 [operatorIndex]
  partMeans: number[]; // 各零件總均值 [partIndex]
  partRange: number; // Rp (零件均值之最大減最小)
  overallMean: number; // 總平均值 X_double_bar
  overallMeanRange: number; // 總平均極差 R_double_bar
  xDiff: number; // 作業員均值之極差 X_diff

  // AIAG 4th 常數因子
  d2Star_r: number;
  d2Star_k: number;
  d2Star_n: number;
  K1: number; // 試驗次數因子
  K2: number; // 評價人因子
  K3: number; // 零件數因子
  D3: number; // 極差下管制界限因子
  D4: number; // 極差上管制界限因子
  A2: number; // 均值管制界限因子

  // 變異量 (標準差與 6 Sigma 變異研究值)
  sigmaEV: number;
  sigmaAV: number;
  sigmaGRR: number;
  sigmaPV: number;
  sigmaTV: number;

  EV: number; // 重複性 (Equipment Variation) = 6 * sigmaEV
  AV: number; // 再現性 (Appraiser Variation) = 6 * sigmaAV
  GRR: number; // 綜合量具 R&R = 6 * sigmaGRR
  PV: number; // 零件間變異 (Part Variation) = 6 * sigmaPV
  TV: number; // 總變異 (Total Variation) = 6 * sigmaTV

  // 百分比 (% Study Variation)
  pctEV: number;
  pctAV: number;
  pctGRR: number;
  pctPV: number;

  // 公差百分比 (% Tolerance / P/T Ratio)
  pctTolEV: number;
  pctTolAV: number;
  pctTolGRR: number;
  pctTolPV: number;

  // 變異成分貢獻率 (% Contribution)
  contribEV: number;
  contribAV: number;
  contribGRR: number;
  contribPV: number;

  // 類別數 (ndc)
  ndc: number;

  // 管制界限
  uclR: number;
  lclR: number;
  uclXbar: number;
  lclXbar: number;
  pctOutOfControlXbar: number; // 均值圖超限百分比 (目標 > 50%)
  rangesOutOfControlCount: number; // 極差超限點數 (目標 = 0)

  // 判定結論
  grrStatus: 'acceptable' | 'marginal' | 'unacceptable';
  ndcStatus: 'adequate' | 'inadequate';
}

export interface AnovaResults {
  ssPart: number;
  dfPart: number;
  msPart: number;
  fPart: number;
  pPart: number;

  ssOperator: number;
  dfOperator: number;
  msOperator: number;
  fOperator: number;
  pOperator: number;

  ssInteraction: number;
  dfInteraction: number;
  msInteraction: number;
  fInteraction: number;
  pInteraction: number;

  ssRepeatability: number;
  dfRepeatability: number;
  msRepeatability: number;

  ssTotal: number;
  dfTotal: number;

  varRepeatability: number;
  varOperator: number;
  varInteraction: number;
  varPart: number;
  varTotal: number;

  grrAnova: number;
  pctGrrAnovaStudy: number;
  pctGrrAnovaTol: number;
  ndcAnova: number;
}

export interface DiagnosticFinding {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  metric: string;
  value: string;
  description: string;
  recommendation: string;
  machiningContext: string; // 針對車削加工現場合理的工程處置
}
