import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Money } from "@/components/Money";
import { EmptyState } from "@/components/EmptyState";
import { RequireAuth } from "@/components/RequireAuth";
import { useFinance } from "@/hooks/useFinance";
import { NewTxSheet } from "@/components/NewTxSheet";
import { Plus, Search, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/actividad")({
  head: () => ({ meta: [{ title: "Actividad — Plata" }, { name: "description", content: "Tus ingresos y gastos al detalle." }] }),
  component: () => <RequireAuth><Actividad /></RequireAuth>,
});

function Actividad() {
  const { wallets, transactions, refresh } = useFinance();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = transactions.filter((t) =>
    !q || t.category.toLowerCase().includes(q.toLowerCase()) || t.notes?.toLowerCase().includes(q.toLowerCase())
  );

  const groups = filtered.reduce<Record<string, typeof filtered>>((acc, t) => {
    const d = formatDate(t.occurred_at);
    (acc[d] ||= []).push(t);
    return acc;
  }, {});

  const remove = async (id: string) => {
    await supabase.from("transactions").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    refresh();
  };

  return (
    <AppShell title="Actividad">
      <section className="animate-fade-up">
        <div className="glass rounded-2xl px-4 h-12 flex items-center gap-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar gasto, categoría…" className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground" />
        </div>

        {transactions.length === 0 ? (
          <EmptyState emoji="📝" title="Todo tranquilo por acá"
            description={wallets.length ? "Registrá tu primer movimiento para empezar." : "Primero creá una billetera."}
            action={
              wallets.length
                ? <button onClick={() => setOpen(true)} className="tap h-12 px-5 rounded-2xl bg-primary text-primary-foreground font-semibold">Registrar gasto</button>
                : <Link to="/billeteras" className="tap inline-flex h-12 px-5 rounded-2xl bg-primary text-primary-foreground font-semibold items-center">Crear billetera</Link>
            } />
        ) : (
          <div className="mt-5 space-y-6">
            {Object.entries(groups).map(([day, items]) => (
              <div key={day}>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{day}</p>
                <div className="space-y-2">
                  {items.map((t) => {
                    const wallet = wallets.find((w) => w.id === t.wallet_id);
                    return (
                      <div key={t.id} className="glass rounded-2xl p-4 flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-muted grid place-items-center text-xl">{t.category_emoji}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{t.category}</p>
                          <p className="text-xs text-muted-foreground truncate">{wallet?.name}{t.notes ? ` · ${t.notes}` : ""}</p>
                        </div>
                        <Money value={t.type === "gasto" ? -t.amount : t.amount} className={`text-sm font-semibold ${t.type === "ingreso" ? "text-primary" : ""}`} />
                        <button onClick={() => remove(t.id)} className="tap text-muted-foreground hover:text-danger">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <button onClick={() => setOpen(true)} disabled={!wallets.length} className="tap fixed bottom-28 right-5 h-14 w-14 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-glow z-30 disabled:opacity-50">
        <Plus className="h-6 w-6" />
      </button>

      <NewTxSheet open={open} onClose={() => setOpen(false)} wallets={wallets} onCreated={refresh} />
    </AppShell>
  );
}
