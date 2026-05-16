export interface Product {
  id: string;
  asin: string;
  title: string;
  brand: string;
  description: string;
  weight_g: number;
  original_images: string[];
  branded_images: string[];
  price_usd: number;
  price_cad: number;
  price_inr: number;
  product_cost: number;
  profit: number;
  safety: number;
  shipping_cost_usd: number;
  shipping_cost_cad: number;
  amazon_url: string;
  raw_data: Record<string, unknown>;
  product_details?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface PricingResult {
  // INR components
  productCost: number;
  profit: number;
  safety: number;
  shippingUsd: number;
  shippingCad: number;
  grossUsd: number;
  grossCad: number;
  amazonFeeUsd: number;
  amazonFeeCad: number;
  totalInrUsd: number;
  totalInrCad: number;
  // Final prices
  priceUsd: number;
  priceCad: number;
  // Weight
  roundedWeightG: number;
}

export interface ScrapeResult {
  asin: string;
  title: string;
  description: string;
  weight_g: number;
  original_images: string[];
  amazon_url: string;
  product_details?: Record<string, string>;
}
