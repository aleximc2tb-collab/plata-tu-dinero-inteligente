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
import { WalletIconView } from "@/components/WalletIconView";
import { Plus, Trash2, Wallet as WalletLucide } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HelpHint } from "@/components/HelpHint";

export const Route = createFileRoute("/billeteras")({
  head: () => ({ meta: [{ title: "Billeteras — MangoX" }, { name: "description", content: "Tus billeteras y tarjetas en un solo lugar." }] }),
  component: () => <RequireAuth><Billeteras /></RequireAuth>,
});

function Billeteras() {
  const { wallets, transactions, refresh } = useFinance();
  const alerts = useCardAlerts(wallets, transactions);
  const [open, setOpen] = useState(false);
  const [configWallet, setConfigWallet] = useState<Wallet | null>(null);
  const total = wallets.reduce((s, w) => s + (w.balance ?? 0), 0);

  const remove = async (id: string) => {
    if (!confirm("¿Querés eliminar esta billetera? También se borran sus movimientos.")) return;
    await supabase.from("wallets").delete().eq("id", id);
    refresh();
  };

  const nonCredit = wallets.filter((w) => w.type !== "credito");

  return (
    <AppShell title="Billeteras">
      <section className="animate-fade-up">
        <div className="rounded-3xl p-6 bg-card border border-border shadow-elegant">
          <p className="text-xs uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1.5">
            Patrimonio
            <HelpHint title="Patrimonio">
              <p>Suma de saldos en efectivo, bancos y billeteras virtuales.</p>
              <p>No incluye deudas de tarjeta de crédito.</p>
            </HelpHint>
          </p>
          <Money value={total} animate className="block mt-1 text-3xl font-bold" />
        </div>

        {wallets.length === 0 ? (
          <EmptyState
            icon={WalletLucide}
            title="Sumá tu primera billetera"
            description="Una billetera es un lugar donde guardás plata: efectivo, una cuenta bancaria o Mercado Pago."
            steps={[
              "Elegí el tipo (efectivo, banco, MP, Ualá…).",
              "Poné el saldo actual con el que arrancás.",
              "Listo: ya podés registrar movimientos.",
            ]}
            action={<button onClick={() => setOpen(true)} className="tap h-12 px-5 rounded-2xl bg-primary text-primary-foreground font-semibold">Crear billetera</button>}
            hint="Las tarjetas de crédito se cargan acá también, pero no suman a tu patrimonio." />
        ) : (
          <>
            {alerts.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold mb-3">Tarjetas de crédito</h3>
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
                <h3 className="text-sm font-semibold mb-3">Otras billeteras</h3>
                <div className="space-y-3">
                  {nonCredit.map((w) => {
                    const meta = walletMeta[w.type];
                    const negative = (w.balance ?? 0) < 0;
                    return (
                      <div key={w.id} className="rounded-2xl p-5 bg-card border border-border flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 grid place-items-center">
                          <WalletIconView type={w.type} className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{w.name}</p>
                          <p className="text-xs text-muted-foreground">{meta.label}</p>
                        </div>
                        <Money value={w.balance ?? 0} className={`text-base font-semibold ${negative ? "text-danger" : ""}`} />
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

        <button onClick={() => setOpen(true)} className="tap mt-6 w-full h-14 rounded-2xl border-2 border-dashed border-primary/50 text-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary/5">
          <Plus className="h-5 w-5" /> Sumar billetera
        </button>
      </section>

      <NewWalletSheet open={open} onClose={() => setOpen(false)} onCreated={refresh} />
      <CardConfigSheet open={!!configWallet} onClose={() => setConfigWallet(null)} wallet={configWallet} onSaved={refresh} />
    </AppShell>
  );
}
