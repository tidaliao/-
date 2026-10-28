import {
  AnovaResults,
  DiagnosticFinding,
  MsaRawData,
  PartMetadata,
  XbarRResults,
} from '../types/msa';

// AIAG d2* 估計因子表 (用於無偏估計標準差 sigma = Range / d2*)
export function getD2Star(sampleSize: number, subgroupCount: number = 1): number {
  const d2Table: Record<number, number> = {
    2: 1.128,
    3: 1.693,
    4: 2.059,
    5: 2.326,
    6: 2.534,
    7: 2.704,
    8: 2.847,
    9: 2.970,
    10: 3.078,
    11: 3.173,
    12: 3.258,
    13: 3.336,
    14: 3.407,
    15: 3.472,
    16: 3.532,
    17: 3.588,
    18: 3.640,
    19: 3.689,
    20: 3.735,
  };

  if (d2Table[sampleSize]) return d2Table[sampleSize];
  if (sampleSize <= 1) return 1.0;
  // 近似公式 (用於較大 n)
  return 3.735 + 0.04 * (sampleSize - 20);
}

// 管制圖常數因子 D3, D4, A2
export function getControlChartFactors(r: number) {
  const factors: Record<number, { D3: number; D4: number; A2: number }> = {
    2: { D3: 0, D4: 3.267, A2: 1.880 },
    3: { D3: 0, D4: 2.574, A2: 1.023 },
    4: { D3: 0, D4: 2.282, A2: 0.729 },
    5: { D3: 0, D4: 2.114, A2: 0.577 },
    6: { D3: 0, D4: 2.004, A2: 0.483 },
  };
  return factors[r] || { D3: 0, D4: 2.114, A2: 0.577 };
}

/**
 * 執行 AIAG MSA 4th Edition 均值與極差法 (Xbar-R) 完整計算
 */
