import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Money } from "@/components/Money";
import { EmptyState } from "@/components/EmptyState";
import { RequireAuth } from "@/components/RequireAuth";
import { ScanFab } from "@/components/ScanFab";
import { ScanTicketSheet } from "@/components/ScanTicketSheet";
import { HelpHint } from "@/components/HelpHint";
import { CategoryIcon } from "@/components/CategoryIcon";
import { greeting, daysUntilMonthEnd } from "@/lib/format";
import { useFinance } from "@/hooks/useFinance";
import { useCardAlerts } from "@/hooks/useCardAlerts";
import { useAuth } from "@/hooks/useAuth";
import { processDueRecurring } from "@/hooks/useRecurring";
import { ArrowDownRight, ArrowUpRight, ChevronRight, AlertTriangle, Receipt, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/resumen")({
  head: () => ({ meta: [{ title: "Resumen — MangoX" }, { name: "description", content: "Tu balance, ingresos y gastos del mes." }] }),
  component: () => <RequireAuth><Resumen /></RequireAuth>,
});

function Resumen() {
  const { user } = useAuth();
  const { wallets, transactions, refresh } = useFinance();
  const cardAlerts = useCardAlerts(wallets, transactions);
  const urgentCards = cardAlerts.filter((a) => a.level === "urgent" || a.level === "warn");
  const [scanOpen, setScanOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    processDueRecurring(user.id).then((n) => { if (n > 0) refresh(); });
  }, [user, refresh]);

  const openScan = () => {
    setScanOpen(true);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate?.(15); } catch { /* noop */ }
    }
  };
  const total = wallets.reduce((s, w) => s + (w.balance ?? 0), 0);
  const month = new Date().getMonth();
  const monthTx = transactions.filter((t) => new Date(t.occurred_at).getMonth() === month);
  const ingresos = monthTx.filter((t) => t.type === "ingreso").reduce((s, t) => s + t.amount, 0);
  const gastos = monthTx.filter((t) => t.type === "gasto").reduce((s, t) => s + t.amount, 0);
  const days = daysUntilMonthEnd();
  const ahorro = ingresos - gastos;
  const ratio = ingresos > 0 ? gastos / ingresos : 0;

  let tip = "Asigná cada peso antes de gastarlo.";
  if (gastos === 0 && ingresos === 0) tip = "Empezá registrando tu primer ingreso o gasto del mes.";
  else if (ratio > 1) tip = "Estás gastando más de lo que ingresás. Revisá tus categorías.";
  else if (ratio > 0.8) tip = "Vas al 80% de tus ingresos. Cuidado con los próximos gastos.";
  else if (ahorro > 0 && ingresos > 0) tip = `Buen mes. Llevás ahorrado ${Math.round((ahorro/ingresos)*100)}% de tus ingresos.`;

  return (
    <AppShell>
      <section className="animate-fade-up">
        <p className="text-sm text-muted-foreground">{greeting()},</p>
        <h2 className="text-xl font-semibold tracking-tight">¿Cómo va tu plata hoy?</h2>

        {/* Hero balance */}
        <div className="mt-5 rounded-3xl p-7 text-center bg-card border border-border shadow-elegant">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground">
            Disponible
            <HelpHint title="Disponible" align="center">
              <p>Es la suma de saldos de todas tus billeteras (efectivo, banco, MP).</p>
              <p>Las tarjetas de crédito muestran lo gastado del límite, no plata tuya.</p>
            </HelpHint>
          </div>
          <div className="mt-3"><Money value={total} animate className="text-5xl font-bold text-foreground" /></div>
          <p className="mt-3 text-xs text-muted-foreground">
            Te quedan <span className="text-primary font-semibold">{days} días</span> para fin de mes
          </p>
        </div>

        {/* Ingresos / Gastos */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 bg-card border border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-7 w-7 rounded-lg bg-accent/15 grid place-items-center">
                <ArrowUpRight className="h-4 w-4 text-accent" strokeWidth={2.2} />
              </span>
              Ingresos
            </div>
            <Money value={ingresos} className="block mt-2 text-lg font-semibold text-accent" />
          </div>
          <div className="rounded-2xl p-4 bg-card border border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-7 w-7 rounded-lg bg-primary/10 grid place-items-center">
                <ArrowDownRight className="h-4 w-4 text-primary" strokeWidth={2.2} />
              </span>
              Gastos
            </div>
            <Money value={gastos} className="block mt-2 text-lg font-semibold text-foreground" />
          </div>
        </div>

        {/* Tip */}
        <div className="mt-4 rounded-2xl p-4 bg-accent/8 border border-accent/20 flex gap-3">
          <Sparkles className="h-5 w-5 text-accent shrink-0 mt-0.5" strokeWidth={1.8} />
          <p className="text-sm leading-relaxed text-foreground/90">{tip}</p>
        </div>

        {urgentCards.length > 0 && (
          <Link to="/billeteras" className="mt-4 block tap">
            <div className="rounded-2xl p-4 border border-danger/40 bg-danger/5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-danger/15 grid place-items-center">
                <AlertTriangle className="h-5 w-5 text-danger" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">
                  {urgentCards.length === 1
                    ? `${urgentCards[0].wallet.name} vence pronto`
                    : `${urgentCards.length} tarjetas requieren atención`}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {urgentCards[0].daysToDue !== null && urgentCards[0].daysToDue <= 3
                    ? `Vencimiento en ${urgentCards[0].daysToDue} días`
                    : `Cierre en ${urgentCards[0].daysToClose} días`}
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* Últimos movimientos */}
        <div className="mt-7 flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Últimos movimientos</h3>
          {transactions.length > 0 && (
            <Link to="/actividad" className="text-xs text-primary tap inline-flex items-center gap-0.5 font-medium">
              Ver todo <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {transactions.length === 0 ? (
          <EmptyState icon={Receipt} title="Empezá a registrar"
            description="Cuando agregues una billetera y tu primer gasto, vas a ver tu actividad acá."
            action={<Link to="/billeteras" className="tap inline-flex h-12 px-5 rounded-2xl bg-primary text-primary-foreground font-semibold items-center">Crear billetera</Link>} />
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="rounded-2xl p-4 bg-card border border-border flex items-center gap-3 tap">
                <div className="h-11 w-11 rounded-xl bg-muted grid place-items-center">
                  <CategoryIcon name={t.category} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.category}</p>
                  <p className="text-xs text-muted-foreground">{new Date(t.occurred_at).toLocaleDateString("es-AR")}</p>
                </div>
                <Money value={t.type === "gasto" ? -t.amount : t.amount} className={`text-sm font-semibold ${t.type === "ingreso" ? "text-accent" : "text-foreground"}`} />
              </div>
            ))}
          </div>
        )}
      </section>

      <ScanFab onClick={openScan} />
      <ScanTicketSheet
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        wallets={wallets}
        onCreated={refresh}
      />
    </AppShell>
  );
}
