import { useState, useEffect, useCallback } from "react";
import { Archive, AlertCircle } from "lucide-react";
import Header from "./components/Header";
import ProductPanel from "./components/ProductPanel";
import Vault from "./components/Vault";
import { supabase, FUNCTIONS_URL } from "./lib/supabase";
import { calculatePricing } from "./lib/pricing";
import type { Product, ScrapeResult, PricingResult } from "./lib/types";

const DEFAULT_COST = 699;
const DEFAULT_PROFIT = 1000;
const DEFAULT_SAFETY = 236;

export default function App() {
  const [product, setProduct] = useState<Product | null>(null);
  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [vaultRefresh, setVaultRefresh] = useState(0);

  useEffect(() => {
    if (!product) return;
    const p = calculatePricing(product.weight_g, product.product_cost, product.profit, product.safety);
    setPricing(p);
  }, [product?.weight_g, product?.product_cost, product?.profit, product?.safety]);

  const updateProduct = useCallback((updates: Partial<Product>) => {
    setProduct(prev => prev ? { ...prev, ...updates } : prev);
  }, []);

  async function handleScrape(url: string, brand: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${FUNCTIONS_URL}/scrape-amazon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data: ScrapeResult & { error?: string } = await res.json();
      if (data.error) throw new Error(data.error);

      const p = calculatePricing(data.weight_g, DEFAULT_COST, DEFAULT_PROFIT, DEFAULT_SAFETY);

      const productData = {
        asin: data.asin,
        title: data.title,
        brand,
        description: data.description,
        weight_g: data.weight_g,
        original_images: data.original_images,
        branded_images: [] as string[],
        price_usd: p.priceUsd,
        price_cad: p.priceCad,
        price_inr: p.totalInrUsd,
        product_cost: DEFAULT_COST,
        profit: DEFAULT_PROFIT,
        safety: DEFAULT_SAFETY,
        shipping_cost_usd: p.shippingUsd,
        shipping_cost_cad: p.shippingCad,
        amazon_url: data.amazon_url,
        product_details: data.product_details,
        raw_data: data as Record<string, unknown>,
      };

      const { data: saved, error: dbErr } = await supabase
        .from("products")
        .upsert(productData, { onConflict: "asin" })
        .select()
        .maybeSingle();

      if (dbErr) throw new Error(dbErr.message);

      setProduct(saved as Product);
      setVaultRefresh(n => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setLoading(false);
    }
  }

  async function saveProductUpdates(updates: Partial<Product>) {
    if (!product) return;
    const merged = { ...product, ...updates };
    const p = calculatePricing(merged.weight_g, merged.product_cost, merged.profit, merged.safety);
    const toSave = {
      ...updates,
      price_usd: p.priceUsd,
      price_cad: p.priceCad,
      price_inr: p.totalInrUsd,
      shipping_cost_usd: p.shippingUsd,
      shipping_cost_cad: p.shippingCad,
      updated_at: new Date().toISOString(),
    };
    await supabase.from("products").update(toSave).eq("id", product.id);
    updateProduct(toSave);
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-sky-500/5 blur-[100px]" />
      </div>

      <Header onScrape={handleScrape} loading={loading} />

      <button
        onClick={() => setVaultOpen(true)}
        className="fixed right-4 bottom-5 z-30 flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#0c1220]/90 border border-white/10 text-white/60 text-sm font-medium hover:text-white hover:border-amber-400/30 transition-all shadow-xl backdrop-blur-xl"
      >
        <Archive size={16} className="text-amber-400/70" />
        Vault
      </button>

      <main className="relative z-10">
        {error && (
          <div className="max-w-7xl mx-auto px-4 pt-6">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Extraction failed</p>
                <p className="text-xs text-red-300/60 mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!product && !loading && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/15 to-amber-600/5 border border-amber-400/20 flex items-center justify-center mb-2">
              <span className="text-3xl text-amber-400">✦</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">VaultLux Engine</h2>
            <p className="text-white/35 max-w-md text-sm leading-relaxed">
              Paste an Amazon product URL above to extract data, apply luxury branding to images, and calculate precise USD and CAD pricing using the reverse fee method.
            </p>
            <div className="flex gap-2 flex-wrap justify-center mt-2">
              {["Weight-based pricing", "Branded image export", "Vault history", "One-click copy"].map(f => (
                <span key={f} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-xs text-white/35">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-2 border-amber-400/20 border-t-amber-400 animate-spin" />
              <div className="absolute inset-3 rounded-full border border-amber-400/10 border-t-amber-400/40 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.7s" }} />
            </div>
            <p className="text-white/40 text-sm">Extracting product data...</p>
          </div>
        )}

        {product && pricing && !loading && (
          <ProductPanel
            product={product}
            pricing={pricing}
            onUpdate={saveProductUpdates}
            onReset={() => { setProduct(null); setPricing(null); setError(null); }}
          />
        )}
      </main>

      <Vault
        open={vaultOpen}
        onClose={() => setVaultOpen(false)}
        onLoad={p => {
          setProduct(p);
          setPricing(calculatePricing(p.weight_g, p.product_cost, p.profit, p.safety));
        }}
        refreshTrigger={vaultRefresh}
      />
    </div>
  );
}
