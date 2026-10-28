import { MsaRawData, PartMetadata } from '../types/msa';

export interface PresetProfile {
  id: string;
  name: string;
  badge: string;
  description: string;
  metadata: PartMetadata;
  rawData: MsaRawData;
}

export const PRESET_LATHE_SHAFT_OD: PresetProfile = {
  id: 'shaft_od',
  name: '精密伺服馬達階梯軸 - 外徑量測 (Ø25.000 ± 0.020 mm)',
  badge: '推薦示範 · 合格優良 (GRR < 10%)',
  description: '採用三豐數位外徑千分尺 (0.001mm) 對 10 支精密 CNC 車削軸進行 3 人 3 次重複檢驗。',
  metadata: {
    partName: '精密伺服馬達傳動階梯軸',
    partNumber: 'SF-SHAFT-2508-T4',
    drawingNumber: 'DWG-CNC-25-REV3',
    operationName: 'OP30 CNC車削外徑精車削',
    machineName: 'MAZAK Quick Turn 250-MSY',
    characteristic: '軸承配合位外徑 Ø25 h6',
    unit: 'mm',
    nominal: 25.0,
    usl: 25.02,
    lsl: 24.98,
    tolerance: 0.04,
    gaugeName: 'Mitutoyo 高精度數位外徑分厘卡 (293-240-30)',
    gaugeId: 'CAL-MIC-042',
    gaugeResolution: 0.001,
    gaugeCalDueDate: '2026-12-15',
    inspectorDepartment: '精密加工品保處 (Metrology QA)',
    inspectionDate: '2026-10-13',
    evaluationLeader: '陳立凱 (高級品保工程師)',
  },
  rawData: {
    operators: ['陳品檢員 (A)', '林技師 (B)', '張作業員 (C)'],
    parts: [
      '工件 #01',
      '工件 #02',
      '工件 #03',
      '工件 #04',
      '工件 #05',
      '工件 #06',
      '工件 #07',
      '工件 #08',
      '工件 #09',
      '工件 #10',
    ],
    trials: 3,
    // [operator][part][trial]
    values: [
      // Operator A (陳品檢員)
      [
        [24.992, 24.993, 24.992], // Part 1
        [25.008, 25.009, 25.008], // Part 2
        [24.985, 24.986, 24.984], // Part 3
        [25.014, 25.015, 25.013], // Part 4
        [24.998, 24.999, 24.998], // Part 5
        [25.003, 25.004, 25.003], // Part 6
        [24.991, 24.990, 24.992], // Part 7
        [25.011, 25.012, 25.010], // Part 8
        [24.988, 24.989, 24.987], // Part 9
        [25.005, 25.006, 25.005], // Part 10
      ],
      // Operator B (林技師)
      [
        [24.993, 24.992, 24.994],
        [25.009, 25.008, 25.010],
        [24.986, 24.985, 24.986],
        [25.015, 25.014, 25.015],
        [24.999, 24.998, 25.000],
        [25.004, 25.003, 25.005],
        [24.992, 24.991, 24.993],
        [25.012, 25.011, 25.013],
        [24.989, 24.988, 24.990],
        [25.006, 25.005, 25.007],
      ],
      // Operator C (張作業員)
      [
        [24.991, 24.993, 24.992],
        [25.007, 25.009, 25.008],
        [24.984, 24.986, 24.985],
        [25.013, 25.015, 25.014],
        [24.997, 24.999, 24.998],
        [25.002, 25.004, 25.003],
        [24.990, 24.992, 24.991],
        [25.010, 25.012, 25.011],
        [24.987, 24.989, 24.988],
        [25.004, 25.006, 25.005],
      ],
    ],
  },
};

