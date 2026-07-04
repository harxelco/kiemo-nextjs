// Ported 1:1 from the legacy script.js formatPrice() — same output,
// same locale, same "KSh" prefix customers already recognise.
export function formatPrice(n: number): string {
  return "KSh " + n.toLocaleString("en-KE");
}

export function generateOrderRef(): string {
  const n = Math.floor(Math.random() * 9_000_000 + 1_000_000);
  return `KMW-${n}`;
}
