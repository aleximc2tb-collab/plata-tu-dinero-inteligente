import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Money } from "@/components/Money";
import { transactions, wallets } from "@/lib/mock";
import { Plus, Search } from "lucide-react";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/actividad")({
  head: () => ({ meta: [{ title: "Actividad — Plata" }, { name: "description", content: "Tus ingresos y gastos al detalle." }] }),
  component: Actividad,
});

function Actividad() {
  const groups = transactions.reduce<Record<string, typeof transactions>>((acc, t) => {
    const d = formatDate(t.date);
    (acc[d] ||= []).push(t);
    return acc;
  }, {});

  return (
    <AppShell title="Actividad">
      <section className="animate-fade-up">
        <div className="glass rounded-2xl px-4 h-12 flex items-center gap-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Buscar gasto, categoría…" className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground" />
        </div>

        <div className="mt-5 space-y-6">
          {Object.entries(groups).map(([day, items]) => (
            <div key={day}>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{day}</p>
              <div className="space-y-2">
                {items.map((t) => {
                  const wallet = wallets.find((w) => w.id === t.walletId);
                  return (
                    <div key={t.id} className="glass rounded-2xl p-4 flex items-center gap-3 tap">
                      <div className="h-11 w-11 rounded-xl bg-muted grid place-items-center text-xl">{t.categoryEmoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{t.category}</p>
                        <p className="text-xs text-muted-foreground truncate">{wallet?.name}{t.notes ? ` · ${t.notes}` : ""}</p>
                      </div>
                      <Money value={t.type === "gasto" ? -t.amount : t.amount} className={`text-sm font-semibold ${t.type === "ingreso" ? "text-primary" : ""}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <button className="tap fixed bottom-28 right-5 h-14 w-14 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-glow z-30">
        <Plus className="h-6 w-6" />
      </button>
    </AppShell>
  );
}
