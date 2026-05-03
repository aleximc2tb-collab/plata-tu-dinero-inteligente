import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type Frequency = "diaria" | "semanal" | "quincenal" | "mensual";

export interface Recurring {
  id: string;
  user_id: string;
  wallet_id: string;
  type: "ingreso" | "gasto";
  amount: number;
  category: string;
  category_emoji: string;
  notes: string | null;
  frequency: Frequency;
  next_run: string;
  end_date: string | null;
  installments_total: number | null;
  installments_paid: number;
  active: boolean;
}

function addInterval(dateISO: string, freq: Frequency): string {
  const d = new Date(dateISO + "T12:00:00");
  if (freq === "diaria") d.setDate(d.getDate() + 1);
  else if (freq === "semanal") d.setDate(d.getDate() + 7);
  else if (freq === "quincenal") d.setDate(d.getDate() + 15);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Process due recurrings: insert transactions, advance next_run, deactivate if finished. */
export async function processDueRecurring(userId: string): Promise<number> {
  const today = todayISO();
  const { data } = await supabase
    .from("recurring_transactions")
    .select("*")
    .eq("active", true)
    .lte("next_run", today);

  const list = (data ?? []) as Recurring[];
  let count = 0;

  for (const r of list) {
    let nextRun = r.next_run;
    let paid = r.installments_paid;
    let active = true;
    const inserts: any[] = [];

    // Catch up: generate one tx per missed cycle (cap 12 to be safe)
    let safety = 0;
    while (active && nextRun <= today && safety < 12) {
      inserts.push({
        user_id: userId,
        wallet_id: r.wallet_id,
        type: r.type,
        amount: r.amount,
        category: r.category,
        category_emoji: r.category_emoji,
        notes: r.notes,
        occurred_at: new Date(nextRun + "T12:00:00").toISOString(),
        recurring_id: r.id,
      });
      paid += 1;
      const advanced = addInterval(nextRun, r.frequency);
      if (r.installments_total && paid >= r.installments_total) active = false;
      else if (r.end_date && advanced > r.end_date) active = false;
      nextRun = advanced;
      safety += 1;
    }

    if (inserts.length) {
      await supabase.from("transactions").insert(inserts);
      await supabase
        .from("recurring_transactions")
        .update({ next_run: nextRun, installments_paid: paid, active })
        .eq("id", r.id);
      count += inserts.length;
    }
  }
  return count;
}

export function useRecurring() {
  const { user } = useAuth();
  const [items, setItems] = useState<Recurring[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("recurring_transactions")
      .select("*")
      .order("next_run");
    setItems(((data ?? []) as Recurring[]).map((r) => ({ ...r, amount: Number(r.amount) })));
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  return { items, loading, refresh };
}
