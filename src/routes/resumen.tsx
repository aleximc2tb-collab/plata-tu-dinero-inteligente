import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Money } from "@/components/Money";
import { EmptyState } from "@/components/EmptyState";
import { RequireAuth } from "@/components/RequireAuth";
import { greeting, daysUntilMonthEnd } from "@/lib/format";
import { useFinance } from "@/hooks/useFinance";
import { useCardAlerts } from "@/hooks/useCardAlerts";
import { useAuth } from "@/hooks/useAuth";
import { processDueRecurring } from "@/hooks/useRecurring";
import { ArrowDownRight, ArrowUpRight, TrendingUp, Sparkles, AlertTriangle } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/resumen")({
  head: () => ({ meta: [{ title: "Resumen — Plata" }, { name: "description", content: "Tu balance, ingresos y gastos del mes en un vistazo." }] }),
  component: () => <RequireAuth><Resumen /></RequireAuth>,
});

function Resumen() {
  const { user } = useAuth();
  const { wallets, transactions, refresh } = useFinance();
  const cardAlerts = useCardAlerts(wallets, transactions);
  const urgentCards = cardAlerts.filter((a) => a.level === "urgent" || a.level === "warn");

  useEffect(() => {
    if (!user) return;
    processDueRecurring(user.id).then((n) => { if (n > 0) refresh(); });
  }, [user, refresh]);
  const total = wallets.reduce((s, w) => s + (w.balance ?? 0), 0);
  const month = new Date().getMonth();
  const monthTx = transactions.filter((t) => new Date(t.occurred_at).getMonth() === month);
  const ingresos = monthTx.filter((t) => t.type === "ingreso").reduce((s, t) => s + t.amount, 0);
  const gastos = monthTx.filter((t) => t.type === "gasto").reduce((s, t) => s + t.amount, 0);
  const days = daysUntilMonthEnd();
  const ahorro = ingresos - gastos;
  const ratio = ingresos > 0 ? gastos / ingresos : 0;
  const dailyBudget = total > 0 && days > 0 ? total / Math.max(days, 1) : 0;

  // Top categoría del mes
  const byCat = monthTx.filter((t) => t.type === "gasto").reduce<Record<string, { total: number; emoji: string }>>((acc, t) => {
    acc[t.category] = acc[t.category] || { total: 0, emoji: t.category_emoji };
    acc[t.category].total += t.amount;
    return acc;
  }, {});
  const topCat = Object.entries(byCat).sort((a, b) => b[1].total - a[1].total)[0];

  let tip = "Asigná cada peso antes de gastarlo y vas a llegar a fin de mes con plata.";
  if (gastos === 0 && ingresos === 0) tip = "Empezá registrando tu primer ingreso o gasto del mes.";
  else if (ratio > 1) tip = "Estás gastando más de lo que ingresás. Revisá tus categorías.";
  else if (ratio > 0.8) tip = "Vas al 80% de tus ingresos. Cuidado con los próximos gastos.";
  else if (ahorro > 0 && ingresos > 0) tip = `¡Buen mes! Llevás ahorrado ${Math.round((ahorro/ingresos)*100)}% de tus ingresos.`;
  else if (topCat) tip = `Tu mayor gasto es ${topCat[1].emoji} ${topCat[0]}. ¿Lo tenés presupuestado?`;

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
            {dailyBudget > 0 && <> · ritmo diario <Money value={dailyBudget} className="text-primary" /></>}
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
            <span className="text-primary font-semibold">💡 Tip:</span> {tip}
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
