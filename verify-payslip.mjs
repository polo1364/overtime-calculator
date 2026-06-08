/**
 * 從 index.html 抽出的 calculate() 同款計算（無 DOM），用於對照薪資單。
 * 執行: node verify-payslip.mjs
 */

const insuranceTable = [
  { salary: 28590, labor: 715, health: 444 }, { salary: 28800, labor: 720, health: 447 },
  { salary: 30300, labor: 758, health: 470 }, { salary: 31800, labor: 795, health: 493 },
  { salary: 33300, labor: 833, health: 516 }, { salary: 34800, labor: 870, health: 540 },
  { salary: 36300, labor: 908, health: 563 }, { salary: 38200, labor: 955, health: 592 },
  { salary: 40100, labor: 1003, health: 622 }, { salary: 42000, labor: 1050, health: 651 },
  { salary: 43900, labor: 1098, health: 681 }, { salary: 45800, labor: 1145, health: 710 },
  { salary: 47700, labor: 1193, health: 740 }, { salary: 49600, labor: 1240, health: 769 },
  { salary: 51500, labor: 1288, health: 799 }, { salary: 53400, labor: 1335, health: 828 },
  { salary: 55300, labor: 1383, health: 858 }, { salary: 57200, labor: 1430, health: 887 },
  { salary: 59100, labor: 1478, health: 917 }, { salary: 61000, labor: 1525, health: 946 },
  { salary: 62900, labor: 1573, health: 976 }, { salary: 64800, labor: 1620, health: 1005 },
  { salary: 66700, labor: 1668, health: 1035 }, { salary: 68600, labor: 1715, health: 1064 },
  { salary: 70500, labor: 1763, health: 1094 }, { salary: 72400, labor: 1810, health: 1123 },
  { salary: 74300, labor: 1858, health: 1153 }, { salary: 76200, labor: 1905, health: 1182 },
  { salary: 78100, labor: 1953, health: 1212 }, { salary: 80000, labor: 2000, health: 1241 },
  { salary: 81900, labor: 2048, health: 1271 }, { salary: 83800, labor: 2095, health: 1300 },
  { salary: 85700, labor: 2143, health: 1330 }, { salary: 87600, labor: 2190, health: 1359 },
  { salary: 89500, labor: 2238, health: 1389 }
];

function compute(opts) {
  const base = opts.baseSalary;
  const bonusBase = 2000;
  const meal = 1800;
  const extra = opts.extraPay || 0;
  const leavePersonal = opts.leavePersonal || 0;
  const leaveSick = opts.leaveSick || 0;
  const leaveMarriage = opts.leaveMarriage || 0;
  const leaveBereavement = opts.leaveBereavement || 0;
  const leaveMaternity = opts.leaveMaternity || 0;
  const leavePaternity = opts.leavePaternity || 0;
  const leaveFamilyCare = opts.leaveFamilyCare || 0;
  const monthlyWorkHours = 30 * 8;
  const leaveRatio = Math.min(leavePersonal / monthlyWorkHours, 1);
  const bonusDeduct = Math.round(bonusBase * leaveRatio);
  const bonus = bonusBase - bonusDeduct;
  const totalBase = base + bonus + meal + extra;
  const hourly = totalBase / 30 / 8;
  const ins = insuranceTable.find(row => totalBase <= row.salary) || insuranceTable[insuranceTable.length - 1];
  const labor = ins.labor;
  const personalHealth = ins.health;
  const dependents = opts.dependents || 0;
  const dependentHealth = personalHealth * dependents;
  const pension = Math.round(ins.salary * ((opts.pensionRate || 0) / 100));
  const welfare = Math.round((base + bonus + extra) * 0.005);
  const supPremium = Math.round((opts.supplementaryPremium || 0) * 0.0211);
  const leaveDeduct = (leavePersonal + leaveMarriage + leaveBereavement +
    leaveMaternity + leavePaternity + leaveFamilyCare) * hourly +
    leaveSick * hourly * 0.5;
  const ot1 = opts.ot2h || 0;
  const ot2 = opts.ot3to4h || 0;
  const ot3 = opts.ot5to6h || 0;
  const s1 = opts.sat2h || 0;
  const s2 = opts.sat3to8h || 0;
  const s3 = opts.sat9to12h || 0;
  const h1 = opts.holidayHours || 0;
  const payWD = (ot1 * 2 + ot2 * 2.33 + ot3 * 2.66) * hourly;
  const paySat = (s1 * 2 + s2 * 2.33 + s3 * 3.32) * hourly;
  const payHoliday = h1 * 2.16 * hourly;
  const mealWD = Math.ceil(ot1 % 2 === 0 ? ot1 / 2 : (Math.floor(ot1) + 1) / 2) * 60;
  const mealSat = Math.floor((s1 + s2) / 8) * 60;
  const mealH = Math.ceil(h1 / 8) * 60;
  const otTotal = ot1 + ot2 + ot3 + s1 + s2 + s3 + h1;
  let otBonus = 0;
  if (otTotal >= 50) otBonus = 3000;
  else if (otTotal >= 40) otBonus = 2000;
  else if (otTotal >= 30) otBonus = 1500;
  const totalAdd = payWD + paySat + payHoliday + mealWD + mealSat + mealH + otBonus;
  const totalDed = labor + personalHealth + dependentHealth + welfare + pension + supPremium + leaveDeduct + bonusDeduct;
  const net = totalBase + totalAdd - totalDed;
  return {
    totalBase,
    hourly,
    insBracket: ins.salary,
    labor,
    personalHealth,
    pension,
    welfare,
    totalAdd,
    payWD,
    paySat,
    payHoliday,
    mealWD,
    mealSat,
    mealH,
    otBonus,
    totalDed,
    net,
    bonus,
    bonusDeduct
  };
}

