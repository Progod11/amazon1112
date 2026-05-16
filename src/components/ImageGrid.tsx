import { useState } from "react";
import { ExternalLink, Image as ImageIcon } from "lucide-react";
import { FUNCTIONS_URL } from "../lib/supabase";

interface ImageGridProps {
  originalImages: string[];
  brandName: string;
  onBrandedImages?: (urls: string[]) => void;
}

interface ImageItem {
  original: string;
  branded: string | null;
  loading: boolean;
  error: boolean;
}

export default function ImageGrid({ originalImages, brandName, onBrandedImages }: ImageGridProps) {
  const [items, setItems] = useState<ImageItem[]>(() =>
    originalImages.map(url => ({ original: url, branded: null, loading: false, error: false }))
  );
  const [brandingAll, setBrandingAll] = useState(false);
  const [viewMode, setViewMode] = useState<"branded" | "original">("branded");

  async function brandSingle(idx: number): Promise<string | null> {
    const original = originalImages[idx];
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, loading: true, error: false } : item));
    try {
      const res = await fetch(`${FUNCTIONS_URL}/brand-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: original, brandName }),
      });
      if (!res.ok) throw new Error("Brand failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob) + `?t=${Date.now()}`;
      setItems(prev => prev.map((item, i) => i === idx ? { ...item, branded: url, loading: false } : item));
      return url;
    } catch {
      setItems(prev => prev.map((item, i) => i === idx ? { ...item, loading: false, error: true } : item));
      return null;
    }
  }

  async function brandAll() {
    setBrandingAll(true);
    const results: string[] = [];
    for (let i = 0; i < originalImages.length; i++) {
      const url = await brandSingle(i);
      if (url) results.push(url);
    }
    setBrandingAll(false);
    onBrandedImages?.(results);
  }

  if (originalImages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 rounded-2xl border border-white/10 bg-white/3 text-white/30 gap-2">
        <ImageIcon size={32} />
        <span className="text-sm">No images found</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
          {(["branded", "original"] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize ${
                viewMode === mode
                  ? "bg-amber-400 text-black"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
        <button
          onClick={brandAll}
          disabled={brandingAll}
          className="px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-medium hover:bg-amber-400/20 disabled:opacity-50 transition-all"
        >
          {brandingAll ? "Branding..." : "Brand All"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {items.map((item, idx) => {
          const displayUrl = viewMode === "branded" && item.branded ? item.branded : item.original;
          return (
            <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10">
              {item.loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                </div>
              ) : item.error ? (
                <div className="absolute inset-0 flex items-center justify-center text-red-400/60 text-xs">
                  Failed
                </div>
              ) : null}
              <img
                src={displayUrl}
                alt={`Product ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                {!item.branded && !item.loading && (
                  <button
                    onClick={() => brandSingle(idx)}
                    className="px-3 py-1.5 bg-amber-400 text-black text-xs font-semibold rounded-lg hover:bg-amber-300 transition-all"
                  >
                    Apply Brand
                  </button>
                )}
                <a
                  href={item.original}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-white/70 text-xs hover:text-white transition-all"
                >
                  <ExternalLink size={12} />
                  View Original
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
