/*
  # Create Products Vault Table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `asin` (text, unique) - Amazon Standard Identification Number as stable key
      - `title` (text) - Product title
      - `brand` (text) - Custom brand name override
      - `description` (text) - Product description/bullets
      - `weight_g` (integer) - Product weight in grams
      - `original_images` (jsonb) - Array of original Amazon image URLs
      - `branded_images` (jsonb) - Array of processed image URLs with branding
      - `price_usd` (numeric) - Calculated US price
      - `price_cad` (numeric) - Calculated Canadian price
      - `price_inr` (numeric) - Calculated INR cost
      - `product_cost` (numeric) - Base product cost in INR
      - `profit` (numeric) - Profit margin in INR
      - `safety` (numeric) - Safety buffer in INR
      - `shipping_cost_usd` (numeric) - Shipping cost for USD
      - `shipping_cost_cad` (numeric) - Shipping cost for CAD
      - `amazon_url` (text) - Original Amazon URL
      - `raw_data` (jsonb) - Full raw scraped data
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `products` table
    - Allow public read/write for this tool (no auth required per spec - internal tool)
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asin text UNIQUE NOT NULL,
  title text DEFAULT '',
  brand text DEFAULT 'LUXURY',
  description text DEFAULT '',
  weight_g integer DEFAULT 0,
  original_images jsonb DEFAULT '[]'::jsonb,
  branded_images jsonb DEFAULT '[]'::jsonb,
  price_usd numeric(10,2) DEFAULT 0,
  price_cad numeric(10,2) DEFAULT 0,
  price_inr numeric(10,2) DEFAULT 0,
  product_cost numeric(10,2) DEFAULT 699,
  profit numeric(10,2) DEFAULT 1000,
  safety numeric(10,2) DEFAULT 236,
  shipping_cost_usd numeric(10,2) DEFAULT 0,
  shipping_cost_cad numeric(10,2) DEFAULT 0,
  amazon_url text DEFAULT '',
  raw_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on products"
  ON products FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert on products"
  ON products FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update on products"
  ON products FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on products"
  ON products FOR DELETE
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS products_asin_idx ON products(asin);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON products(created_at DESC);
