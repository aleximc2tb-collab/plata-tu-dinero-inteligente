import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Money } from "@/components/Money";
import { EmptyState } from "@/components/EmptyState";
import { RequireAuth } from "@/components/RequireAuth";
import { useFinance, walletMeta, type Wallet } from "@/hooks/useFinance";
import { useCardAlerts } from "@/hooks/useCardAlerts";
import { NewWalletSheet } from "@/components/NewWalletSheet";
import { CardConfigSheet } from "@/components/CardConfigSheet";
import { CardAlertCard } from "@/components/CardAlertCard";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HelpHint } from "@/components/HelpHint";

export const Route = createFileRoute("/billeteras")({
  head: () => ({ meta: [{ title: "Billeteras — Plata" }, { name: "description", content: "Gestioná efectivo, bancos, Mercado Pago, Ualá y tarjetas." }] }),
  component: () => <RequireAuth><Billeteras /></RequireAuth>,
});

function Billeteras() {
  const { wallets, transactions, refresh } = useFinance();
  const alerts = useCardAlerts(wallets, transactions);
  const [open, setOpen] = useState(false);
  const [configWallet, setConfigWallet] = useState<Wallet | null>(null);
  const total = wallets.reduce((s, w) => s + (w.balance ?? 0), 0);

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar esta billetera y sus transacciones?")) return;
    await supabase.from("wallets").delete().eq("id", id);
    refresh();
  };

  const nonCredit = wallets.filter((w) => w.type !== "credito");

  return (
    <AppShell title="Billeteras">
      <section className="animate-fade-up">
        <div className="glass-gold rounded-3xl p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1.5">
            Patrimonio
            <HelpHint title="Patrimonio">
              <p>Suma de saldos en efectivo, bancos y billeteras virtuales.</p>
              <p>No incluye deudas de tarjeta de crédito.</p>
            </HelpHint>
          </p>
          <Money value={total} animate className="block mt-1 text-4xl font-black" />
        </div>

        {wallets.length === 0 ? (
          <EmptyState emoji="💳" title="Sin billeteras todavía"
            description="Agregá tu efectivo, banco, Mercado Pago o tarjeta para empezar."
            action={<button onClick={() => setOpen(true)} className="tap h-12 px-5 rounded-2xl bg-primary text-primary-foreground font-semibold">Crear billetera</button>} />
        ) : (
          <>
            {alerts.length > 0 && (
              <div className="mt-5">
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Tarjetas de crédito</h3>
                <div className="space-y-3">
                  {alerts.map((a) => (
                    <div key={a.wallet.id} className="relative group">
                      <CardAlertCard alert={a} onConfig={() => setConfigWallet(a.wallet)} />
                      <button onClick={() => remove(a.wallet.id)} className="tap absolute top-5 right-12 text-muted-foreground hover:text-danger">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {nonCredit.length > 0 && (
              <div className="mt-5">
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Otras billeteras</h3>
                <div className="space-y-3">
                  {nonCredit.map((w) => {
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
              </div>
            )}
          </>
        )}

        <button onClick={() => setOpen(true)} className="tap mt-6 w-full h-14 rounded-2xl border-2 border-primary text-primary font-semibold flex items-center justify-center gap-2">
          <Plus className="h-5 w-5" /> Nueva billetera
        </button>
      </section>

      <NewWalletSheet open={open} onClose={() => setOpen(false)} onCreated={refresh} />
      <CardConfigSheet open={!!configWallet} onClose={() => setConfigWallet(null)} wallet={configWallet} onSaved={refresh} />
    </AppShell>
  );
}
