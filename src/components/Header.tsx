import { useState } from "react";
import { Search, Sparkles, Package } from "lucide-react";

interface HeaderProps {
  onScrape: (url: string, brand: string) => void;
  loading: boolean;
}

export default function Header({ onScrape, loading }: HeaderProps) {
  const [url, setUrl] = useState("");
  const [brand, setBrand] = useState("LUXURY");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    onScrape(url.trim(), brand.trim() || "LUXURY");
  }

  return (
    <header className="border-b border-white/10 bg-[#0a0f1e]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Package size={18} className="text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">VaultLux</h1>
            <p className="text-xs text-white/40 tracking-widest uppercase">Amazon Product Engine</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="Paste Amazon product URL..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 transition-all"
            />
          </div>
          <div className="relative sm:w-52">
            <Sparkles size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400/60" />
            <input
              type="text"
              value={brand}
              onChange={e => setBrand(e.target.value)}
              placeholder="Brand name..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Extracting...
              </span>
            ) : "Extract Product"}
          </button>
        </form>
      </div>
    </header>
  );
}
