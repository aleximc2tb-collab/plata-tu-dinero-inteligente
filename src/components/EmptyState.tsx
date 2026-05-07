import { Logo } from "./Logo";
import type { LucideIcon } from "lucide-react";

interface Props {
  /** Legacy emoji prop — ignored visually (we use the logo or icon). */
  emoji?: string;
  icon?: LucideIcon;
  title: string;
  description: string;
  /** Pasos guiados opcionales: lista corta de próximos pasos. */
  steps?: string[];
  /** Microcopy chico debajo del CTA (tip / aclaración). */
  hint?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  steps,
  hint,
  action,
  secondaryAction,
}: Props) {
  return (
    <div className="flex flex-col items-center text-center py-12 animate-fade-up">
      <div className="h-20 w-20 rounded-3xl bg-primary/10 grid place-items-center mb-5">
        {Icon ? <Icon className="h-9 w-9 text-primary" strokeWidth={1.6} /> : <Logo size={56} />}
      </div>
      <h3 className="text-lg font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-5 leading-relaxed">{description}</p>

      {steps && steps.length > 0 && (
        <ol className="text-left max-w-xs w-full mb-5 space-y-2">
          {steps.map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-primary/15 text-primary text-[11px] font-bold grid place-items-center">
                {i + 1}
              </span>
              <span className="text-foreground/85 leading-snug">{s}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="flex flex-col items-center gap-2 w-full max-w-xs">
        {action}
        {secondaryAction}
      </div>

      {hint && (
        <p className="mt-4 text-[11px] text-muted-foreground max-w-xs leading-relaxed">{hint}</p>
      )}
    </div>
  );
}
