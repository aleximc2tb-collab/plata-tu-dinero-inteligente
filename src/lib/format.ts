export function formatARS(value: number, opts: { sign?: boolean } = {}): string {
  const sign = opts.sign && value > 0 ? "+" : "";
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return sign + formatted;
}

export function splitARS(value: number): { whole: string; cents: string; negative: boolean } {
  const negative = value < 0;
  const abs = Math.abs(value);
  const whole = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(Math.floor(abs));
  const cents = (Math.round((abs - Math.floor(abs)) * 100)).toString().padStart(2, "0");
  return { whole: `$${whole}`, cents, negative };
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

export function daysUntilMonthEnd(): number {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
}
