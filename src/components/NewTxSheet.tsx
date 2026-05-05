import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet } from "./Sheet";
import { useAuth } from "@/hooks/useAuth";
import type { Wallet } from "@/hooks/useFinance";
import { parseAmount, isValidAmount } from "@/utils/money";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { name: "Comida", emoji: "🍔" }, { name: "Supermercado", emoji: "🛒" },
  { name: "Transporte", emoji: "🚗" }, { name: "Salidas", emoji: "🍻" },
  { name: "Servicios", emoji: "🧾" }, { name: "Salud", emoji: "💊" },
  { name: "Hogar", emoji: "🏠" }, { name: "Ropa", emoji: "👕" },
  { name: "Streaming", emoji: "📺" }, { name: "Sueldo", emoji: "💼" },
  { name: "Ahorro", emoji: "🏆" }, { name: "Otros", emoji: "✨" },
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

    if (!user) { toast.error("Sesión no válida"); return; }
    if (!w) { toast.error("Elegí una billetera"); return; }
    if (!isValidAmount(amt)) { toast.error("Ingresá un monto válido"); return; }
    if (type === "ingreso" && !sourceName.trim()) {
      toast.error("Indicá de dónde viene el ingreso");
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
      toast.error("No se pudo registrar", { description: error.message });
      return;
    }
    toast.success(type === "ingreso" ? "Ingreso registrado" : "Gasto agregado");
    setAmount(""); setNotes(""); setSourceName("");
    onCreated(); onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Nueva transacción">
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
          {CATEGORIES.map((c) => (
            <button type="button" key={c.name} onClick={() => setCat(c)}
              className={`tap rounded-xl p-2 text-center ${cat.name === c.name ? "bg-gold-soft ring-2 ring-primary" : "bg-muted"}`}>
              <div className="text-xl">{c.emoji}</div>
              <div className="text-[10px] mt-0.5 text-muted-foreground">{c.name}</div>
            </button>
          ))}
        </div>

        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas (opcional)"
          className="w-full h-12 rounded-xl bg-muted px-4 text-sm outline-none focus:ring-2 focus:ring-primary" />

        <button disabled={busy || !wallets.length} className="tap w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Registrar
        </button>
        {!wallets.length && <p className="text-xs text-center text-muted-foreground">Primero creá una billetera.</p>}
      </form>
    </Sheet>
  );
}
