import { useState } from "react";
import { Sheet } from "./Sheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Target } from "lucide-react";
import { CategoryIcon } from "./CategoryIcon";

interface Props { open: boolean; onClose: () => void; onCreated: () => void; }

export function NewGoalSheet({ open, onClose, onCreated }: Props) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(target.replace(/\./g, "").replace(",", "."));
    if (!user || !name || !amt) return;
    setBusy(true);
    const { error } = await supabase.from("savings_goals").insert({
      user_id: user.id, name, emoji: "", target_amount: amt,
      target_date: date || null, saved_amount: 0,
    });
    setBusy(false);
    if (!error) {
      setName(""); setTarget(""); setDate("");
      onCreated(); onClose();
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Nueva meta de ahorro">
      <form onSubmit={submit} className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 grid place-items-center">
            {name ? <CategoryIcon name={name} size={24} /> : <Target className="h-6 w-6 text-primary" strokeWidth={1.6} />}
          </div>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="¿Para qué estás ahorrando?"
            className="flex-1 h-11 rounded-xl bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="¿Cuánto querés juntar?" inputMode="decimal"
          className="w-full h-16 rounded-xl bg-muted px-4 text-2xl font-bold text-center outline-none focus:ring-2 focus:ring-primary num" />

        <div>
          <label className="text-xs text-muted-foreground">¿Para cuándo? (opcional)</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full h-12 rounded-xl bg-muted px-4 text-sm outline-none" />
        </div>

        <button disabled={busy} className="tap w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Crear meta
        </button>
      </form>
    </Sheet>
  );
}
