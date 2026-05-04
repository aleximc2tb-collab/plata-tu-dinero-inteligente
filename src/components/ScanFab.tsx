import { QrCode } from "lucide-react";

interface Props {
  onClick: () => void;
}

/**
 * Botón flotante dorado para escanear ticket / pegar link.
 * Posicionado por encima de la nav inferior.
 */
export function ScanFab({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      aria-label="Escanear ticket"
      title="Escanear ticket"
      className="tap fixed z-40 bottom-24 right-5 h-14 w-14 rounded-full grid place-items-center shadow-elegant active:scale-90 transition-transform"
      style={{
        background: "var(--gradient-gold, linear-gradient(135deg, #F5C518, #E0A800))",
        boxShadow: "0 10px 30px -8px color-mix(in oklab, #F5C518 60%, transparent)",
      }}
    >
      <QrCode className="h-6 w-6 text-black" strokeWidth={2.4} />
      <span className="absolute inset-0 rounded-full ring-2 ring-primary/30 animate-pulse pointer-events-none" />
    </button>
  );
}
