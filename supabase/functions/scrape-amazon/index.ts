import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function extractAsin(url: string): string | null {
  const match = url.match(/\/dp\/([A-Z0-9]{10})/i);
  return match ? match[1].toUpperCase() : null;
}

function cleanImageUrl(url: string): string {
  let clean = url.replace(/\?.*$/, "");
  // Remove Amazon resize suffixes like ._SY300_SX300_QL70_FMwebp_
  clean = clean.replace(/\._[A-Za-z0-9,_\-]+_\./g, ".");
  return clean;
}

function extractImages(html: string): string[] {
  const images: string[] = [];

  // Try colorImages data
  try {
    const colorMatch = html.match(/"colorImages"\s*:\s*\{[^}]*"initial"\s*:\s*(\[[\s\S]*?\])/);
    if (colorMatch) {
      const arr = JSON.parse(colorMatch[1]);
      for (const img of arr) {
        const url = img.hiRes || img.large || img.main;
        if (url && typeof url === "string") {
          images.push(cleanImageUrl(url));
        }
      }
    }
  } catch (_) { /* ignore */ }

  // Fallback: data-a-dynamic-image
  if (images.length === 0) {
    try {
      const dynMatch = html.match(/data-a-dynamic-image="([^"]+)"/);
      if (dynMatch) {
        const obj = JSON.parse(dynMatch[1].replace(/&quot;/g, '"'));
        for (const url of Object.keys(obj)) {
          images.push(cleanImageUrl(url));
        }
      }
    } catch (_) { /* ignore */ }
  }

  // Fallback: any Amazon image URLs (prefer large ones)
  if (images.length === 0) {
    const imgMatches = html.matchAll(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9\-_.]+\.jpg/g);
    for (const m of imgMatches) {
      const url = cleanImageUrl(m[0]);
      // Skip tiny thumbnails (SS40, SS100 etc are small)
      if (!m[0].includes("SS40") && !m[0].includes("SS100") && !m[0].includes("SS200") && !images.includes(url)) {
        images.push(url);
      }
    }
  }

  // Deduplicate and return top 3
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const img of images) {
    if (!seen.has(img)) {
      seen.add(img);
      unique.push(img);
    }
    if (unique.length >= 3) break;
  }
  return unique;
}

