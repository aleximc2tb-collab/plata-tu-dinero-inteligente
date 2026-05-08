import { forwardRef, useMemo } from "react";
import { parseAmount } from "@/utils/money";

/**
 * Input de plata con formato ARS en vivo.
 * - Internamente trabaja con string (compatible con parseAmount).
 * - Muestra "120.000" mientras tipeás 120000.
 * - Permite decimales con coma: "120.000,50".
 * - NO toca la lógica financiera: el value sigue siendo string parseable.
 */
interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type"> {
  value: string;
  onChange: (raw: string) => void;
}

function formatLive(raw: string): string {
  if (!raw) return "";
  // Solo dígitos, una coma decimal y signo opcional
  let s = raw.replace(/[^\d,\-]/g, "");
  // Mantener un solo "-" al inicio
  const negative = s.startsWith("-");
  s = s.replace(/-/g, "");
  // Solo una coma
  const firstComma = s.indexOf(",");
  if (firstComma !== -1) {
    s = s.slice(0, firstComma + 1) + s.slice(firstComma + 1).replace(/,/g, "");
  }
  const [intPart, decPart] = s.split(",");
  const intClean = intPart.replace(/^0+(?=\d)/, "");
  const intFmt = intClean ? new Intl.NumberFormat("es-AR").format(Number(intClean)) : "";
  let out = intFmt;
  if (decPart !== undefined) out += "," + decPart.slice(0, 2);
  return (negative ? "-" : "") + out;
}

export const MoneyInput = forwardRef<HTMLInputElement, Props>(function MoneyInput(
  { value, onChange, placeholder = "$0", className = "", ...rest },
  ref
) {
  const display = useMemo(() => formatLive(value), [value]);
  return (
    <input
      ref={ref}
      inputMode="decimal"
      autoComplete="off"
      value={display}
      onChange={(e) => onChange(formatLive(e.target.value))}
      placeholder={placeholder}
      className={className}
      {...rest}
    />
  );
});

/** Helper para mantener consistencia con parseAmount. */
export function moneyInputToNumber(v: string): number | null {
  return parseAmount(v);
}
