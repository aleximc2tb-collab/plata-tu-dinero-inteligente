import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Money } from "@/components/Money";
import { EmptyState } from "@/components/EmptyState";
import { RequireAuth } from "@/components/RequireAuth";
import { useFinance } from "@/hooks/useFinance";
import { NewBudgetSheet } from "@/components/NewBudgetSheet";
import { MoveBudgetSheet } from "@/components/MoveBudgetSheet";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Trash2, ArrowLeftRight, PieChart, Check, Clock, Wallet as WalletIcon, Landmark, CreditCard, Banknote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HelpHint } from "@/components/HelpHint";
import type { PaymentMethod } from "@/hooks/useFinance";

const METHOD_ICONS: Record<PaymentMethod, typeof WalletIcon> = {
  efectivo: Banknote,
  banco: Landmark,
  mercadopago: WalletIcon,
  tarjeta: CreditCard,
};
const METHOD_LABELS: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  banco: "Banco",
  mercadopago: "Mercado Pago",
  tarjeta: "Tarjeta",
};

export const Route = createFileRoute("/presupuesto")({
  head: () => ({ meta: [{ title: "Presupuesto — MangoX" }, { name: "description", content: "Asigná cada peso a una categoría antes de gastarlo." }] }),
  component: () => <RequireAuth><Presupuesto /></RequireAuth>,
});

function Presupuesto() {
  const { wallets, budgets, transactions, refresh } = useFinance();
  const [open, setOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [period, setPeriod] = useState<"semanal"|"quincenal"|"mensual">("mensual");

  const patrimonio = wallets.reduce((s, w) => s + (w.balance ?? 0), 0);
  const totalAsignado = budgets.reduce((s, b) => s + b.assigned, 0);
  const disponible = patrimonio - totalAsignado;

  const monthIngresos = transactions
    .filter((t) => t.type === "ingreso" && new Date(t.occurred_at).getMonth() === new Date().getMonth())
    .reduce((s, t) => s + t.amount, 0);

  const remove = async (id: string) => {
    await supabase.from("budget_categories").delete().eq("id", id);
    refresh();
  };

  const togglePaid = async (id: string, current: "pendiente" | "pagado") => {
    const next = current === "pagado" ? "pendiente" : "pagado";
    await supabase.from("budget_categories")
      .update({
        status: next,
        paid_at: next === "pagado" ? new Date().toISOString() : null,
      })
      .eq("id", id);
    refresh();
  };

  const setMethod = async (id: string, method: PaymentMethod) => {
    await supabase.from("budget_categories")
      .update({ payment_method: method, status: "pagado", paid_at: new Date().toISOString() })
      .eq("id", id);
    refresh();
  };

  return (
    <AppShell title="Presupuesto">
      <section className="animate-fade-up">
        <div className="rounded-3xl p-6 text-center bg-card border border-border shadow-elegant">
          <p className="text-xs uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1.5">
            Disponible para asignar
            <HelpHint title="Disponible para asignar" align="center">
              <p>Es tu patrimonio menos lo que ya pusiste en categorías.</p>
              <p>Cada peso asignado tiene un destino concreto antes de gastarlo.</p>
            </HelpHint>
          </p>
          <Money value={disponible} animate className="block mt-2 text-3xl font-bold text-primary" />
          {monthIngresos > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">Ingresos del mes: <Money value={monthIngresos} className="text-accent font-medium" /></p>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          {(["semanal","quincenal","mensual"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`tap flex-1 h-10 rounded-xl text-xs font-semibold capitalize ${period === p ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"}`}>
              {p}
            </button>
          ))}
        </div>

        {budgets.length === 0 ? (
          <EmptyState
            icon={PieChart}
            title="Dale un destino a cada peso"
            description="Un presupuesto es decidir hoy en qué vas a usar tu plata, antes de que se vaya sola."
            steps={[
              "Creá una categoría (ej: Comida, Transporte).",
              "Asignale un monto para el período.",
              "Cuando registres un gasto, descuenta solo.",
            ]}
            action={<button onClick={() => setOpen(true)} className="tap h-12 px-5 rounded-2xl bg-primary text-primary-foreground font-semibold">Crear categoría</button>}
            hint="No hace falta ser perfecto: empezá con 3 categorías y ajustá sobre la marcha." />
        ) : (
          <div className="mt-5 space-y-3">
            {budgets.filter((b) => b.period === period).map((b) => {
              const spent = b.spent ?? 0;
              const pct = Math.min(100, (spent / b.assigned) * 100);
              const over = spent > b.assigned;
              const remaining = b.assigned - spent;
              const barColor = over ? "bg-danger" : pct > 80 ? "bg-warning" : "bg-primary";
              return (
                <div key={b.id} className="rounded-2xl p-5 bg-card border border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-muted grid place-items-center">
                      <CategoryIcon name={b.name} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{b.name}</p>
                      <p className="text-xs text-muted-foreground">
                        <Money value={spent} /> de <Money value={b.assigned} />
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{over ? "Te pasaste" : "Te queda"}</p>
                      <Money value={Math.abs(remaining)} className={`text-sm font-bold ${over ? "text-danger" : ""}`} />
                    </div>
                    <button onClick={() => remove(b.id)} className="tap text-muted-foreground hover:text-danger ml-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${over ? 100 : pct}%` }} />
                  </div>
                  {over && <p className="mt-2 text-xs text-danger">Te pasaste. Podés mover plata desde otra categoría.</p>}

                  <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => togglePaid(b.id, b.status)}
                      className={`tap inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold ${
                        b.status === "pagado"
                          ? "bg-accent/15 text-accent"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {b.status === "pagado" ? <Check className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                      {b.status === "pagado" ? "Pagado" : "Pendiente"}
                    </button>

                    <div className="flex items-center gap-1">
                      {(["efectivo", "banco", "mercadopago", "tarjeta"] as PaymentMethod[]).map((m) => {
                        const Icon = METHOD_ICONS[m];
                        const active = b.payment_method === m;
                        return (
                          <button
                            key={m}
                            type="button"
                            title={METHOD_LABELS[m]}
                            onClick={() => setMethod(b.id, m)}
                            className={`tap h-8 w-8 rounded-full grid place-items-center ${
                              active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Icon className="h-4 w-4" strokeWidth={1.8} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {b.status === "pagado" && (
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Marcado como pagado{b.payment_method ? ` con ${METHOD_LABELS[b.payment_method]}` : ""}. Esto es solo informativo.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={() => setOpen(true)} className="tap h-14 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-glow">
            Asignar dinero
          </button>
          <button onClick={() => setMoveOpen(true)} disabled={budgets.length < 1}
            className="tap h-14 rounded-2xl border-2 border-primary text-primary font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            <ArrowLeftRight className="h-4 w-4" /> Mover plata
          </button>
        </div>
      </section>

      <NewBudgetSheet open={open} onClose={() => setOpen(false)} onCreated={refresh} />
      <MoveBudgetSheet open={moveOpen} onClose={() => setMoveOpen(false)} budgets={budgets} disponible={disponible} onDone={refresh} />
    </AppShell>
  );
}