function extractTitle(html: string): string {
  let match = html.match(/<span[^>]*id="productTitle"[^>]*>([\s\S]*?)<\/span>/i);
  if (match) return match[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').trim();

  match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (match) return match[1].trim();

  match = html.match(/<title>([^<]+)<\/title>/i);
  if (match) {
    let title = match[1].trim();
    title = title.replace(/\s*[:|–-]\s*Amazon\..*/i, "");
    if (title.length > 10) return title;
  }

  return "";
}

function extractDescription(html: string): string {
  const bullets: string[] = [];

  // feature-bullets
  const featureMatch = html.match(/<div[^>]+id="feature-bullets"[\s\S]*?<\/div>/i);
  if (featureMatch) {
    const section = featureMatch[0];
    const items = section.matchAll(/<li[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/gi);
    for (const item of items) {
      let text = item[1]
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim();
      if (text && text.length > 10 && !text.toLowerCase().includes("make sure")) {
        bullets.push(text);
      }
    }
  }

  return bullets.slice(0, 6).join("\n") || "";
}

function extractWeight(html: string): number {
  let match = html.match(/(\d+(?:\.\d+)?)\s*g(?:ram)?s?(?:\s|<|$)/i);
  if (match) return Math.round(parseFloat(match[1]));

  match = html.match(/(\d+(?:\.\d+)?)\s*kg\b/i);
  if (match) return Math.round(parseFloat(match[1]) * 1000);

  match = html.match(/(\d+(?:\.\d+)?)\s*(?:oz|ounce)/i);
  if (match) return Math.round(parseFloat(match[1]) * 28.35);

  match = html.match(/(\d+(?:\.\d+)?)\s*(?:lbs?|pound)/i);
  if (match) return Math.round(parseFloat(match[1]) * 453.6);

  // For liquid products (ml), estimate weight
  match = html.match(/(\d+)\s*ml\b/i);
  if (match) {
    const ml = parseInt(match[1]);
    return Math.round(ml * 1.05 + 150);
  }

  return 365;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&lrm;/g, "")
    .replace(/&rlm;/g, "")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .trim();
}

function extractProductDetails(html: string): Record<string, string> {
  const details: Record<string, string> = {};

  // Look for detailBullets section (About this item)
  const aboutMatch = html.match(/<div[^>]*id="detailBullets_feature_div"[\s\S]*?<\/div>/i);
  if (aboutMatch) {
    const section = aboutMatch[0];
    // Extract li elements
    const rows = section.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    for (const row of rows) {
      const content = row[1];
      // Extract text between spans, clean HTML
      const text = content
        .replace(/<[^>]+>/g, " ")
        .split("\n")
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .join(" ");

      const cleaned = decodeHtmlEntities(text);

      // Try to split by colon
      if (cleaned.includes(":")) {
        const idx = cleaned.indexOf(":");
        const key = cleaned.substring(0, idx).trim();
        const value = cleaned.substring(idx + 1).trim();
        if (key.length > 3 && key.length < 100 && value.length > 0 && value.length < 500) {
          details[key] = value;
        }
      }
    }
  }

  return details;
}

async function findProductUrlViaDDG(asin: string): Promise<string | null> {
  try {
    const ddgUrl = `https://html.duckduckgo.com/html/?q=amazon+${asin}+product`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const resp = await fetch(ddgUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html",
      },
    });

    clearTimeout(timeoutId);

    if (!resp.ok) return null;

    const html = await resp.text();

    // Look for Amazon product URLs in DDG results
    const urlPatterns = [
      new RegExp(`https://www\\.amazon\\.in/[^"']*?/dp/${asin}`, "gi"),
      new RegExp(`https://www\\.amazon\\.com/[^"']*?/dp/${asin}`, "gi"),
      new RegExp(`https://www\\.amazon\\.[a-z.]+/[^"']*?/dp/${asin}`, "gi"),
    ];

    for (const pattern of urlPatterns) {
      const match = html.match(pattern);
      if (match) return match[0];
    }
  } catch (_) { /* ignore */ }

  return null;
}

async function fetchAmazonPage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    clearTimeout(timeoutId);

    if (!resp.ok) return null;

    const html = await resp.text();
    // Verify it's a real product page
    if (html.includes("productTitle") || html.includes("product-title")) {
      return html;
    }
  } catch (_) { /* ignore */ }

  return null;
}

async function fetchProductHtml(asin: string): Promise<string> {
  // Strategy 1: Try Amazon.in directly (less strict than .com)
  const inUrl = `https://www.amazon.in/dp/${asin}`;
  let html = await fetchAmazonPage(inUrl);
  if (html) return html;

  // Strategy 2: Try Amazon.com
  const comUrl = `https://www.amazon.com/dp/${asin}`;
  html = await fetchAmazonPage(comUrl);
  if (html) return html;

  // Strategy 3: Use DuckDuckGo to find the product URL on any Amazon TLD
  const foundUrl = await findProductUrlViaDDG(asin);
  if (foundUrl) {
    html = await fetchAmazonPage(foundUrl);
    if (html) return html;
  }

  // Strategy 4: Try other Amazon TLDs
  const tlds = ["co.uk", "ca", "de", "com.au"];
  for (const tld of tlds) {
    const url = `https://www.amazon.${tld}/dp/${asin}`;
    html = await fetchAmazonPage(url);
    if (html) return html;
  }

  throw new Error("Could not fetch product page. Amazon may be blocking requests. Please try again later.");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { url } = await req.json() as { url?: string };

    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const asin = extractAsin(url);
    if (!asin) {
      return new Response(JSON.stringify({ error: "Could not extract ASIN from URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = await fetchProductHtml(asin);

    const title = extractTitle(html);
    const description = extractDescription(html);
    const weight_g = extractWeight(html);
    const images = extractImages(html);
    const productDetails = extractProductDetails(html);

    const result = {
      asin,
      title: title || "Product",
      description: description || "Premium quality product",
      weight_g: weight_g || 365,
      original_images: images,
      amazon_url: `https://www.amazon.com/dp/${asin}`,
      product_details: productDetails,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Scrape error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
