import { ScanLine } from "lucide-react";

interface Props {
  onClick: () => void;
}

/**
 * FAB MangoX — escanear ticket. Centro inferior.
 */
export function ScanFab({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      aria-label="Escanear ticket"
      title="Escanear ticket"
      className="tap fixed z-40 bottom-24 left-1/2 -translate-x-1/2 h-16 w-16 rounded-full grid place-items-center active:scale-90"
      style={{
        background: "var(--gradient-gold)",
        boxShadow: "0 14px 30px -10px oklch(0.78 0.17 55 / 0.55)",
      }}
    >
      <ScanLine className="h-7 w-7 text-white" strokeWidth={2.2} />
    </button>
  );
}
