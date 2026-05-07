import { Info } from "lucide-react";

/**
 * Microcopy contextual: línea pequeña con icono para guiar al usuario.
 * Uso: <Microcopy>Tip: usá el botón central para escanear un ticket.</Microcopy>
 */
export function Microcopy({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground ${className}`}>
      <Info className="h-3 w-3 mt-0.5 shrink-0 text-primary/70" strokeWidth={2} />
      <span>{children}</span>
    </p>
  );
}
