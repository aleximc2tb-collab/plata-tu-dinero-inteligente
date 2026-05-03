import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Money } from "@/components/Money";
import { wallets, walletMeta } from "@/lib/mock";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/billeteras")({
  head: () => ({ meta: [{ title: "Billeteras — Plata" }, { name: "description", content: "Gestioná efectivo, bancos, Mercado Pago, Ualá y tarjetas." }] }),
  component: Billeteras,
});

function Billeteras() {
  const total = wallets.reduce((s, w) => s + w.balance, 0);
  return (
    <AppShell title="Billeteras">
      <section className="animate-fade-up">
        <div className="glass-gold rounded-3xl p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Patrimonio</p>
          <Money value={total} animate className="block mt-1 text-4xl font-black" />
        </div>

        <div className="mt-5 space-y-3">
          {wallets.map((w) => {
            const meta = walletMeta[w.type];
            const negative = w.balance < 0;
            return (
              <div key={w.id} className="glass rounded-2xl p-5 flex items-center gap-4 tap">
                <div className="h-12 w-12 rounded-2xl bg-muted grid place-items-center text-2xl">{meta.emoji}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{w.name}</p>
                  <p className="text-xs text-muted-foreground">{meta.label}</p>
                </div>
                <Money value={w.balance} className={`text-base font-bold ${negative ? "text-danger" : ""}`} />
              </div>
            );
          })}
        </div>

        <button className="tap mt-6 w-full h-14 rounded-2xl border-2 border-primary text-primary font-semibold flex items-center justify-center gap-2">
          <Plus className="h-5 w-5" /> Nueva billetera
        </button>
      </section>
    </AppShell>
  );
}
