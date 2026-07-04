// Mirrors the shape already produced by the source spreadsheet import
// (data/products.js in the legacy site / IMPORT_SUMMARY.md). Field names
// and values are UNCHANGED from the original — only the type layer is new.
//
// sizes / colors / stock are intentionally optional and mostly empty right
// now (Part 5 of the brief: "Keep these optional for now. Do not force
// values."). The dashboard (Phase 4) will be the place these get populated.
export interface Product {
  id: number;
  sku: string;
  slug: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  oldPrice: number | null;
  isNew: boolean;
  isOffer: boolean;
  featured: boolean;
  stock: number | null;
  sizes: string[];
  colors: string[];
  unavailable: string[];
  img: string;
  images: string[];
  desc: string;
  reviews?: number;
  badge?: string;
}

export interface CartItem {
  product: Product;
  size: string | null;
  qty: number;
}
