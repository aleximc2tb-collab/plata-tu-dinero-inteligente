import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Money } from "@/components/Money";
import { EmptyState } from "@/components/EmptyState";
import { RequireAuth } from "@/components/RequireAuth";
import { NewGoalSheet } from "@/components/NewGoalSheet";
import { ContributeGoalSheet } from "@/components/ContributeGoalSheet";
import { useGoals, type Goal } from "@/hooks/useGoals";
import { Plus, Trash2, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/format";
import { HelpHint } from "@/components/HelpHint";

export const Route = createFileRoute("/metas")({
  head: () => ({ meta: [{ title: "Metas — Plata" }, { name: "description", content: "Tus metas de ahorro: progreso y aportes." }] }),
  component: () => <RequireAuth><Metas /></RequireAuth>,
});

function Metas() {
  const { goals, refresh } = useGoals();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Goal | null>(null);

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar esta meta?")) return;
    await supabase.from("savings_goals").delete().eq("id", id);
    refresh();
  };

  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.saved_amount, 0);

  return (
    <AppShell title="Metas">
      <section className="animate-fade-up">
        {goals.length > 0 && (
          <div className="glass-gold rounded-3xl p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1.5">
              Ahorrado total
              <HelpHint title="Ahorrado total">
                <p>Es la suma de los aportes que hiciste a tus metas.</p>
                <p>Sumá de a poco con el botón "Sumar +" en cada meta.</p>
              </HelpHint>
            </p>
            <Money value={totalSaved} animate className="block mt-1 text-4xl font-black" />
            <p className="text-xs text-muted-foreground mt-1">
              de <Money value={totalTarget} className="text-primary" /> en {goals.length} {goals.length === 1 ? "meta" : "metas"}
            </p>
          </div>
        )}

        {goals.length === 0 ? (
          <EmptyState emoji="🎯" title="Sin metas todavía"
            description="Definí un objetivo concreto: viaje, auto, fondo de emergencia. Después sumá de a poco."
            action={<button onClick={() => setOpen(true)} className="tap h-12 px-5 rounded-2xl bg-primary text-primary-foreground font-semibold">Crear meta</button>} />
        ) : (
          <div className="mt-5 space-y-3">
            {goals.map((g) => {
              const pct = g.target_amount > 0 ? Math.min(100, (g.saved_amount / g.target_amount) * 100) : 0;
              const done = g.saved_amount >= g.target_amount;
              return (
                <div key={g.id} className="glass rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-muted grid place-items-center text-2xl">{g.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate flex items-center gap-1.5">
                        {g.name}
                        {done && <Trophy className="h-3.5 w-3.5 text-primary" />}
                      </p>
                      {g.target_date && (
                        <p className="text-[11px] text-muted-foreground">Para {formatDate(g.target_date)}</p>
                      )}
                    </div>
                    <button onClick={() => remove(g.id)} className="tap text-muted-foreground hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${pct}%`,
                      background: done ? "var(--gradient-gold)" : "hsl(var(--primary))",
                    }} />
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      <Money value={g.saved_amount} className="font-semibold text-foreground" /> / <Money value={g.target_amount} />
                    </p>
                    <button onClick={() => setActive(g)} className="tap text-xs font-semibold text-primary">Sumar +</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button onClick={() => setOpen(true)} className="tap mt-6 w-full h-14 rounded-2xl border-2 border-primary text-primary font-semibold flex items-center justify-center gap-2">
          <Plus className="h-5 w-5" /> Nueva meta
        </button>
      </section>

      <NewGoalSheet open={open} onClose={() => setOpen(false)} onCreated={refresh} />
      <ContributeGoalSheet open={!!active} onClose={() => setActive(null)} goal={active} onSaved={refresh} />
    </AppShell>
  );
}
