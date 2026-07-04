// Single source of truth for brand contact details, pulled from the legacy
// index.html. Centralising these means updating a phone number or address
// once here updates the nav, footer, contact section, and floating WhatsApp
// button together — instead of hunting through markup in six places.
export const SITE_CONFIG = {
  name: "Kiemo Mens Wear",
  tagline: "Premium menswear for the modern Nairobi gentleman.",
  whatsappNumber: "254731881594",
  whatsappDisplay: "0731 881 594",
  instagramHandle: "@kiemo_mens_wear",
  instagramUrl: "https://www.instagram.com/kiemo_mens_wear",
  tiktokHandle: "@kiemomenswear",
  tiktokUrl: "https://www.tiktok.com/@kiemomenswear",
  address: "Lyric House, 6th Floor, Kimathi Street, Nairobi",
  hours: "Mon–Sat: 9AM – 7PM · Sun: 11AM – 5PM",
  foundedYear: 2018,
} as const;

export function whatsappContactUrl(message: string): string {
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

// Builds the pre-filled WhatsApp message for an order placed via the
// "Order via WhatsApp" checkout button. The order is saved to Supabase
// first (see CheckoutModal/api/orders), then this message is opened so
// the shop and customer can confirm availability directly.
export function buildWhatsAppOrderMessage(params: {
  orderRef: string;
  fullName: string;
  phone: string;
  items: { name: string; size: string | null; qty: number; price: number }[];
  subtotal: number;
  pickupMethod: "pickup" | "delivery";
  deliveryArea: string | null;
}): string {
  const { orderRef, fullName, phone, items, subtotal, pickupMethod, deliveryArea } = params;

  const itemLines = items
    .map((i) => `- ${i.name}${i.size ? ` (${i.size})` : ""} x${i.qty} — KSh ${(i.price * i.qty).toLocaleString("en-KE")}`)
    .join("\n");

  const fulfilment =
    pickupMethod === "delivery"
      ? `Delivery to: ${deliveryArea ?? "Nairobi"}`
      : "Pickup at shop: Kimathi Street";

  return [
    `Hello Kiemo! I'd like to place an order (Ref: ${orderRef}).`,
    "",
    `Name: ${fullName}`,
    `Phone: ${phone}`,
    "",
    "Items:",
    itemLines,
    "",
    `Total: KSh ${subtotal.toLocaleString("en-KE")}`,
    fulfilment,
    "",
    "Please confirm availability.",
  ].join("\n");
}

// Delivery is restricted to Nairobi per Part 3 of the brief. This list
// drives the delivery-area <select> in the checkout modal; "Other Nairobi
// Area" covers anywhere not explicitly listed while keeping the hard
// restriction to Nairobi (validated again server-side in the API route).
export const NAIROBI_DELIVERY_AREAS = [
  "Nairobi CBD",
  "Westlands",
  "Kilimani",
  "Kileleshwa",
  "Lavington",
  "Karen",
  "Runda",
  "Upper Hill",
  "Parklands",
  "South B",
  "South C",
  "Langata",
  "Embakasi",
  "Ngong Road",
  "Other Nairobi Area",
] as const;
