import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Wallet, ListOrdered, PieChart, Settings, User } from "lucide-react";
import { Logo } from "./Logo";

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
      <header className="sticky top-0 z-30 px-5 pt-5 pb-3 flex items-center justify-between bg-background/85 backdrop-blur-xl">
        <Link to="/perfil" className="tap h-10 w-10 rounded-full bg-muted grid place-items-center text-muted-foreground" aria-label="Perfil">
          <User className="h-5 w-5" strokeWidth={1.8} />
        </Link>
        {title ? (
          <h1 className="text-base font-semibold">{title}</h1>
        ) : (
          <Logo size={32} withWordmark />
        )}
        <Link to="/ajustes" className="tap h-10 w-10 rounded-full bg-muted grid place-items-center text-muted-foreground" aria-label="Ajustes">
          <Settings className="h-5 w-5" strokeWidth={1.8} />
        </Link>
      </header>

      <main className="flex-1 pb-32 px-5">{children}</main>

      <nav className="fixed bottom-0 inset-x-0 z-40 px-4 pb-5 pt-2 pointer-events-none">
        <div className="pointer-events-auto mx-auto max-w-md bg-card border border-border rounded-3xl px-2 py-2 flex items-center justify-between shadow-elegant">
          {tabs.map((t, i) => {
            const active = path.startsWith(t.to);
            const Icon = t.icon;
            // Espacio central para FAB
            const isCenterGap = i === 1;
            return (
              <>
                <Link
                  key={t.to}
                  to={t.to}
                  className={`tap flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
                  <span className="text-[10px] font-medium tracking-wide">{t.label}</span>
                </Link>
                {isCenterGap && <span key="gap" className="w-16 shrink-0" aria-hidden />}
              </>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
