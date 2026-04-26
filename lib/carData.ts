export function formatINR(val: string | number | null | undefined): string {
  const num = typeof val === "string" ? parseFloat(val) : (val ?? 0);
  if (!num || isNaN(num)) return "N/A";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}
