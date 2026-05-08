import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet } from "./Sheet";
import { useAuth } from "@/hooks/useAuth";
import type { Wallet } from "@/hooks/useFinance";
import { parseAmount, isValidAmount } from "@/utils/money";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CategoryIcon } from "./CategoryIcon";
import { MoneyInput } from "./MoneyInput";

const CATEGORIES = [
  { name: "Comida", emoji: "" }, { name: "Supermercado", emoji: "" },
  { name: "Transporte", emoji: "" }, { name: "Salidas", emoji: "" },
  { name: "Servicios", emoji: "" }, { name: "Salud", emoji: "" },
  { name: "Hogar", emoji: "" }, { name: "Ropa", emoji: "" },
  { name: "Streaming", emoji: "" }, { name: "Sueldo", emoji: "" },
  { name: "Ahorro", emoji: "" }, { name: "Otros", emoji: "" },
];

const SOURCE_SUGGESTIONS = ["Sueldo", "Freelance", "Venta", "Reintegro", "Regalo", "Otro"];

export function NewTxSheet({ open, onClose, wallets, onCreated }: { open: boolean; onClose: () => void; wallets: Wallet[]; onCreated: () => void }) {
  const { user } = useAuth();
  const [type, setType] = useState<"gasto" | "ingreso">("gasto");
  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState("");
  const [cat, setCat] = useState(CATEGORIES[0]);
  const [notes, setNotes] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = walletId || wallets[0]?.id;
    const amt = parseAmount(amount);

    if (!user) { toast.error("Tu sesión expiró. Volvé a entrar."); return; }
    if (!w) { toast.error("Elegí desde qué billetera."); return; }
    if (!isValidAmount(amt)) { toast.error("Poné un monto válido."); return; }
    if (type === "ingreso" && !sourceName.trim()) {
      toast.error("Contanos de dónde viene esta plata.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      wallet_id: w,
      type,
      amount: amt,
      category: cat.name,
      category_emoji: cat.emoji,
      notes: notes || null,
      source_name: type === "ingreso" ? sourceName.trim() : null,
    });
    setBusy(false);
    if (error) {
      toast.error("No pudimos guardar esto. Probá nuevamente.", { description: error.message });
      return;
    }
    toast.success(type === "ingreso" ? "Listo, sumamos tu ingreso." : "Listo, anotamos tu gasto.");
    setAmount(""); setNotes(""); setSourceName("");
    onCreated(); onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Registrar movimiento">
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {(["gasto", "ingreso"] as const).map((t) => (
            <button type="button" key={t} onClick={() => setType(t)}
              className={`tap h-11 rounded-xl text-sm font-semibold capitalize ${type === t ? (t === "gasto" ? "bg-danger text-white" : "bg-primary text-primary-foreground") : "bg-muted text-muted-foreground"}`}>
              {t}
            </button>
          ))}
        </div>

        <MoneyInput autoFocus value={amount} onChange={setAmount} placeholder="$0"
          className="w-full h-16 rounded-xl bg-muted px-4 text-2xl font-bold text-center outline-none focus:ring-2 focus:ring-primary num" />

        <select value={walletId} onChange={(e) => setWalletId(e.target.value)}
          className="w-full h-12 rounded-xl bg-muted px-4 text-sm outline-none">
          {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>

        {type === "ingreso" && (
          <div className="space-y-2 animate-fade-up">
            <label className="block">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">¿De dónde viene?</span>
              <input
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="Sueldo, freelance, venta…"
                className="mt-1 w-full h-11 rounded-xl bg-muted px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SOURCE_SUGGESTIONS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSourceName(s)}
                  className={`tap text-xs px-2.5 h-7 rounded-full ${sourceName === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

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

        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Sumá una nota (opcional)"
          className="w-full h-12 rounded-xl bg-muted px-4 text-sm outline-none focus:ring-2 focus:ring-primary" />

        <button disabled={busy || !wallets.length} className="tap w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Guardar movimiento
        </button>
        {!wallets.length && <p className="text-xs text-center text-muted-foreground">Antes creá una billetera para anotar acá.</p>}
      </form>
    </Sheet>
  );
}