const payslip1Base = {
  baseSalary: 39668,
  extraPay: 0,
  pensionRate: 6,
  dependents: 0,
  supplementaryPremium: 0,
  leavePersonal: 0,
  leaveSick: 0,
  leaveMarriage: 0,
  leaveBereavement: 0,
  leaveMaternity: 0,
  leavePaternity: 0,
  leaveFamilyCare: 0,
  ot2h: 0,
  ot3to4h: 0,
  ot5to6h: 0,
  sat2h: 0,
  sat3to8h: 0,
  sat9to12h: 0,
  holidayHours: 0
};

console.log("=== 與 index.html calculate() 相同公式 ===\n");

const noOt = compute(payslip1Base);
console.log("輸入對齊第一張薪資單（本薪 39668、其他加給 0、勞退自提 6%、眷屬 0、補充保費基數 0、請假 0、加班時數全 0）");
console.log(JSON.stringify(
  {
    totalBase: Math.round(noOt.totalBase),
    insBracket: noOt.insBracket,
    labor: noOt.labor,
    health: noOt.personalHealth,
    pension: noOt.pension,
    welfare: noOt.welfare,
    totalDed: Math.round(noOt.totalDed),
    totalAdd: Math.round(noOt.totalAdd),
    net: Math.round(noOt.net)
  },
  null,
  2
));
console.log("\n薪資單扣款合計: 1098+681+2634+208 =", 1098 + 681 + 2634 + 208);
console.log("程式 totalDed:", Math.round(noOt.totalDed), noOt.totalDed === 4621 ? "(與薪資單一致)" : "");
console.log("薪資單實領 46627；程式 net（加班=0）:", Math.round(noOt.net));

const targetAdd = 7480 + 300;
const impliedNet = noOt.totalBase - noOt.totalDed + targetAdd;
console.log("\n若「程式中的加班費+誤餐+加班時數獎金」合計須等於薪資單 7480+300 =", targetAdd);
console.log("則 net = totalBase - totalDed +", targetAdd, "=", Math.round(impliedNet), impliedNet === 46627 ? "(等於薪資單實領)" : "");

const hourly = noOt.hourly;
const target = targetAdd;

function totalAddFromBuckets(ot1, ot2, ot3, s1, s2, s3, h1) {
  const payWD = (ot1 * 2 + ot2 * 2.33 + ot3 * 2.66) * hourly;
  const paySat = (s1 * 2 + s2 * 2.33 + s3 * 3.32) * hourly;
  const payHoliday = h1 * 2.16 * hourly;
  const mealWD = Math.ceil(ot1 % 2 === 0 ? ot1 / 2 : (Math.floor(ot1) + 1) / 2) * 60;
  const mealSat = Math.floor((s1 + s2) / 8) * 60;
  const mealH = Math.ceil(h1 / 8) * 60;
  const otTotal = ot1 + ot2 + ot3 + s1 + s2 + s3 + h1;
  let otBonus = 0;
  if (otTotal >= 50) otBonus = 3000;
  else if (otTotal >= 40) otBonus = 2000;
  else if (otTotal >= 30) otBonus = 1500;
  return payWD + paySat + payHoliday + mealWD + mealSat + mealH + otBonus;
}

// 僅平日三桶（週末、節日=0）— 運算量小，看是否已能貼近薪資單加班合計
let bestWd = null;
for (let ot1 = 0; ot1 <= 24; ot1 += 0.5) {
  for (let ot2 = 0; ot2 <= 12; ot2 += 0.5) {
    for (let ot3 = 0; ot3 <= 12; ot3 += 0.5) {
      const ta = totalAddFromBuckets(ot1, ot2, ot3, 0, 0, 0, 0);
      const err = Math.abs(ta - target);
      if (!bestWd || err < bestWd.err) bestWd = { err, ot1, ot2, ot3, totalAdd: ta };
    }
  }
}
console.log("\n=== 僅平日三桶（週末/節日=0）最接近 7780 ===");
console.log(JSON.stringify(bestWd, null, 2));
if (bestWd) {
  const chk = compute({
    ...payslip1Base,
    ot2h: bestWd.ot1,
    ot3to4h: bestWd.ot2,
    ot5to6h: bestWd.ot3
  });
  console.log(
    "套用該組合後 Math.round(net)（與網頁 formatCurrency 四捨五入一致）:",
    Math.round(chk.net),
    "；薪資單實領 46627",
    Math.round(chk.net) === 46627 ? "一致" : "不一致"
  );
}

// 補：週末兩桶 + 節日（其餘 0）小範圍搜尋
let bestMix = null;
for (let s1 = 0; s1 <= 12; s1 += 0.5) {
  for (let s2 = 0; s2 <= 12; s2 += 0.5) {
    for (let h1 = 0; h1 <= 16; h1 += 0.5) {
      const ta = totalAddFromBuckets(0, 0, 0, s1, s2, 0, h1);
      const err = Math.abs(ta - target);
      if (!bestMix || err < bestMix.err) bestMix = { err, s1, s2, h1, totalAdd: ta };
    }
  }
}
console.log("\n=== 僅週末前兩桶 + 節日（平日=0）最接近 7780 ===");
console.log(JSON.stringify(bestMix, null, 2));

console.log("\n=== 第二張獎金單 ===");
console.log("本專案無獨立「獎金薪資條」計算；算術: 11823 + 0 - 0 =", 11823);
