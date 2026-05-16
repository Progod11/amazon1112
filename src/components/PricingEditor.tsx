import { SlidersHorizontal } from "lucide-react";

interface PricingEditorProps {
  productCost: number;
  profit: number;
  safety: number;
  weightG: number;
  onUpdate: (fields: { product_cost?: number; profit?: number; safety?: number; weight_g?: number }) => void;
}

interface FieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  step?: number;
}

function NumField({ label, value, onChange, prefix = "₹", step = 50 }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-white/35 font-medium">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/30">{prefix}</span>
        <input
          type="number"
          value={value}
          step={step}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-6 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-400/40 transition-all"
        />
      </div>
    </div>
  );
}

export default function PricingEditor({ productCost, profit, safety, weightG, onUpdate }: PricingEditorProps) {
  return (
    <div className="rounded-2xl bg-white/3 border border-white/10 p-5">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal size={14} className="text-white/30" />
        <span className="text-xs text-white/50 font-medium uppercase tracking-wider">Pricing Parameters</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <NumField
          label="Product Cost"
          value={productCost}
          onChange={v => onUpdate({ product_cost: v })}
        />
        <NumField
          label="Profit"
          value={profit}
          onChange={v => onUpdate({ profit: v })}
        />
        <NumField
          label="Safety"
          value={safety}
          onChange={v => onUpdate({ safety: v })}
        />
        <NumField
          label="Weight (g)"
          value={weightG}
          prefix="g"
          step={10}
          onChange={v => onUpdate({ weight_g: v })}
        />
      </div>
    </div>
  );
}
