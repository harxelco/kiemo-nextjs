export type PickupMethod = "pickup" | "delivery";

export interface OrderLineItem {
  product_id: number;
  name: string;
  price: number;
  qty: number;
  size: string | null;
}

// What the client sends to POST /api/orders
export interface OrderRequestBody {
  full_name: string;
  phone: string;
  pickup_method: PickupMethod;
  delivery_area: string | null;
  items: OrderLineItem[];
}

// A row in the Supabase `orders` table (see supabase/migrations/0001_phase1_orders.sql)
export interface Order {
  id: string;
  order_ref: string;
  created_at: string;
  full_name: string;
  phone: string;
  pickup_method: PickupMethod;
  delivery_area: string | null;
  items: OrderLineItem[];
  subtotal: number;
  status: "new" | "confirmed" | "fulfilled" | "cancelled";
}
