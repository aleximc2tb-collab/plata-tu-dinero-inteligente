/**
 * Money utilities — ÚNICO punto de entrada para parseo y formato monetario.
 * Toda cantidad en la app debe pasar por acá.
 */

/**
 * Parsea un string monetario y devuelve un number (float) o null si es inválido.
 * Soporta:
 *  - "18.978,79"  → 18978.79  (formato es-AR)
 *  - "18,978.79"  → 18978.79  (formato en-US)
 *  - "18978.79"   → 18978.79
 *  - "18978,79"   → 18978.79
 *  - "$ 1.500"    → 1500
 *  - 1500         → 1500
 */
export function parseAmount(input: unknown): number | null {
  if (input === null || input === undefined || input === "") return null;
  if (typeof input === "number") {
    return Number.isFinite(input) ? input : null;
  }
  if (typeof input !== "string") return null;

  // Limpieza: quitar símbolos y espacios
  let s = input.trim().replace(/[^\d.,\-]/g, "");
  if (!s) return null;

  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");

  if (lastDot !== -1 && lastComma !== -1) {
    // Ambos: el último es el separador decimal
    if (lastComma > lastDot) {
      // formato es-AR: "18.978,79"
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      // formato en-US: "18,978.79"
      s = s.replace(/,/g, "");
    }
  } else if (lastComma !== -1) {
    // Solo coma → decimal
    s = s.replace(/\./g, "").replace(",", ".");
  }
  // Solo punto o sin separadores → ya es válido para Number()

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Formato de moneda ARS para UI. NO usar el resultado en cálculos.
 */
const arsFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatARS(amount: number, opts: { sign?: boolean } = {}): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const sign = opts.sign && safe > 0 ? "+" : "";
  return sign + arsFormatter.format(safe);
}

/**
 * Devuelve true si el monto es válido para ser registrado (> 0 y finito).
 */
export function isValidAmount(n: number | null | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}
