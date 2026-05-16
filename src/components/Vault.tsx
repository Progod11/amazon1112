import { useState, useEffect } from "react";
import { X, Search, Trash2, Clock, ExternalLink } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Product } from "../lib/types";

interface VaultProps {
  open: boolean;
  onClose: () => void;
  onLoad: (product: Product) => void;
  refreshTrigger: number;
}

export default function Vault({ open, onClose, onLoad, refreshTrigger }: VaultProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) fetchProducts();
  }, [open, refreshTrigger]);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setProducts((data as Product[]) || []);
    setLoading(false);
  }

  async function deleteProduct(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    await supabase.from("products").delete().eq("id", id);
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  const filtered = products.filter(p =>
    !query ||
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.asin.toLowerCase().includes(query.toLowerCase()) ||
    p.brand.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 h-full w-full sm:w-[480px] bg-[#0c1220] border-l border-white/10 z-50 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="text-white font-semibold">Product Vault</h2>
            <p className="text-xs text-white/30">{products.length} saved extractions</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-white/5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by title, ASIN, brand..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amber-400/40 transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-white/20 gap-2">
              <Clock size={24} />
              <span className="text-sm">{query ? "No results" : "No saved products yet"}</span>
            </div>
          ) : (
            filtered.map(product => (
              <div
                key={product.id}
                onClick={() => { onLoad(product); onClose(); }}
                className="group flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/8 hover:bg-white/6 hover:border-white/15 cursor-pointer transition-all"
              >
                {product.original_images?.[0] && (
                  <img
                    src={product.original_images[0]}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-white/5"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 font-medium truncate leading-snug">{product.title || "Untitled"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-amber-400/60">{product.asin}</span>
                    <span className="text-white/20 text-xs">·</span>
                    <span className="text-xs text-emerald-400/60">${product.price_usd}</span>
                    <span className="text-xs text-sky-400/50">C${product.price_cad}</span>
                  </div>
                  <p className="text-xs text-white/25 mt-0.5">
                    {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={product.amazon_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <ExternalLink size={12} />
                  </a>
                  <button
                    onClick={e => deleteProduct(product.id, e)}
                    className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400/50 hover:text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
