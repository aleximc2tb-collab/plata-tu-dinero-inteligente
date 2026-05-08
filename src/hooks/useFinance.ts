import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { withBalances } from "@/services/balanceService";
import { parseAmount } from "@/utils/money";

export type WalletType = "efectivo" | "banco" | "mercadopago" | "uala" | "naranja" | "credito";

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  initial_balance: number;
  closing_day: number | null;
  due_day: number | null;
  balance?: number;
}

export interface Tx {
  id: string;
  wallet_id: string;
  type: "ingreso" | "gasto";
  amount: number;
  category: string;
  category_emoji: string;
  notes: string | null;
  occurred_at: string;
  source_name?: string | null;
  merchant?: string | null;
}

export type BudgetStatus = "pendiente" | "pagado";
export type PaymentMethod = "efectivo" | "banco" | "mercadopago" | "tarjeta";

export interface Budget {
  id: string;
  name: string;
  emoji: string;
  assigned: number;
  period: "semanal" | "quincenal" | "mensual";
  status: BudgetStatus;
  payment_method: PaymentMethod | null;
  paid_at: string | null;
  spent?: number;
}

export const walletMeta: Record<WalletType, { label: string; emoji: string }> = {
  efectivo: { label: "Efectivo", emoji: "💵" },
  banco: { label: "Banco", emoji: "🏦" },
  mercadopago: { label: "Mercado Pago", emoji: "💳" },
  uala: { label: "Ualá", emoji: "💳" },
  naranja: { label: "Naranja X", emoji: "💳" },
  credito: { label: "Tarjeta de crédito", emoji: "💳" },
};

export function useFinance() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [w, t, b] = await Promise.all([
      supabase.from("wallets").select("*").order("created_at"),
      supabase.from("transactions").select("*").is("deleted_at", null).order("occurred_at", { ascending: false }),
      supabase.from("budget_categories").select("*").order("created_at"),
    ]);
    // Normalizar todos los montos a number ANTES de cualquier cálculo
    const txs = ((t.data ?? []) as Tx[]).map((x) => ({
      ...x,
      amount: parseAmount(x.amount) ?? 0,
    }));
    const rawWallets = (w.data ?? []) as Wallet[];
    const ws = withBalances(rawWallets, txs);
    const bs = ((b.data ?? []) as Budget[]).map((bud) => {
      const spent = txs
        .filter((x) => x.type === "gasto" && x.category.toLowerCase() === bud.name.toLowerCase())
        .reduce((s, x) => s + x.amount, 0);
      return { ...bud, assigned: parseAmount(bud.assigned) ?? 0, spent };
    });
    setWallets(ws);
    setTransactions(txs);
    setBudgets(bs);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  return { wallets, transactions, budgets, loading, refresh };
}
