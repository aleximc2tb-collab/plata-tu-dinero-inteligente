import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Money } from "@/components/Money";
import { EmptyState } from "@/components/EmptyState";
import { RequireAuth } from "@/components/RequireAuth";
import { greeting, daysUntilMonthEnd } from "@/lib/format";
import { useFinance } from "@/hooks/useFinance";
import { ArrowDownRight, ArrowUpRight, TrendingUp, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/resumen")({
  head: () => ({ meta: [{ title: "Resumen — Plata" }, { name: "description", content: "Tu balance, ingresos y gastos del mes en un vistazo." }] }),
  component: () => <RequireAuth><Resumen /></RequireAuth>,
});

function Resumen() {
  const { wallets, transactions } = useFinance();
  const total = wallets.reduce((s, w) => s + (w.balance ?? 0), 0);
  const month = new Date().getMonth();
  const monthTx = transactions.filter((t) => new Date(t.occurred_at).getMonth() === month);
  const ingresos = monthTx.filter((t) => t.type === "ingreso").reduce((s, t) => s + t.amount, 0);
  const gastos = monthTx.filter((t) => t.type === "gasto").reduce((s, t) => s + t.amount, 0);
  const days = daysUntilMonthEnd();

  return (
    <AppShell>
      <section className="animate-fade-up">
        <p className="text-sm text-muted-foreground">{greeting()},</p>
        <h2 className="text-2xl font-bold tracking-tight">¿Cómo va tu plata hoy?</h2>

        <div className="mt-5 glass-gold rounded-3xl p-6 shadow-elegant relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full" style={{ background: "var(--gradient-gold)", opacity: 0.15, filter: "blur(30px)" }} />
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Balance total
          </div>
          <div className="mt-2"><Money value={total} animate className="text-5xl font-black" /></div>
          <p className="mt-3 text-xs text-muted-foreground">
            Te quedan <span className="text-primary font-semibold">{days} días</span> para fin de mes
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><ArrowUpRight className="h-4 w-4 text-primary" /> Ingresos</div>
            <Money value={ingresos} className="block mt-2 text-xl font-bold text-primary" />
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><ArrowDownRight className="h-4 w-4" /> Gastos</div>
            <Money value={gastos} className="block mt-2 text-xl font-bold" />
          </div>
        </div>

        <div className="mt-4 glass rounded-2xl p-5">
          <p className="text-sm leading-relaxed">
            <span className="text-primary font-semibold">💡 Tip:</span> Asigná cada peso antes de gastarlo y vas a llegar a fin de mes con plata.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Última actividad</h3>
          {transactions.length > 0 && (
            <Link to="/actividad" className="text-xs text-primary tap flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> Ver todo</Link>
          )}
        </div>

        {transactions.length === 0 ? (
          <EmptyState emoji="✨" title="Empezá a registrar"
            description="Cuando agregues una billetera y tu primer gasto, vas a ver tu actividad acá."
            action={<Link to="/billeteras" className="tap inline-flex h-12 px-5 rounded-2xl bg-primary text-primary-foreground font-semibold items-center">Crear billetera</Link>} />
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="glass rounded-2xl p-4 flex items-center gap-3 tap">
                <div className="h-10 w-10 rounded-xl bg-muted grid place-items-center text-xl">{t.category_emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.category}</p>
                  <p className="text-xs text-muted-foreground">{new Date(t.occurred_at).toLocaleDateString("es-AR")}</p>
                </div>
                <Money value={t.type === "gasto" ? -t.amount : t.amount} className={`text-sm font-semibold ${t.type === "ingreso" ? "text-primary" : ""}`} />
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
