import { useState } from "react";
import { Sheet } from "./Sheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Wallet } from "@/hooks/useFinance";
import type { Frequency } from "@/hooks/useRecurring";
import { Loader2 } from "lucide-react";
import { CategoryIcon } from "./CategoryIcon";

const CATEGORIES = [
  { name: "Sueldo", emoji: "" }, { name: "Alquiler", emoji: "" },
  { name: "Servicios", emoji: "" }, { name: "Streaming", emoji: "" },
  { name: "Tarjeta", emoji: "" }, { name: "Internet", emoji: "" },
  { name: "Cuota", emoji: "" }, { name: "Ahorro", emoji: "" },
];

interface Props { open: boolean; onClose: () => void; wallets: Wallet[]; onCreated: () => void; }

export function NewRecurringSheet({ open, onClose, wallets, onCreated }: Props) {
  const { user } = useAuth();
  const [type, setType] = useState<"gasto" | "ingreso">("gasto");
  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState("");
  const [cat, setCat] = useState(CATEGORIES[0]);
  const [freq, setFreq] = useState<Frequency>("mensual");
  const [installments, setInstallments] = useState("");
  const [notes, setNotes] = useState("");
  const [nextRun, setNextRun] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = walletId || wallets[0]?.id;
    const amt = Number(amount.replace(/\./g, "").replace(",", "."));
    if (!user || !w || !amt || !nextRun) return;
    setBusy(true);
    const total = installments ? Number(installments) : null;
    const { error } = await supabase.from("recurring_transactions").insert({
      user_id: user.id, wallet_id: w, type, amount: amt,
      category: cat.name, category_emoji: cat.emoji,
      notes: notes || null, frequency: freq, next_run: nextRun,
      installments_total: total,
    });
    setBusy(false);
    if (!error) {
      setAmount(""); setNotes(""); setInstallments("");
      onCreated(); onClose();
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Nuevo movimiento recurrente">
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {(["gasto", "ingreso"] as const).map((t) => (
            <button type="button" key={t} onClick={() => setType(t)}
              className={`tap h-11 rounded-xl text-sm font-semibold capitalize ${type === t ? (t === "gasto" ? "bg-danger text-white" : "bg-primary text-primary-foreground") : "bg-muted text-muted-foreground"}`}>
              {t}
            </button>
          ))}
        </div>

        <input autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="$0,00" inputMode="decimal"
          className="w-full h-16 rounded-xl bg-muted px-4 text-2xl font-bold text-center outline-none focus:ring-2 focus:ring-primary num" />

        <select value={walletId} onChange={(e) => setWalletId(e.target.value)}
          className="w-full h-12 rounded-xl bg-muted px-4 text-sm outline-none">
          {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>

        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((c) => {
            const active = cat.name === c.name;
            return (
              <button type="button" key={c.name} onClick={() => setCat(c)}
                className={`tap rounded-xl p-2.5 flex flex-col items-center gap-1 ${active ? "bg-gold-soft ring-2 ring-primary" : "bg-muted"}`}>
                <CategoryIcon name={c.name} size={22} tone={active ? "primary" : "muted"} />
                <div className="text-[10px] text-muted-foreground">{c.name}</div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {(["diaria", "semanal", "quincenal", "mensual"] as const).map((f) => (
            <button type="button" key={f} onClick={() => setFreq(f)}
              className={`tap h-10 rounded-xl text-xs font-semibold capitalize ${freq === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-muted-foreground col-span-2">Próximo cobro</label>
          <input type="date" value={nextRun} onChange={(e) => setNextRun(e.target.value)}
            className="h-12 rounded-xl bg-muted px-4 text-sm outline-none" />
          <input value={installments} onChange={(e) => setInstallments(e.target.value.replace(/\D/g, ""))}
            placeholder="Cuotas (opcional)" inputMode="numeric"
            className="h-12 rounded-xl bg-muted px-4 text-sm outline-none num" />
        </div>

        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas (opcional)"
          className="w-full h-12 rounded-xl bg-muted px-4 text-sm outline-none focus:ring-2 focus:ring-primary" />

        <button disabled={busy || !wallets.length} className="tap w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Activar piloto automático
        </button>
        {!wallets.length && <p className="text-xs text-center text-muted-foreground">Antes creá una billetera para asociarlo.</p>}
      </form>
    </Sheet>
  );
}
