import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface ProductDetailsProps {
  details?: Record<string, string>;
}

export default function ProductDetails({ details }: ProductDetailsProps) {
  const [expanded, setExpanded] = useState(false);

  if (!details || Object.keys(details).length === 0) {
    return null;
  }

  const entries = Object.entries(details).slice(0, 12);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">About this item</span>
          <span className="text-xs text-white/40">{Object.keys(details).length} details</span>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-white/40" />
        ) : (
          <ChevronDown size={16} className="text-white/40" />
        )}
      </button>

      {expanded && (
        <div className="grid gap-2 px-1">
          {entries.map(([key, value]) => (
            <div
              key={key}
              className="flex flex-col gap-1 p-3 rounded-lg bg-white/3 border border-white/5"
            >
              <dt className="text-xs font-medium text-amber-400/70 uppercase tracking-wider">
                {key}
              </dt>
              <dd className="text-sm text-white/80 leading-relaxed break-words">
                {value.length > 200 ? value.substring(0, 200) + "..." : value}
              </dd>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