export function calculateXbarR(
  data: MsaRawData,
  metadata: PartMetadata,
  studySigmaMultiplier: number = 6.0
): XbarRResults {
  const k = data.operators.length; // 評價人數量
  const n = data.parts.length; // 零件數量
  const r = data.trials; // 試驗次數

  const tolerance = Math.max(0.00001, metadata.tolerance || metadata.usl - metadata.lsl);

  // 1. 各評價人對各零件的均值與極差
  const operatorPartMeans: number[][] = [];
  const operatorPartRanges: number[][] = [];
  const operatorMeans: number[] = [];
  const operatorRanges: number[] = [];

  for (let i = 0; i < k; i++) {
    const pMeans: number[] = [];
    const pRanges: number[] = [];
    let sumMeans = 0;
    let sumRanges = 0;

    for (let j = 0; j < n; j++) {
      const trialValues = data.values[i]?.[j] || [];
      if (trialValues.length === 0) {
        pMeans.push(0);
        pRanges.push(0);
        continue;
      }
      const sum = trialValues.reduce((acc, v) => acc + v, 0);
      const mean = sum / trialValues.length;
      const max = Math.max(...trialValues);
      const min = Math.min(...trialValues);
      const range = max - min;

      pMeans.push(mean);
      pRanges.push(range);
      sumMeans += mean;
      sumRanges += range;
    }

    operatorPartMeans.push(pMeans);
    operatorPartRanges.push(pRanges);
    operatorMeans.push(sumMeans / n);
    operatorRanges.push(sumRanges / n);
  }

  // 2. 總體平均極差 R_double_bar 與各零件跨人員總均值
  const overallMeanRange = operatorRanges.reduce((acc, v) => acc + v, 0) / k;
  const overallMean = operatorMeans.reduce((acc, v) => acc + v, 0) / k;

  const partMeans: number[] = [];
  for (let j = 0; j < n; j++) {
    let pSum = 0;
    for (let i = 0; i < k; i++) {
      pSum += operatorPartMeans[i][j];
    }
    partMeans.push(pSum / k);
  }

  const partMax = Math.max(...partMeans);
  const partMin = Math.min(...partMeans);
  const partRange = partMax - partMin;

  const maxOpMean = Math.max(...operatorMeans);
  const minOpMean = Math.min(...operatorMeans);
  const xDiff = maxOpMean - minOpMean;

  // 3. 常數因子 (依 AIAG MSA 4th)
  const d2Star_r = getD2Star(r, n * k);
  const d2Star_k = getD2Star(k, 1);
  const d2Star_n = getD2Star(n, 1);

  const K1 = studySigmaMultiplier / d2Star_r;
  const K2 = studySigmaMultiplier / d2Star_k;
  const K3 = studySigmaMultiplier / d2Star_n;

  const { D3, D4, A2 } = getControlChartFactors(r);

  // 4. 標準差與變異研究值估計
  // Repeatability (EV - Equipment Variation)
  const sigmaEV = overallMeanRange / d2Star_r;
  const EV = overallMeanRange * K1; // 亦即 sigmaEV * studySigmaMultiplier

  // Reproducibility (AV - Appraiser Variation)
  // sigmaAV^2 = max(0, (xDiff / d2Star_k)^2 - (sigmaEV^2 / (n * r)))
  const avVarTerm = Math.pow(xDiff / d2Star_k, 2) - Math.pow(sigmaEV, 2) / (n * r);
  const sigmaAV = Math.sqrt(Math.max(0, avVarTerm));
  const AV = sigmaAV * studySigmaMultiplier;

  // Combined Gage R&R (GRR)
  const sigmaGRR = Math.sqrt(Math.pow(sigmaEV, 2) + Math.pow(sigmaAV, 2));
  const GRR = Math.sqrt(Math.pow(EV, 2) + Math.pow(AV, 2));

  // Part Variation (PV)
  const sigmaPV = partRange / d2Star_n;
  const PV = partRange * K3; // 亦即 sigmaPV * studySigmaMultiplier

  // Total Variation (TV)
  const sigmaTV = Math.sqrt(Math.pow(sigmaGRR, 2) + Math.pow(sigmaPV, 2));
  const TV = Math.sqrt(Math.pow(GRR, 2) + Math.pow(PV, 2));

  // 5. 百分比計算
  const safeTV = TV > 0 ? TV : 0.000001;
  const pctEV = (EV / safeTV) * 100;
  const pctAV = (AV / safeTV) * 100;
  const pctGRR = (GRR / safeTV) * 100;
  const pctPV = (PV / safeTV) * 100;

  const pctTolEV = (EV / tolerance) * 100;
  const pctTolAV = (AV / tolerance) * 100;
  const pctTolGRR = (GRR / tolerance) * 100;
  const pctTolPV = (PV / tolerance) * 100;

  // 變異成分 (Variance Contribution)
  const varEV = Math.pow(sigmaEV, 2);
  const varAV = Math.pow(sigmaAV, 2);
  const varGRR = Math.pow(sigmaGRR, 2);
  const varPV = Math.pow(sigmaPV, 2);
  const varTotal = varGRR + varPV > 0 ? varGRR + varPV : 0.000001;

  const contribEV = (varEV / varTotal) * 100;
  const contribAV = (varAV / varTotal) * 100;
  const contribGRR = (varGRR / varTotal) * 100;
  const contribPV = (varPV / varTotal) * 100;

  // 6. 分辨力類別數 (ndc)
  // ndc = 1.41 * (PV / GRR) = 1.41 * (sigmaPV / sigmaGRR)
  const rawNdc = GRR > 0 ? 1.41 * (PV / GRR) : 99;
  const ndc = Math.max(1, Math.floor(rawNdc));

  // 7. 管制界限
  const uclR = D4 * overallMeanRange;
  const lclR = D3 * overallMeanRange;
  const uclXbar = overallMean + A2 * overallMeanRange;
  const lclXbar = overallMean - A2 * overallMeanRange;

  let outOfControlXbarCount = 0;
  let totalPartPoints = 0;
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < n; j++) {
      totalPartPoints++;
      const val = operatorPartMeans[i][j];
      if (val > uclXbar || val < lclXbar) {
        outOfControlXbarCount++;
      }
    }
  }

  let rangesOutOfControlCount = 0;
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < n; j++) {
      const val = operatorPartRanges[i][j];
      if (val > uclR || val < lclR) {
        rangesOutOfControlCount++;
      }
    }
  }

  const pctOutOfControlXbar = totalPartPoints > 0 ? (outOfControlXbarCount / totalPartPoints) * 100 : 0;

  // 8. 判定結論
  // AIAG 4th:
  // %GRR < 10%: Acceptable
  // 10% <= %GRR <= 30%: Marginal (May be acceptable based on application, gauge cost, repair cost)
  // %GRR > 30%: Unacceptable (Measurement system needs improvement)
  let grrStatus: 'acceptable' | 'marginal' | 'unacceptable' = 'acceptable';
  if (pctGRR > 30 || pctTolGRR > 30) {
    grrStatus = 'unacceptable';
  } else if (pctGRR >= 10 || pctTolGRR >= 10) {
    grrStatus = 'marginal';
  } else {
    grrStatus = 'acceptable';
  }

  const ndcStatus = ndc >= 5 ? 'adequate' : 'inadequate';

  return {
    operatorPartMeans,
    operatorPartRanges,
    operatorMeans,
    operatorRanges,
    partMeans,
    partRange,
    overallMean,
    overallMeanRange,
    xDiff,
    d2Star_r,
    d2Star_k,
    d2Star_n,
    K1,
    K2,
    K3,
    D3,
    D4,
    A2,
    sigmaEV,
    sigmaAV,
    sigmaGRR,
    sigmaPV,
    sigmaTV,
    EV,
    AV,
    GRR,
    PV,
    TV,
    pctEV,
    pctAV,
    pctGRR,
    pctPV,
    pctTolEV,
    pctTolAV,
    pctTolGRR,
    pctTolPV,
    contribEV,
    contribAV,
    contribGRR,
    contribPV,
    ndc,
    uclR,
    lclR,
    uclXbar,
    lclXbar,
    pctOutOfControlXbar,
    rangesOutOfControlCount,
    grrStatus,
    ndcStatus,
  };
}

