import { Logo } from "./Logo";
import type { LucideIcon } from "lucide-react";

interface Props {
  /** Legacy emoji prop — ignored visually (we use the logo or icon). */
  emoji?: string;
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center text-center py-14 animate-fade-up">
      <div className="h-24 w-24 rounded-3xl bg-muted/60 grid place-items-center mb-5">
        {Icon ? <Icon className="h-10 w-10 text-primary" strokeWidth={1.6} /> : <Logo size={64} />}
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}
