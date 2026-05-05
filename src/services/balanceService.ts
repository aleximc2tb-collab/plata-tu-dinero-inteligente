/**
 * Balance Service — ÚNICA fuente de verdad para cálculos de saldo.
 * No hacer cálculos monetarios fuera de este módulo.
 */
import type { Wallet, Tx } from "@/hooks/useFinance";
import { parseAmount } from "@/utils/money";

/** Convierte cualquier valor de monto (string/number) a number seguro. */
function toNumber(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  return parseAmount(v) ?? 0;
}

/** Aplica una transacción a un saldo base. */
export function applyTransaction(base: number, tx: Pick<Tx, "type" | "amount">): number {
  const amt = toNumber(tx.amount);
  return tx.type === "ingreso" ? base + amt : base - amt;
}

/** Calcula el balance de UNA billetera dado el set de transacciones. */
export function calculateWalletBalance(wallet: Wallet, transactions: Tx[]): number {
  const initial = toNumber(wallet.initial_balance);
  return transactions
    .filter((t) => t.wallet_id === wallet.id)
    .reduce((acc, t) => applyTransaction(acc, t), initial);
}

/** Calcula el balance total sumando todas las billeteras. */
export function calculateTotalBalance(wallets: Wallet[], transactions: Tx[]): number {
  return wallets.reduce((sum, w) => sum + calculateWalletBalance(w, transactions), 0);
}

/** Normaliza un array de wallets agregándole su balance calculado. */
export function withBalances(wallets: Wallet[], transactions: Tx[]): Wallet[] {
  return wallets.map((w) => ({
    ...w,
    initial_balance: toNumber(w.initial_balance),
    balance: calculateWalletBalance(w, transactions),
  }));
}
