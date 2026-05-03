import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Money } from "@/components/Money";
import { EmptyState } from "@/components/EmptyState";
import { RequireAuth } from "@/components/RequireAuth";
import { useFinance } from "@/hooks/useFinance";
import { processDueRecurring, useRecurring } from "@/hooks/useRecurring";
import { useAuth } from "@/hooks/useAuth";
import { NewRecurringSheet } from "@/components/NewRecurringSheet";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Pause, Play, Repeat } from "lucide-react";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/recurrentes")({
  head: () => ({ meta: [{ title: "Recurrentes — Plata" }, { name: "description", content: "Sueldo, alquiler, suscripciones y cuotas en piloto automático." }] }),
  component: () => <RequireAuth><Recurrentes /></RequireAuth>,
});

function Recurrentes() {
  const { user } = useAuth();
  const { wallets, refresh: refreshFin } = useFinance();
  const { items, refresh } = useRecurring();
  const [open, setOpen] = useState(false);
  const [processed, setProcessed] = useState<number | null>(null);

  // Auto-procesar al entrar
  useEffect(() => {
    if (!user) return;
    processDueRecurring(user.id).then((n) => {
      setProcessed(n);
      if (n > 0) { refresh(); refreshFin(); }
    });
  }, [user, refresh, refreshFin]);

  const remove = async (id: string) => {
    await supabase.from("recurring_transactions").delete().eq("id", id);
    refresh();
  };
  const toggle = async (id: string, active: boolean) => {
    await supabase.from("recurring_transactions").update({ active: !active }).eq("id", id);
    refresh();
  };

  return (
    <AppShell title="Recurrentes">
      <section className="animate-fade-up">
        <div className="glass-gold rounded-3xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/20 grid place-items-center">
            <Repeat className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Piloto automático</p>
            <p className="text-xs text-muted-foreground">
              {processed && processed > 0
                ? `Generamos ${processed} movimiento${processed === 1 ? "" : "s"} pendientes.`
                : "Tus pagos fijos y cuotas se registran solos."}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyState emoji="🔁" title="Sin recurrentes todavía"
            description="Cargá sueldo, alquiler, Netflix o cuotas de tarjeta y olvidate."
            action={<button onClick={() => setOpen(true)} disabled={!wallets.length} className="tap h-12 px-5 rounded-2xl bg-primary text-primary-foreground font-semibold disabled:opacity-50">Nueva recurrencia</button>} />
        ) : (
          <div className="mt-5 space-y-2">
            {items.map((r) => {
              const wallet = wallets.find((w) => w.id === r.wallet_id);
              const remaining = r.installments_total ? r.installments_total - r.installments_paid : null;
              return (
                <div key={r.id} className={`glass rounded-2xl p-4 flex items-center gap-3 ${!r.active ? "opacity-50" : ""}`}>
                  <div className="h-11 w-11 rounded-xl bg-muted grid place-items-center text-xl">{r.category_emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{r.category}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {wallet?.name} · {r.frequency}
                      {remaining !== null && ` · ${remaining}/${r.installments_total} cuotas`}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Próximo: {formatDate(r.next_run)}</p>
                  </div>
                  <Money value={r.type === "gasto" ? -r.amount : r.amount} className={`text-sm font-semibold ${r.type === "ingreso" ? "text-primary" : ""}`} />
                  <button onClick={() => toggle(r.id, r.active)} className="tap text-muted-foreground hover:text-primary ml-1">
                    {r.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button onClick={() => remove(r.id)} className="tap text-muted-foreground hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <button onClick={() => setOpen(true)} disabled={!wallets.length}
        className="tap fixed bottom-28 right-5 h-14 w-14 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-glow z-30 disabled:opacity-50">
        <Plus className="h-6 w-6" />
      </button>

      <NewRecurringSheet open={open} onClose={() => setOpen(false)} wallets={wallets} onCreated={refresh} />
    </AppShell>
  );
}
