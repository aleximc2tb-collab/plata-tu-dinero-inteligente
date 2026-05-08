import { useState, useEffect } from "react";
import { Sheet } from "./Sheet";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import type { Goal } from "@/hooks/useGoals";
import { MoneyInput, moneyInputToNumber } from "./MoneyInput";

interface Props { open: boolean; onClose: () => void; goal: Goal | null; onSaved: () => void; }

export function ContributeGoalSheet({ open, onClose, goal, onSaved }: Props) {
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (open) setAmount(""); }, [open]);

  if (!goal) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = moneyInputToNumber(amount) ?? 0;
    if (!amt) return;
    setBusy(true);
    const newSaved = Math.max(0, goal.saved_amount + amt);
    const { error } = await supabase.from("savings_goals")
      .update({ saved_amount: newSaved }).eq("id", goal.id);
    setBusy(false);
    if (!error) { onSaved(); onClose(); }
  };

  const remaining = Math.max(0, goal.target_amount - goal.saved_amount);

  return (
    <Sheet open={open} onClose={onClose} title={goal.name}>
      <form onSubmit={submit} className="space-y-3">
        <p className="text-xs text-muted-foreground text-center">
          Te faltan <span className="text-primary font-semibold num">${remaining.toLocaleString("es-AR")}</span> para llegar.
        </p>
        <MoneyInput autoFocus value={amount} onChange={setAmount} placeholder="¿Cuánto sumás hoy?"
          className="w-full h-16 rounded-xl bg-muted px-4 text-2xl font-bold text-center outline-none focus:ring-2 focus:ring-primary num" />
        <p className="text-[11px] text-muted-foreground text-center">Si querés retirar, poné un número en negativo.</p>
        <button disabled={busy} className="tap w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sumar a la meta
        </button>
      </form>
    </Sheet>
  );
}
