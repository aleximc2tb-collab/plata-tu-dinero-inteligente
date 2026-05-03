interface Props {
  emoji: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ emoji, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center text-center py-16 animate-fade-up">
      <div className="h-24 w-24 rounded-full glass-gold grid place-items-center text-4xl mb-5 shadow-glow">
        {emoji}
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">{description}</p>
      {action}
    </div>
  );
}
