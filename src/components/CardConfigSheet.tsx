import { useState, useEffect } from "react";
import { Sheet } from "./Sheet";
import { supabase } from "@/integrations/supabase/client";
import type { Wallet } from "@/hooks/useFinance";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  wallet: Wallet | null;
  onSaved: () => void;
}

export function CardConfigSheet({ open, onClose, wallet, onSaved }: Props) {
  const [closing, setClosing] = useState("");
  const [due, setDue] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!wallet) return;
    setClosing(wallet.closing_day ? String(wallet.closing_day) : "");
    setDue(wallet.due_day ? String(wallet.due_day) : "");
  }, [wallet]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;
    setBusy(true);
    const c = Number(closing);
    const d = Number(due);
    const { error } = await supabase
      .from("wallets")
      .update({
        closing_day: c >= 1 && c <= 31 ? c : null,
        due_day: d >= 1 && d <= 31 ? d : null,
      })
      .eq("id", wallet.id);
    setBusy(false);
    if (!error) { onSaved(); onClose(); }
  };

  if (!wallet) return null;
  return (
    <Sheet open={open} onClose={onClose} title={`Configurar ${wallet.name}`}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Configurá los días de cierre y vencimiento de tu resumen para recibir alertas.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Día de cierre</span>
            <input
              value={closing}
              onChange={(e) => setClosing(e.target.value.replace(/\D/g, "").slice(0, 2))}
              placeholder="Ej: 20"
              inputMode="numeric"
              className="w-full h-12 rounded-xl bg-muted px-4 text-sm outline-none focus:ring-2 focus:ring-primary num"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Día de vencimiento</span>
            <input
              value={due}
              onChange={(e) => setDue(e.target.value.replace(/\D/g, "").slice(0, 2))}
              placeholder="Ej: 10"
              inputMode="numeric"
              className="w-full h-12 rounded-xl bg-muted px-4 text-sm outline-none focus:ring-2 focus:ring-primary num"
            />
          </label>
        </div>
        <button disabled={busy} className="tap w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
        </button>
      </form>
    </Sheet>
  );
}
