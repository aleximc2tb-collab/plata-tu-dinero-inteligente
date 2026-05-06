import { HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Props {
  title?: string;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
}

/**
 * Icono (?) con popover de ayuda contextual.
 * Uso: <HelpHint title="Disponible para asignar">Texto explicativo…</HelpHint>
 */
export function HelpHint({ title, children, align = "start" }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={title ? `Ayuda: ${title}` : "Ayuda"}
          className="tap inline-grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:text-primary transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={6}
        className="w-64 rounded-2xl glass-gold border-primary/30 p-4 shadow-elegant"
      >
        {title && <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-1.5">{title}</p>}
        <div className="text-xs leading-relaxed text-foreground/90 space-y-1.5">{children}</div>
      </PopoverContent>
    </Popover>
  );
}