/**
 * 執行 Two-Way ANOVA 方差分析
 */
export function calculateAnova(
  data: MsaRawData,
  metadata: PartMetadata,
  studySigmaMultiplier: number = 6.0
): AnovaResults {
  const k = data.operators.length;
  const n = data.parts.length;
  const r = data.trials;
  const N = k * n * r;
  const tolerance = Math.max(0.00001, metadata.tolerance || metadata.usl - metadata.lsl);

  let grandSum = 0;
  let sumSqAll = 0;

  for (let i = 0; i < k; i++) {
    for (let j = 0; j < n; j++) {
      for (let t = 0; t < r; t++) {
        const val = data.values[i]?.[j]?.[t] || 0;
        grandSum += val;
        sumSqAll += val * val;
      }
    }
  }

  const grandMean = grandSum / N;
  const ssTotal = sumSqAll - (grandSum * grandSum) / N;
  const dfTotal = N - 1;

  // SS Part
  let sumSqPartSums = 0;
  for (let j = 0; j < n; j++) {
    let pSum = 0;
    for (let i = 0; i < k; i++) {
      for (let t = 0; t < r; t++) {
        pSum += data.values[i]?.[j]?.[t] || 0;
      }
    }
    sumSqPartSums += pSum * pSum;
  }
  const ssPart = sumSqPartSums / (k * r) - (grandSum * grandSum) / N;
  const dfPart = n - 1;
  const msPart = ssPart / dfPart;

  // SS Operator
  let sumSqOpSums = 0;
  for (let i = 0; i < k; i++) {
    let opSum = 0;
    for (let j = 0; j < n; j++) {
      for (let t = 0; t < r; t++) {
        opSum += data.values[i]?.[j]?.[t] || 0;
      }
    }
    sumSqOpSums += opSum * opSum;
  }
  const ssOperator = sumSqOpSums / (n * r) - (grandSum * grandSum) / N;
  const dfOperator = k - 1;
  const msOperator = ssOperator / dfOperator;

  // SS Part * Operator (Cell totals)
  let sumSqCellSums = 0;
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < n; j++) {
      let cellSum = 0;
      for (let t = 0; t < r; t++) {
        cellSum += data.values[i]?.[j]?.[t] || 0;
      }
      sumSqCellSums += cellSum * cellSum;
    }
  }
  const ssSubtotal = sumSqCellSums / r - (grandSum * grandSum) / N;
  const ssInteraction = Math.max(0, ssSubtotal - ssPart - ssOperator);
  const dfInteraction = (n - 1) * (k - 1);
  const msInteraction = dfInteraction > 0 ? ssInteraction / dfInteraction : 0;

  // SS Repeatability (Equipment / Error)
  const ssRepeatability = Math.max(0, ssTotal - ssSubtotal);
  const dfRepeatability = n * k * (r - 1);
  const msRepeatability = dfRepeatability > 0 ? ssRepeatability / dfRepeatability : 0;

  // F-values & approximate p-values
  // Model with interaction: F_operator = msOperator / msInteraction (if interaction is significant) or msRepeatability
  const useInteractionDenom = dfInteraction > 0 && msInteraction > msRepeatability;
  const denomOp = useInteractionDenom ? msInteraction : msRepeatability;
  const fOperator = denomOp > 0 ? msOperator / denomOp : 0;
  const pOperator = approximateFPvalue(fOperator, dfOperator, useInteractionDenom ? dfInteraction : dfRepeatability);

  const denomPart = useInteractionDenom ? msInteraction : msRepeatability;
  const fPart = denomPart > 0 ? msPart / denomPart : 0;
  const pPart = approximateFPvalue(fPart, dfPart, useInteractionDenom ? dfInteraction : dfRepeatability);

  const fInteraction = msRepeatability > 0 ? msInteraction / msRepeatability : 0;
  const pInteraction = approximateFPvalue(fInteraction, dfInteraction, dfRepeatability);

  // Variance Components (ANOVA)
  const varRepeatability = msRepeatability;
  const varInteraction = Math.max(0, (msInteraction - msRepeatability) / r);
  const varOperator = Math.max(0, (msOperator - msInteraction) / (n * r));
  const varPart = Math.max(0, (msPart - msInteraction) / (k * r));

  const varGRR = varRepeatability + varOperator + varInteraction;
  const varTotal = varGRR + varPart;

  const grrAnova = Math.sqrt(varGRR) * studySigmaMultiplier;
  const totalAnova = Math.sqrt(varTotal) * studySigmaMultiplier;

  const pctGrrAnovaStudy = totalAnova > 0 ? (grrAnova / totalAnova) * 100 : 0;
  const pctGrrAnovaTol = tolerance > 0 ? (grrAnova / tolerance) * 100 : 0;
  const ndcAnova = varGRR > 0 ? Math.floor(1.41 * (Math.sqrt(varPart) / Math.sqrt(varGRR))) : 99;

  return {
    ssPart,
    dfPart,
    msPart,
    fPart,
    pPart,
    ssOperator,
    dfOperator,
    msOperator,
    fOperator,
    pOperator,
    ssInteraction,
    dfInteraction,
    msInteraction,
    fInteraction,
    pInteraction,
    ssRepeatability,
    dfRepeatability,
    msRepeatability,
    ssTotal,
    dfTotal,
    varRepeatability,
    varOperator,
    varInteraction,
    varPart,
    varTotal,
    grrAnova,
    pctGrrAnovaStudy,
    pctGrrAnovaTol,
    ndcAnova,
  };
}

