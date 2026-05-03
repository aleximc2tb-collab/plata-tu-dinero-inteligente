import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet } from "./Sheet";
import { walletMeta, type WalletType } from "@/hooks/useFinance";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const TYPES: WalletType[] = ["efectivo", "banco", "mercadopago", "uala", "naranja", "credito"];

export function NewWalletSheet({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [type, setType] = useState<WalletType>("efectivo");
  const [balance, setBalance] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("wallets").insert({
      user_id: user.id,
      name: name.trim(),
      type,
      initial_balance: Number(balance.replace(/\./g, "").replace(",", ".")) || 0,
    });
    setBusy(false);
    if (!error) {
      setName(""); setBalance(""); setType("efectivo");
      onCreated(); onClose();
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Nueva billetera">
      <form onSubmit={submit} className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre (ej: Banco Galicia)"
          className="w-full h-12 rounded-xl bg-muted px-4 text-sm outline-none focus:ring-2 focus:ring-primary" />
        <div className="grid grid-cols-3 gap-2">
          {TYPES.map((t) => (
            <button type="button" key={t} onClick={() => setType(t)}
              className={`tap rounded-xl p-3 text-center text-xs ${type === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              <div className="text-xl">{walletMeta[t].emoji}</div>
              <div className="mt-1 font-medium">{walletMeta[t].label}</div>
            </button>
          ))}
        </div>
        <input value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="Saldo inicial (opcional)" inputMode="decimal"
          className="w-full h-12 rounded-xl bg-muted px-4 text-sm outline-none focus:ring-2 focus:ring-primary" />
        <button disabled={busy} className="tap w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Crear billetera
        </button>
      </form>
    </Sheet>
  );
}
