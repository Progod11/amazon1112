import { Tag, FileText, Hash, ExternalLink, RotateCcw } from "lucide-react";
import type { Product } from "../lib/types";
import type { PricingResult } from "../lib/types";
import CopyButton from "./CopyButton";
import ImageGrid from "./ImageGrid";
import PricingCards from "./PricingCards";
import PricingEditor from "./PricingEditor";
import ProductDetails from "./ProductDetails";

interface ProductPanelProps {
  product: Product;
  pricing: PricingResult;
  onUpdate: (updates: Partial<Product>) => void;
  onReset: () => void;
}

export default function ProductPanel({ product, pricing, onUpdate, onReset }: ProductPanelProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-3">
            {product.title}
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-mono">
              {product.asin}
            </span>
            <a
              href={product.amazon_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-all"
            >
              <ExternalLink size={12} />
              View on Amazon
            </a>
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/40 text-xs hover:text-white/70 hover:bg-white/8 transition-all flex-shrink-0"
        >
          <RotateCcw size={12} />
          New
        </button>
      </div>

      {/* Brand Override + Weight */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="col-span-2 sm:col-span-2">
          <label className="text-xs text-white/35 font-medium block mb-1.5">Brand Override</label>
          <input
            type="text"
            value={product.brand}
            onChange={e => onUpdate({ brand: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-amber-300 focus:outline-none focus:border-amber-400/40 transition-all font-mono uppercase"
          />
        </div>
        <div>
          <label className="text-xs text-white/35 font-medium block mb-1.5">Weight</label>
          <div className="relative">
            <input
              type="number"
              value={product.weight_g}
              onChange={e => onUpdate({ weight_g: Number(e.target.value) })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-400/40 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">g</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-white/35 font-medium block mb-1.5">Copy Title</label>
          <CopyButton text={product.title} label="Copy" className="w-full" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="space-y-6">
        {/* Branded Images Section - Full Width at Top */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Branded Images</h3>
            {product.branded_images.length > 0 && (
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                {product.branded_images.length} processed
              </span>
            )}
          </div>
          {product.branded_images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {product.branded_images.slice(0, 3).map((img, idx) => (
                <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-lg">
                  <img
                    src={img}
                    alt={`Branded ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <a
                    href={img}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/60 flex items-center justify-center gap-2 transition-all"
                  >
                    <ExternalLink size={16} className="text-white" />
                    <span className="text-white text-xs">View</span>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/3 p-6 text-center text-white/30 text-sm">
              No branded images yet. Apply branding from the image editor below.
            </div>
          )}
        </div>

        {/* Image Editor */}
        <div>
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">Image Editor</h3>
          <ImageGrid
            originalImages={product.original_images}
            brandName={product.brand}
            onBrandedImages={urls => onUpdate({ branded_images: urls })}
          />
        </div>

        {/* Description & Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Description */}
          {product.description && (
            <div className="rounded-2xl bg-white/3 border border-white/10 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-white/30" />
                  <span className="text-xs text-white/50 font-medium uppercase tracking-wider">Description</span>
                </div>
                <CopyButton text={product.description} label="Copy" />
              </div>
              <ul className="space-y-2">
                {product.description.split("\n").filter(Boolean).map((line, i) => (
                  <li key={i} className="flex gap-2 text-xs text-white/60 leading-relaxed">
                    <span className="text-amber-400/50 flex-shrink-0">▸</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Specs */}
          <div className="rounded-2xl bg-white/3 border border-white/10 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Tag size={14} className="text-white/30" />
              <span className="text-xs text-white/50 font-medium uppercase tracking-wider">Product Specs</span>
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/40">ASIN</span>
                <span className="text-white/80 font-mono">{product.asin}</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/40">Weight</span>
                <span className="text-white/80 font-mono">{product.weight_g}g</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/40">Images Extracted</span>
                <span className="text-white/80 font-mono">{product.original_images.length}</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/40">Created</span>
                <span className="text-white/80 text-xs">{new Date(product.created_at).toLocaleDateString()}</span>
              </div>
              <div className="h-px bg-white/5" />
              <CopyButton
                text={`${product.title} - ASIN: ${product.asin} - ${product.weight_g}g`}
                label="Copy Full Spec"
                className="w-full justify-center mt-1"
              />
            </div>
          </div>
        </div>

        {/* Pricing Editor */}
        <PricingEditor
          productCost={product.product_cost}
          profit={product.profit}
          safety={product.safety}
          weightG={product.weight_g}
          onUpdate={(fields) => onUpdate(fields)}
        />

        {/* Pricing Cards */}
        <PricingCards pricing={pricing} weightG={product.weight_g} />

        {/* Product Details */}
        <ProductDetails details={product.product_details} />
      </div>
    </div>
  );
}