// 簡易 F 檢定 p-value 近似演算法 (足以判別 0.05 顯著性)
function approximateFPvalue(F: number, df1: number, df2: number): number {
  if (F <= 0 || df1 <= 0 || df2 <= 0) return 1.0;
  // Fisher's z 變換近似
  const x = (df1 * F) / (df1 * F + df2);
  // 透過標準常態分佈近似不完全 Beta 函數
  const mean = df1 / (df1 + df2);
  const variance = (2 * df1 * df2 * (df1 + df2 - 2)) / (Math.pow(df1 + df2, 2) * (df1 + df2 + 2));
  if (variance <= 0) return 0.5;
  const z = (x - mean) / Math.sqrt(variance);
  // 單尾 p-value: 1 - Phi(z)
  return Math.max(0.0001, Math.min(0.9999, 1 - normalCdf(z)));
}

function normalCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const prob =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}

/**
 * 智慧診斷引擎：深入分析車削加工 (Lathe/Turning) 情境下的量測異常
 */
export function generateMachiningDiagnostics(
  xbarR: XbarRResults,
  metadata: PartMetadata
): DiagnosticFinding[] {
  const findings: DiagnosticFinding[] = [];

  // 1. 綜合合格性判定
  if (xbarR.grrStatus === 'acceptable') {
    findings.push({
      type: 'success',
      title: '量測系統能力評定：合格可接受 (Acceptable)',
      metric: `%GRR = ${xbarR.pctGRR.toFixed(2)}% (< 10%) · %Tol = ${xbarR.pctTolGRR.toFixed(2)}%`,
      value: `${xbarR.pctGRR.toFixed(1)}%`,
      description:
        '該車削尺寸量具系統重複性與再現性極佳，變異佔製程與公差比例均低於 10%，符合 IATF 16949 / AIAG MSA 4th 最新規範要求。',
      recommendation:
        '此量測系統可安心用於目前 CNC 車削件線上巡檢、全檢或 SPC 統計製程管制。維持定期清潔與按時年度校正即可。',
      machiningContext:
        '外徑/內徑車削尺寸變異完全落在量具測量能力之內，不會因量測誤差造成合格件誤判為報廢或不良件放行。',
    });
  } else if (xbarR.grrStatus === 'marginal') {
    findings.push({
      type: 'warning',
      title: '量測系統能力評定：條件性接受 (Marginal)',
      metric: `%GRR = ${xbarR.pctGRR.toFixed(2)}% (10%~30%) · %Tol = ${xbarR.pctTolGRR.toFixed(2)}%`,
      value: `${xbarR.pctGRR.toFixed(1)}%`,
      description:
        '量具變異介於 10% 至 30% 之間。依據產品關鍵特性（Safety/Critical 特性）與量具改進成本，可由品質工程主管審批後條件性使用。',
      recommendation:
        '建議評估以下兩方向：(1) 若為重大外徑/階級配合軸，應嘗試縮小 EV 或 AV；(2) 若為非配合一般車削長度尺寸，現行量具仍可接受。',
      machiningContext:
        '車削工件若表面粗糙度較粗（如 Ra > 3.2μm），測砧接觸點微小位移會放大重複性誤差，可考慮在同一切削位置劃記標線後再量測。',
    });
  } else {
    findings.push({
      type: 'danger',
      title: '量測系統能力評定：不可接受 (Unacceptable)',
      metric: `%GRR = ${xbarR.pctGRR.toFixed(2)}% (> 30%) · %Tol = ${xbarR.pctTolGRR.toFixed(2)}%`,
      value: `${xbarR.pctGRR.toFixed(1)}%`,
      description:
        '量測系統變異佔總變異或公差超過 30%，量測波動過大，無法可靠監控車削加工製程，極易引發誤判或假警報。',
      recommendation:
        '必須暫停使用本量具驗收該車削工序！需召集品保與車削技術員查明 EV (儀器) 或 AV (人員) 主要失真原因並實施根本對策。',
      machiningContext:
        '此公差帶（±' +
        ((metadata.tolerance || 0.04) / 2).toFixed(3) +
        ' mm）對於當前量具解析度過於嚴苛，或車削夾持橢圓度、切削熱變形影響量測準度。',
    });
  }

  // 2. EV 重複性 vs AV 再現性 佔比診斷
  if (xbarR.EV > xbarR.AV * 1.5) {
    findings.push({
      type: 'warning',
      title: '重複性 (EV / 設備變異) 顯著高於再現性',
      metric: `EV: ${xbarR.EV.toFixed(4)} mm (${xbarR.pctEV.toFixed(1)}%) vs AV: ${xbarR.AV.toFixed(4)} mm (${xbarR.pctAV.toFixed(1)}%)`,
      value: `EV 佔主導 (${xbarR.contribEV.toFixed(1)}% Var)`,
      description:
        '同一個人重複測量同一個車削工件時數值散布較大。問題主要出在「量具本身、夾持定位、或工件表面品質」，而非人員手勢手法差異。',
      recommendation:
        '1. 檢查千分尺/量錶測砧測頭是否有微量磨損、松動或棘輪測力套筒 (Ratchet Thimble) 彈簧疲勞失準。\n2. 車削工件表面殘留切削油、微小細削或毛邊，測量前需使用無塵布與工業酒精徹底擦拭。\n3. 注意剛從 CNC 車床取下工件時的「切削熱脹」，需冷卻至室溫 (20°C ± 2°C) 後再進行量測。',
      machiningContext:
        '在車削階級軸或薄壁套筒量測時，外徑千分尺若施力過猛（測力超過 5~10N）容易使薄壁產生彈性形變，導致重複讀數跳動。',
    });
  } else if (xbarR.AV > xbarR.EV * 1.2) {
    findings.push({
      type: 'warning',
      title: '再現性 (AV / 人員變異) 顯著高於重複性',
      metric: `AV: ${xbarR.AV.toFixed(4)} mm (${xbarR.pctAV.toFixed(1)}%) vs EV: ${xbarR.EV.toFixed(4)} mm (${xbarR.pctEV.toFixed(1)}%)`,
      value: `AV 佔主導 (${xbarR.contribAV.toFixed(1)}% Var)`,
      description:
        '同一工件不同作業員量測均值存在系統性偏差 (X_diff = ' +
        xbarR.xDiff.toFixed(4) +
        ' mm)。問題出在「操作員手法、握持角度或讀數習慣未統一」。',
      recommendation:
        '1. 建立標準作業指導書 (SOP)，規範棘輪測力套筒必須旋轉「喀喀」響 2~3 響後讀數。\n2. 規範量測位置與深度（例如：距端面 5mm 處，沿徑向 90 度十字交叉測量取平均）。\n3. 針對數顯卡尺或機械分厘卡之視差、量具在工件上的傾斜角進行同仁交叉培訓。',
      machiningContext:
        '車削工件具有旋轉對稱性，若作業員 A 總是在車削卡爪夾持痕跡處測量，而作業員 B 在平滑面測量，會產生極大的人員間再現性差異。',
    });
  }

  // 3. 分辨力類別數 ndc 判定
  if (xbarR.ndc >= 5) {
    findings.push({
      type: 'info',
      title: '分辨力類別數 (ndc) 充足 (ndc ≥ 5)',
      metric: `ndc = ${xbarR.ndc} (標準值 ≥ 5)`,
      value: `${xbarR.ndc} 組`,
      description:
        `目前量測系統能將車削工件製程變異清晰切分為 ${xbarR.ndc} 個互不重疊的數據區間，足以提供 SPC 管制圖辨識製程趨勢。`,
      recommendation:
        '量具解析度 (' +
        metadata.gaugeResolution +
        ' mm) 與當前車削製程公差搭配良好，無需更換更高階量儀。',
      machiningContext:
        '工件尺寸的微小刀具磨損補正（Tool Wear Offset）能夠被量具即時且靈敏地捕捉。',
    });
  } else {
    findings.push({
      type: 'danger',
      title: '分辨力類別數 (ndc) 不足！(ndc < 5)',
      metric: `ndc = ${xbarR.ndc} (< 5, 嚴重警告)`,
      value: `僅 ${xbarR.ndc} 組 (不足)`,
      description:
        `ndc 為 ${xbarR.ndc}，代表量測系統無法細緻區分車削工件間的自然變異，數據呈現「粗階梯狀」量化，SPC 管制圖將失去預警功能。`,
      recommendation:
        '1. 請升級量具解析度（例如：從 0.01mm 游標卡尺更換為 0.001mm 數位外徑千分尺或高精度氣壓測微儀）。\n2. 確保選取供 MSA 評估的 10 件車削工件能充分涵蓋整個加工製程的代表性尺寸（包含上限、中心、下限分佈）。',
      machiningContext:
        '若 10 件車削工件均在同一把刀切削同一個批次內連續取出，工件間尺寸幾乎相同 (PV 偏小)，也會導致 ndc 計算值偏低。',
    });
  }

  // 4. X-bar 管制圖判讀診斷 (均值圖超限百分比)
  if (xbarR.pctOutOfControlXbar >= 50) {
    findings.push({
      type: 'success',
      title: '均值管制圖 (X-bar Chart) 展現良好區分度',
      metric: `${xbarR.pctOutOfControlXbar.toFixed(1)}% 點落在管制界限外 (目標 ≥ 50%)`,
      value: `${xbarR.pctOutOfControlXbar.toFixed(0)}% 超限 (優良)`,
      description:
        '在 MSA 評估中，均值圖的管制界限係由「重複性 (EV)」推算得出。有超過一半的工件均值點落在界限之外，證明零件間的真實變異遠大於量測雜訊！',
      recommendation: '量測系統對車削工件各工件幾何特徵的辨別靈敏度充分合格。',
      machiningContext: '表示機台車削加工出來的微小尺寸差異，都能被量具明確辨識。',
    });
  } else {
    findings.push({
      type: 'warning',
      title: '均值管制圖 (X-bar Chart) 超限點不足 (< 50%)',
      metric: `${xbarR.pctOutOfControlXbar.toFixed(1)}% 點落在管制界限外 (< 50%)`,
      value: `${xbarR.pctOutOfControlXbar.toFixed(0)}% (靈敏度弱)`,
      description:
        '均值圖中落在管制界限外的零件點少於 50%，說明量測系統的隨機雜訊遮蔽了車削工件本身尺寸差異。',
      recommendation:
        '建議重新抽樣跨不同班次、不同刀具磨耗階段的車削工件，或提升量具精度以壓低管制界限。',
      machiningContext: '量測儀器對於該車削工序而言「解析度可能太鈍」。',
    });
  }

  // 5. R 極差管制圖異常點診斷
  if (xbarR.rangesOutOfControlCount > 0) {
    findings.push({
      type: 'danger',
      title: `極差管制圖 (R Chart) 出現 ${xbarR.rangesOutOfControlCount} 個失控點！`,
      metric: `超出極差上限 (UCL_R = ${xbarR.uclR.toFixed(4)} mm)`,
      value: `${xbarR.rangesOutOfControlCount} 點超限`,
      description:
        '部分零件在同位作業員重複量測時，極差值異常放大並衝破 UCL 管制上限，代表量測過程中存在「特殊原因 (Special Cause)」干擾！',
      recommendation:
        '請查核對應之失控工件與作業員。通常為：(1) 讀數抄寫鍵入筆誤；(2) 該工件測量部位有毛刺刮痕；(3) 測量時工件未放正傾斜。',
      machiningContext:
        '車削工件外圓若有切削切屑纏繞或未清除之頂針孔偏心，會造成特定一次測量讀數暴增。',
    });
  }

  return findings;
}
