import type { PricingResult } from "./types";

// Shipping rate table from Excel (weight_g -> { usa_inr, cad_inr })
const SHIPPING_TABLE: { weight: number; usa: number; cad: number }[] = [
  { weight: 50,   usa: 500,  cad: 992  },
  { weight: 100,  usa: 527,  cad: 1022 },
  { weight: 150,  usa: 595,  cad: 1053 },
  { weight: 200,  usa: 625,  cad: 1082 },
  { weight: 250,  usa: 719,  cad: 1112 },
  { weight: 300,  usa: 754,  cad: 1141 },
  { weight: 350,  usa: 801,  cad: 1171 },
  { weight: 400,  usa: 833,  cad: 1239 },
  { weight: 450,  usa: 940,  cad: 1269 },
  { weight: 500,  usa: 1073, cad: 1298 },
  { weight: 600,  usa: 1141, cad: 1357 },
  { weight: 700,  usa: 1208, cad: 1522 },
  { weight: 800,  usa: 1277, cad: 1716 },
  { weight: 900,  usa: 1344, cad: 1775 },
  { weight: 1000, usa: 1484, cad: 1834 },
  { weight: 1100, usa: 1553, cad: 2093 },
  { weight: 1200, usa: 1620, cad: 2152 },
  { weight: 1300, usa: 1689, cad: 2211 },
  { weight: 1400, usa: 1821, cad: 2272 },
  { weight: 1500, usa: 1888, cad: 2331 },
  { weight: 1600, usa: 1956, cad: 2640 },
  { weight: 1700, usa: 2024, cad: 2700 },
  { weight: 1800, usa: 2092, cad: 2759 },
  { weight: 1900, usa: 2234, cad: 2818 },
  { weight: 2000, usa: 2301, cad: 2877 },
];

const AMAZON_FEE_PERCENT = 0.20; // 20%
const USD_RATE = 93;   // INR per USD
const CAD_RATE = 67;   // INR per CAD
const ADDL_WEIGHT_G = 200; // packaging

function roundUpToNextBracket(weightG: number): number {
  // Round up to nearest 50g bracket
  return Math.ceil(weightG / 50) * 50;
}

function lookupShipping(roundedWeight: number): { usa: number; cad: number } {
  // Find closest bracket (round up)
  const row = SHIPPING_TABLE.find(r => r.weight >= roundedWeight);
  if (row) return { usa: row.usa, cad: row.cad };
  // If heavier than max, use last entry
  return { usa: SHIPPING_TABLE[SHIPPING_TABLE.length - 1].usa, cad: SHIPPING_TABLE[SHIPPING_TABLE.length - 1].cad };
}

export function calculatePricing(
  weightG: number,
  productCost = 699,
  profit = 1000,
  safety = 236
): PricingResult {
  const totalWeightG = weightG + ADDL_WEIGHT_G;
  const roundedWeightG = roundUpToNextBracket(totalWeightG);
  const shipping = lookupShipping(roundedWeightG);

  // Gross INR (before Amazon fee)
  const grossUsd = productCost + profit + safety + shipping.usa;
  const grossCad = productCost + profit + safety + shipping.cad;

  // Reverse fee logic: Total = Gross / (1 - fee%)
  const totalInrUsd = grossUsd / (1 - AMAZON_FEE_PERCENT);
  const totalInrCad = grossCad / (1 - AMAZON_FEE_PERCENT);

  const amazonFeeUsd = totalInrUsd - grossUsd;
  const amazonFeeCad = totalInrCad - grossCad;

  // Convert to foreign currency
  const priceUsd = parseFloat((totalInrUsd / USD_RATE).toFixed(2));
  const priceCad = parseFloat((totalInrCad / CAD_RATE).toFixed(2));

  return {
    productCost,
    profit,
    safety,
    shippingUsd: shipping.usa,
    shippingCad: shipping.cad,
    grossUsd,
    grossCad,
    amazonFeeUsd: Math.round(amazonFeeUsd),
    amazonFeeCad: Math.round(amazonFeeCad),
    totalInrUsd: Math.round(totalInrUsd),
    totalInrCad: Math.round(totalInrCad),
    priceUsd,
    priceCad,
    roundedWeightG,
  };
}
