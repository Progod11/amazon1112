import { DollarSign, TrendingUp, Package, ShoppingCart } from "lucide-react";
import type { PricingResult } from "../lib/types";
import CopyButton from "./CopyButton";

interface PricingCardsProps {
  pricing: PricingResult;
  weightG: number;
}

interface RowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function Row({ label, value, highlight }: RowProps) {
  return (
    <div className={`flex justify-between items-center py-2 ${highlight ? "border-t border-white/10 mt-1 pt-3" : ""}`}>
      <span className={`text-xs ${highlight ? "text-white/80 font-semibold" : "text-white/40"}`}>{label}</span>
      <span className={`text-sm font-mono ${highlight ? "text-white font-bold" : "text-white/60"}`}>{value}</span>
    </div>
  );
}

export default function PricingCards({ pricing, weightG }: PricingCardsProps) {
  return (
    <div className="space-y-4">
      {/* Weight Badge */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 w-fit">
        <Package size={14} className="text-white/40" />
        <span className="text-xs text-white/40">Product weight:</span>
        <span className="text-xs text-white font-mono">{weightG}g</span>
        <span className="text-white/20 text-xs">+200g packaging =</span>
        <span className="text-xs text-amber-400 font-mono font-semibold">{pricing.roundedWeightG}g (rounded)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* USD Card */}
        <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-950/60 to-sky-900/30 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
                <DollarSign size={16} className="text-sky-400" />
              </div>
              <div>
                <p className="text-xs text-sky-400/70 font-medium uppercase tracking-wider">United States</p>
                <p className="text-xs text-white/30">amazon.com</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">${pricing.priceUsd}</p>
              <CopyButton text={`$${pricing.priceUsd}`} label="Copy" />
            </div>
          </div>
          <div className="space-y-0.5">
            <Row label="Product Cost" value={`₹${pricing.productCost}`} />
            <Row label="Profit" value={`₹${pricing.profit}`} />
            <Row label="Safety Buffer" value={`₹${pricing.safety}`} />
            <Row label="Shipping (USD)" value={`₹${pricing.shippingUsd}`} />
            <Row label="Gross Amount" value={`₹${pricing.grossUsd}`} />
            <Row label="Amazon Fee (20%)" value={`₹${pricing.amazonFeeUsd}`} />
            <Row label="Total INR" value={`₹${pricing.totalInrUsd}`} highlight />
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-white/30">Rate: ₹93 / $1</span>
              <span className="text-sky-300 font-bold text-lg">${pricing.priceUsd} USD</span>
            </div>
          </div>
        </div>

        {/* CAD Card */}
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/60 to-emerald-900/30 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp size={16} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-emerald-400/70 font-medium uppercase tracking-wider">Canada</p>
                <p className="text-xs text-white/30">amazon.ca</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">C${pricing.priceCad}</p>
              <CopyButton text={`C$${pricing.priceCad}`} label="Copy" />
            </div>
          </div>
          <div className="space-y-0.5">
            <Row label="Product Cost" value={`₹${pricing.productCost}`} />
            <Row label="Profit" value={`₹${pricing.profit}`} />
            <Row label="Safety Buffer" value={`₹${pricing.safety}`} />
            <Row label="Shipping (CAD)" value={`₹${pricing.shippingCad}`} />
            <Row label="Gross Amount" value={`₹${pricing.grossCad}`} />
            <Row label="Amazon Fee (20%)" value={`₹${pricing.amazonFeeCad}`} />
            <Row label="Total INR" value={`₹${pricing.totalInrCad}`} highlight />
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-white/30">Rate: ₹67 / C$1</span>
              <span className="text-emerald-300 font-bold text-lg">C${pricing.priceCad} CAD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export row */}
      <div className="flex items-center gap-2 justify-end">
        <ShoppingCart size={14} className="text-white/20" />
        <CopyButton
          text={`USD: $${pricing.priceUsd} | CAD: C$${pricing.priceCad} | Weight: ${pricing.roundedWeightG}g`}
          label="Copy All Prices"
          className="text-sm px-4 py-2"
        />
      </div>
    </div>
  );
}
