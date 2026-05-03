import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Money } from "@/components/Money";
import { budgets, totalAvailable } from "@/lib/mock";

export const Route = createFileRoute("/presupuesto")({
  head: () => ({ meta: [{ title: "Presupuesto — Plata" }, { name: "description", content: "Asigná cada peso a una categoría antes de gastarlo." }] }),
  component: Presupuesto,
});

function Presupuesto() {
  return (
    <AppShell title="Presupuesto">
      <section className="animate-fade-up">
        <div className="glass-gold rounded-3xl p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Disponible para asignar</p>
          <Money value={totalAvailable} animate className="block mt-2 text-4xl font-black text-primary" />
          <p className="mt-3 text-xs text-muted-foreground">Cada peso asignado es un peso con propósito 🏆</p>
        </div>

        <div className="mt-3 flex gap-2">
          {["Semanal", "Quincenal", "Mensual"].map((p, i) => (
            <button key={p} className={`tap flex-1 h-10 rounded-xl text-xs font-semibold ${i === 2 ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}>
              {p}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {budgets.map((b) => {
            const pct = Math.min(100, (b.spent / b.assigned) * 100);
            const over = b.spent > b.assigned;
            const remaining = b.assigned - b.spent;
            const barColor = over ? "bg-danger" : pct > 80 ? "bg-warning" : "bg-primary";
            return (
              <div key={b.id} className="glass rounded-2xl p-5 tap">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-muted grid place-items-center text-xl">{b.emoji}</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{b.name}</p>
                    <p className="text-xs text-muted-foreground">
                      <Money value={b.spent} /> de <Money value={b.assigned} />
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{over ? "Te pasaste" : "Te queda"}</p>
                    <Money value={Math.abs(remaining)} className={`text-sm font-bold ${over ? "text-danger" : ""}`} />
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${over ? 100 : pct}%` }} />
                </div>
                {over && (
                  <p className="mt-2 text-xs text-danger">
                    Te pasaste. Podés mover plata desde otra categoría.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <button className="tap mt-6 w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-glow">
          Asignar dinero
        </button>
      </section>
    </AppShell>
  );
}