export const PRESET_LATHE_BORE_ID: PresetProfile = {
  id: 'bore_id',
  name: '航太液壓閥套 - 內孔精搪孔徑 (Ø40.000 ± 0.015 mm)',
  badge: '邊緣條件合格 (GRR 10%~30%)',
  description: '採用三點式內徑分厘卡 (0.001mm)。人員手勢握持角度微小偏角造成 AV 略高，示範臨界判讀。',
  metadata: {
    partName: '航空液壓閥柱套筒 (Sleeve)',
    partNumber: 'AERO-VLV-4015',
    drawingNumber: 'A-40-771-B',
    operationName: 'OP40 CNC車削/精搪內孔',
    machineName: 'DMG MORI NLX 2000',
    characteristic: '閥芯配合內徑孔 Ø40 H7',
    unit: 'mm',
    nominal: 40.0,
    usl: 40.015,
    lsl: 39.985,
    tolerance: 0.03,
    gaugeName: '三點式內徑測分厘卡 (Holtest)',
    gaugeId: 'CAL-HOL-019',
    gaugeResolution: 0.001,
    gaugeCalDueDate: '2026-11-20',
    inspectorDepartment: '航太零組件檢驗室',
    inspectionDate: '2026-10-13',
    evaluationLeader: '趙思齊 (品質經理)',
  },
  rawData: {
    operators: ['趙檢驗員 (A)', '吳技師 (B)', '蘇作業員 (C)'],
    parts: [
      '工件 #01',
      '工件 #02',
      '工件 #03',
      '工件 #04',
      '工件 #05',
      '工件 #06',
      '工件 #07',
      '工件 #08',
      '工件 #09',
      '工件 #10',
    ],
    trials: 3,
    values: [
      // Operator A: 稍微測得略大 (+0.002)
      [
        [40.003, 40.002, 40.004],
        [39.996, 39.995, 39.997],
        [40.011, 40.012, 40.010],
        [39.991, 39.990, 39.992],
        [40.007, 40.008, 40.006],
        [40.002, 40.001, 40.003],
        [39.998, 39.997, 39.999],
        [40.013, 40.014, 40.012],
        [39.994, 39.993, 39.995],
        [40.005, 40.006, 40.004],
      ],
      // Operator B: 基準
      [
        [40.001, 40.000, 40.002],
        [39.994, 39.993, 39.995],
        [40.009, 40.010, 40.008],
        [39.989, 39.988, 39.990],
        [40.005, 40.006, 40.004],
        [40.000, 39.999, 40.001],
        [39.996, 39.995, 39.997],
        [40.011, 40.012, 40.010],
        [39.992, 39.991, 39.993],
        [40.003, 40.004, 40.002],
      ],
      // Operator C: 偏緊偏小 (-0.003)
      [
        [39.998, 39.997, 39.999],
        [39.991, 39.990, 39.992],
        [40.006, 40.007, 40.005],
        [39.986, 39.985, 39.987],
        [40.002, 40.003, 40.001],
        [39.997, 39.996, 39.998],
        [39.993, 39.992, 39.994],
        [40.008, 40.009, 40.007],
        [39.989, 39.988, 39.990],
        [40.000, 40.001, 39.999],
      ],
    ],
  },
};

export const PRESET_LATHE_LENGTH: PresetProfile = {
  id: 'length_step',
  name: '汽車傳動軸 - 車削總長度 (120.00 ± 0.10 mm)',
  badge: '不合格警示示範 (GRR > 30% · ndc < 5)',
  description: '使用普通 0.01mm 游標卡尺量測大長度工件，因卡爪視差與接觸端面傾斜，導致重複性與再現性超標。',
  metadata: {
    partName: '重載車用傳動後軸',
    partNumber: 'AUTO-DRV-120A',
    drawingNumber: 'DWG-DRV-1200',
    operationName: 'OP20 車削下料與端面長度加工',
    machineName: '台中精機 Vturn-26',
    characteristic: '台階總長度 L 120.00 ±0.10',
    unit: 'mm',
    nominal: 120.0,
    usl: 120.1,
    lsl: 119.9,
    tolerance: 0.2,
    gaugeName: '一般型 150mm 數顯游標卡尺',
    gaugeId: 'CAL-CALIPER-009',
    gaugeResolution: 0.01,
    gaugeCalDueDate: '2026-08-30',
    inspectorDepartment: '生產現場自檢品管組',
    inspectionDate: '2026-10-13',
    evaluationLeader: '李組長',
  },
  rawData: {
    operators: ['李品檢員 (A)', '王車工 (B)', '黃作業員 (C)'],
    parts: [
      '工件 #01',
      '工件 #02',
      '工件 #03',
      '工件 #04',
      '工件 #05',
      '工件 #06',
      '工件 #07',
      '工件 #08',
      '工件 #09',
      '工件 #10',
    ],
    trials: 3,
    values: [
      // Operator A
      [
        [120.03, 119.98, 120.04],
        [120.01, 120.05, 119.99],
        [120.07, 120.02, 120.08],
        [119.96, 120.01, 119.95],
        [120.04, 119.99, 120.05],
        [119.99, 120.03, 119.98],
        [120.06, 120.01, 120.07],
        [120.02, 119.97, 120.03],
        [119.98, 120.04, 119.97],
        [120.05, 120.00, 120.06],
      ],
      // Operator B
      [
        [119.95, 119.99, 119.94],
        [119.97, 119.92, 119.98],
        [120.01, 119.96, 120.02],
        [119.91, 119.95, 119.90],
        [119.98, 119.93, 119.99],
        [119.94, 119.98, 119.93],
        [120.00, 119.95, 120.01],
        [119.96, 119.91, 119.97],
        [119.92, 119.97, 119.91],
        [119.99, 119.94, 120.00],
      ],
      // Operator C
      [
        [120.08, 120.03, 120.09],
        [120.06, 120.11, 120.05],
        [120.12, 120.07, 120.13],
        [120.01, 120.06, 120.00],
        [120.09, 120.04, 120.10],
        [120.04, 120.08, 120.03],
        [120.11, 120.06, 120.12],
        [120.07, 120.02, 120.08],
        [120.03, 120.09, 120.02],
        [120.10, 120.05, 120.11],
      ],
    ],
  },
};

