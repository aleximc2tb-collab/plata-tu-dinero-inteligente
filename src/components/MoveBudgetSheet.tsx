import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet } from "./Sheet";
import type { Budget } from "@/hooks/useFinance";
import { Money } from "./Money";
import { ArrowRight, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  budgets: Budget[];
  disponible: number;
  onDone: () => void;
}

const DISPONIBLE = "__disponible__";

export function MoveBudgetSheet({ open, onClose, budgets, disponible, onDone }: Props) {
  const [from, setFrom] = useState<string>(DISPONIBLE);
  const [to, setTo] = useState<string>(budgets[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const fromBudget = useMemo(() => budgets.find((b) => b.id === from), [from, budgets]);
  const toBudget = useMemo(() => budgets.find((b) => b.id === to), [to, budgets]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const amt = Number(amount.replace(/\./g, "").replace(",", "."));
    if (!amt || amt <= 0) return setErr("Ingresá un monto válido");
    if (from === to) return setErr("Elegí categorías distintas");
    if (!toBudget) return setErr("Elegí una categoría destino");

    if (from === DISPONIBLE) {
      if (amt > disponible) return setErr("No tenés tanto disponible");
    } else {
      if (!fromBudget || amt > fromBudget.assigned) return setErr("La categoría origen no tiene tanto asignado");
    }

    setBusy(true);
    const ops: Promise<unknown>[] = [];
    if (fromBudget) {
      ops.push(supabase.from("budget_categories").update({ assigned: fromBudget.assigned - amt }).eq("id", fromBudget.id));
    }
    ops.push(supabase.from("budget_categories").update({ assigned: toBudget.assigned + amt }).eq("id", toBudget.id));
    await Promise.all(ops);
    setBusy(false);
    setAmount("");
    onDone();
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Mover plata">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="h-12 rounded-xl bg-muted px-3 text-sm outline-none">
            <option value={DISPONIBLE}>💰 Disponible</option>
            {budgets.map((b) => <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>)}
          </select>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <select value={to} onChange={(e) => setTo(e.target.value)} className="h-12 rounded-xl bg-muted px-3 text-sm outline-none">
            {budgets.map((b) => <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>)}
          </select>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          {from === DISPONIBLE
            ? <>Disponible: <Money value={disponible} className="text-primary" /></>
            : fromBudget && <>Asignado: <Money value={fromBudget.assigned} className="text-primary" /></>}
        </div>

        <input autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Monto a mover" inputMode="decimal"
          className="w-full h-14 rounded-xl bg-muted px-4 text-lg font-bold text-center outline-none focus:ring-2 focus:ring-primary num" />

        {err && <p className="text-xs text-danger text-center">{err}</p>}

        <button disabled={busy} className="tap w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Mover
        </button>
      </form>
    </Sheet>
  );
}
