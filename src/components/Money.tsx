import { splitARS } from "@/lib/format";
import { useEffect, useState } from "react";

interface Props {
  value: number;
  className?: string;
  centsClassName?: string;
  animate?: boolean;
  /** Oculta los centavos cuando son ,00 (limpio para totales redondos). */
  hideZeroCents?: boolean;
}

/**
 * Visualización premium de plata (read-only).
 * - Parte entera grande y destacada.
 * - Centavos en superíndice, más chicos y suaves.
 * - Tabular nums para alineación tipográfica.
 *
 * NO usar dentro de inputs editables: ahí va MoneyInput.
 */
export function Money({
  value,
  className = "",
  centsClassName = "",
  animate = false,
  hideZeroCents = false,
}: Props) {
  const [v, setV] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate) { setV(value); return; }
    const start = performance.now();
    const duration = 900;
    const from = 0;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, animate]);

  const { whole, cents, negative } = splitARS(v);
  const showCents = !(hideZeroCents && cents === "00");

  return (
    <span
      className={`num inline-baseline tabular-nums tracking-tight ${className}`}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {negative && <span className="opacity-80">−</span>}
      {whole}
      {showCents && (
        <span
          className={`ml-[0.08em] align-super text-[0.55em] font-medium opacity-60 tracking-normal ${centsClassName}`}
          style={{ fontFeatureSettings: '"tnum"' }}
        >
          ,{cents}
        </span>
      )}
    </span>
  );
}