export const ALL_PRESETS: PresetProfile[] = [
  PRESET_LATHE_SHAFT_OD,
  PRESET_LATHE_BORE_ID,
  PRESET_LATHE_LENGTH,
];

/**
 * 依車削參數快速合成逼真的量測數據 (供現場自訂仿真或測試)
 */
export function generateSyntheticLatheData(
  nominal: number,
  tolerance: number,
  operatorCount: number,
  partCount: number,
  trialCount: number,
  resolution: number,
  noiseLevel: 'low' | 'medium' | 'high' = 'low'
): { rawData: MsaRawData } {
  const opNames = ['量測員 A', '量測員 B', '量測員 C', '量測員 D', '量測員 E'].slice(
    0,
    operatorCount
  );
  const partNames = Array.from({ length: partCount }, (_, idx) => `工件 #${String(idx + 1).padStart(2, '0')}`);

  // 各工件真實車削尺寸基準 (在 nominal ± 0.35 * tolerance 間自然波動)
  const partTrueValues: number[] = [];
  for (let j = 0; j < partCount; j++) {
    const ratio = (j / (partCount - 1) - 0.5) * 0.7; // -0.35 ~ +0.35
    partTrueValues.push(nominal + ratio * tolerance);
  }

  // 人員系統性偏差 (Operator bias)
  const opBiasMap: Record<string, number> = {
    low: tolerance * 0.015,
    medium: tolerance * 0.05,
    high: tolerance * 0.12,
  };
  const opRepeatNoiseMap: Record<string, number> = {
    low: tolerance * 0.02,
    medium: tolerance * 0.06,
    high: tolerance * 0.15,
  };

  const opBiasMagnitude = opBiasMap[noiseLevel];
  const repeatNoise = opRepeatNoiseMap[noiseLevel];

  const operatorBiases = opNames.map((_, i) => (i - (operatorCount - 1) / 2) * opBiasMagnitude);

  const values: number[][][] = [];
  const roundDigits = resolution <= 0.001 ? 3 : resolution <= 0.01 ? 2 : 1;
  const factor = Math.pow(10, roundDigits);

  for (let i = 0; i < operatorCount; i++) {
    const pMatrix: number[][] = [];
    for (let j = 0; j < partCount; j++) {
      const tArray: number[] = [];
      for (let t = 0; t < trialCount; t++) {
        // 真實零件尺寸 + 人員偏差 + 隨機量測雜訊
        const randomNoise = (Math.random() - 0.5) * 2 * repeatNoise;
        const raw = partTrueValues[j] + operatorBiases[i] + randomNoise;
        const rounded = Math.round(raw * factor) / factor;
        tArray.push(rounded);
      }
      pMatrix.push(tArray);
    }
    values.push(pMatrix);
  }

  return {
    rawData: {
      operators: opNames,
      parts: partNames,
      trials: trialCount,
      values,
    },
  };
}
