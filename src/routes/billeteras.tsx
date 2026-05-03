import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Money } from "@/components/Money";
import { EmptyState } from "@/components/EmptyState";
import { RequireAuth } from "@/components/RequireAuth";
import { useFinance, walletMeta } from "@/hooks/useFinance";
import { NewWalletSheet } from "@/components/NewWalletSheet";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/billeteras")({
  head: () => ({ meta: [{ title: "Billeteras — Plata" }, { name: "description", content: "Gestioná efectivo, bancos, Mercado Pago, Ualá y tarjetas." }] }),
  component: () => <RequireAuth><Billeteras /></RequireAuth>,
});

function Billeteras() {
  const { wallets, refresh } = useFinance();
  const [open, setOpen] = useState(false);
  const total = wallets.reduce((s, w) => s + (w.balance ?? 0), 0);

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar esta billetera y sus transacciones?")) return;
    await supabase.from("wallets").delete().eq("id", id);
    refresh();
  };

  return (
    <AppShell title="Billeteras">
      <section className="animate-fade-up">
        <div className="glass-gold rounded-3xl p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Patrimonio</p>
          <Money value={total} animate className="block mt-1 text-4xl font-black" />
        </div>

        {wallets.length === 0 ? (
          <EmptyState emoji="💳" title="Sin billeteras todavía"
            description="Agregá tu efectivo, banco, Mercado Pago o tarjeta para empezar."
            action={<button onClick={() => setOpen(true)} className="tap h-12 px-5 rounded-2xl bg-primary text-primary-foreground font-semibold">Crear billetera</button>} />
        ) : (
          <div className="mt-5 space-y-3">
            {wallets.map((w) => {
              const meta = walletMeta[w.type];
              const negative = (w.balance ?? 0) < 0;
              return (
                <div key={w.id} className="glass rounded-2xl p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-muted grid place-items-center text-2xl">{meta.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{w.name}</p>
                    <p className="text-xs text-muted-foreground">{meta.label}</p>
                  </div>
                  <Money value={w.balance ?? 0} className={`text-base font-bold ${negative ? "text-danger" : ""}`} />
                  <button onClick={() => remove(w.id)} className="tap text-muted-foreground hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <button onClick={() => setOpen(true)} className="tap mt-6 w-full h-14 rounded-2xl border-2 border-primary text-primary font-semibold flex items-center justify-center gap-2">
          <Plus className="h-5 w-5" /> Nueva billetera
        </button>
      </section>

      <NewWalletSheet open={open} onClose={() => setOpen(false)} onCreated={refresh} />
    </AppShell>
  );
}
