import { splitARS } from "@/lib/format";
import { useEffect, useState } from "react";

interface Props {
  value: number;
  className?: string;
  centsClassName?: string;
  animate?: boolean;
}

export function Money({ value, className = "", centsClassName = "", animate = false }: Props) {
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
  return (
    <span className={`num ${className}`}>
      {negative && "−"}
      {whole}
      <span className={`text-[0.55em] align-top ml-0.5 opacity-70 ${centsClassName}`}>,{cents}</span>
    </span>
  );
}
