import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Money } from "@/components/Money";
import { greeting, daysUntilMonthEnd } from "@/lib/format";
import { wallets, transactions } from "@/lib/mock";
import { ArrowDownRight, ArrowUpRight, TrendingUp, Sparkles } from "lucide-react";

export const Route = createFileRoute("/resumen")({
  head: () => ({ meta: [{ title: "Resumen — Plata" }, { name: "description", content: "Tu balance, ingresos y gastos del mes en un vistazo." }] }),
  component: Resumen,
});

function Resumen() {
  const total = wallets.reduce((s, w) => s + w.balance, 0);
  const month = new Date().getMonth();
  const monthTx = transactions.filter((t) => new Date(t.date).getMonth() === month);
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
          <div className="mt-2">
            <Money value={total} animate className="text-5xl font-black" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Te quedan <span className="text-primary font-semibold">{days} días</span> para fin de mes · actualizado hace 1 min
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ArrowUpRight className="h-4 w-4 text-primary" /> Ingresos
            </div>
            <Money value={ingresos} className="block mt-2 text-xl font-bold text-primary" />
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ArrowDownRight className="h-4 w-4" /> Gastos
            </div>
            <Money value={gastos} className="block mt-2 text-xl font-bold" />
          </div>
        </div>

        <div className="mt-4 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Evolución del balance</h3>
            <span className="text-xs text-primary flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> +4,2% vs semana</span>
          </div>
          <Sparkline />
        </div>

        <div className="mt-4 glass rounded-2xl p-5">
          <p className="text-sm leading-relaxed">
            <span className="text-primary font-semibold">💡 Tip del día:</span> Si asignás cada peso antes de gastarlo, llegás a fin de mes con plata.
          </p>
        </div>

        <h3 className="mt-6 mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Última actividad</h3>
        <div className="space-y-2">
          {transactions.slice(0, 4).map((t) => (
            <div key={t.id} className="glass rounded-2xl p-4 flex items-center gap-3 tap">
              <div className="h-10 w-10 rounded-xl bg-muted grid place-items-center text-xl">{t.categoryEmoji}</div>
              <div className="flex-1">
                <p className="text-sm font-medium">{t.category}</p>
                <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString("es-AR")}</p>
              </div>
              <Money value={t.type === "gasto" ? -t.amount : t.amount} className={`text-sm font-semibold ${t.type === "ingreso" ? "text-primary" : ""}`} />
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function Sparkline() {
  const points = [20, 28, 24, 35, 30, 42, 48, 45, 52, 60, 58, 66];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const w = 300, h = 70;
  const path = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / (max - min)) * h;
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L${w},${h} L0,${h} Z`} fill="url(#g)" />
      <path d={path} fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
