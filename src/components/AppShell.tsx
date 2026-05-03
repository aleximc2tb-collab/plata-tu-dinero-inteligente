import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Wallet, ListOrdered, PieChart, Settings } from "lucide-react";

const tabs = [
  { to: "/resumen", label: "Resumen", icon: Home },
  { to: "/billeteras", label: "Billeteras", icon: Wallet },
  { to: "/actividad", label: "Actividad", icon: ListOrdered },
  { to: "/presupuesto", label: "Presupuesto", icon: PieChart },
] as const;

export function AppShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-30 px-5 pt-5 pb-3 flex items-center justify-between bg-background/70 backdrop-blur-xl">
        <Link to="/perfil" className="tap">
          <div className="h-10 w-10 rounded-full glass-gold grid place-items-center font-semibold text-primary">P</div>
        </Link>
        {title && <h1 className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{title}</h1>}
        <Link to="/ajustes" className="tap h-10 w-10 rounded-full glass grid place-items-center">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </Link>
      </header>

      <main className="flex-1 pb-28 px-5">{children}</main>

      <nav className="fixed bottom-0 inset-x-0 z-40 px-4 pb-5 pt-2 pointer-events-none">
        <div className="pointer-events-auto mx-auto max-w-md glass rounded-3xl px-2 py-2 flex items-center justify-between shadow-elegant">
          {tabs.map((t) => {
            const active = path.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`tap flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-colors ${
                  active ? "bg-gold-soft text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium tracking-wide">{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
