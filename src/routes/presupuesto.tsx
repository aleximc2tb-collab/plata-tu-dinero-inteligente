import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Money } from "@/components/Money";
import { EmptyState } from "@/components/EmptyState";
import { RequireAuth } from "@/components/RequireAuth";
import { useFinance } from "@/hooks/useFinance";
import { NewBudgetSheet } from "@/components/NewBudgetSheet";
import { MoveBudgetSheet } from "@/components/MoveBudgetSheet";
import { Trash2, ArrowLeftRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/presupuesto")({
  head: () => ({ meta: [{ title: "Presupuesto — Plata" }, { name: "description", content: "Asigná cada peso a una categoría antes de gastarlo." }] }),
  component: () => <RequireAuth><Presupuesto /></RequireAuth>,
});

function Presupuesto() {
  const { wallets, budgets, transactions, refresh } = useFinance();
  const [open, setOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [period, setPeriod] = useState<"semanal"|"quincenal"|"mensual">("mensual");

  // Disponible para asignar = patrimonio - total asignado
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

  return (
    <AppShell title="Presupuesto">
      <section className="animate-fade-up">
        <div className="glass-gold rounded-3xl p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Disponible para asignar</p>
          <Money value={disponible} animate className="block mt-2 text-4xl font-black text-primary" />
          <p className="mt-3 text-xs text-muted-foreground">Cada peso asignado es un peso con propósito 🏆</p>
          {monthIngresos > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">Ingresos del mes: <Money value={monthIngresos} className="text-primary" /></p>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          {(["semanal","quincenal","mensual"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`tap flex-1 h-10 rounded-xl text-xs font-semibold capitalize ${period === p ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}>
              {p}
            </button>
          ))}
        </div>

        {budgets.length === 0 ? (
          <EmptyState emoji="🎯" title="Asigná tu primera categoría"
            description="Antes de gastar, decidí cuánta plata querés destinar a cada cosa."
            action={<button onClick={() => setOpen(true)} className="tap h-12 px-5 rounded-2xl bg-primary text-primary-foreground font-semibold">Crear categoría</button>} />
        ) : (
          <div className="mt-5 space-y-3">
            {budgets.filter((b) => b.period === period).map((b) => {
              const spent = b.spent ?? 0;
              const pct = Math.min(100, (spent / b.assigned) * 100);
              const over = spent > b.assigned;
              const remaining = b.assigned - spent;
              const barColor = over ? "bg-danger" : pct > 80 ? "bg-warning" : "bg-primary";
              return (
                <div key={b.id} className="glass rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-muted grid place-items-center text-xl">{b.emoji}</div>
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
                  <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${over ? 100 : pct}%` }} />
                  </div>
                  {over && <p className="mt-2 text-xs text-danger">Te pasaste. Podés mover plata desde otra categoría.</p>}
                </div>
              );
            })}
          </div>
        )}

        <button onClick={() => setOpen(true)} className="tap mt-6 w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-glow">
          Asignar dinero
        </button>
      </section>

      <NewBudgetSheet open={open} onClose={() => setOpen(false)} onCreated={refresh} />
    </AppShell>
  );
}
