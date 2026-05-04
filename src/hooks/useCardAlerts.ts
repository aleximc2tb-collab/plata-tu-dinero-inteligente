import { useMemo } from "react";
import type { Wallet, Tx } from "./useFinance";

export interface CardAlert {
  wallet: Wallet;
  closingDay: number | null;
  dueDay: number | null;
  daysToClose: number | null;
  daysToDue: number | null;
  closeDate: Date | null;
  dueDate: Date | null;
  /** Total adeudado: gastos - pagos del ciclo en curso (basado en saldo). */
  pending: number;
  level: "ok" | "info" | "warn" | "urgent";
}

function nextOccurrence(day: number, from: Date = new Date()): Date {
  const y = from.getFullYear();
  const m = from.getMonth();
  // clamp para meses cortos
  const lastOfMonth = new Date(y, m + 1, 0).getDate();
  const dayThis = Math.min(day, lastOfMonth);
  const candidate = new Date(y, m, dayThis, 12, 0, 0);
  if (candidate >= new Date(from.getFullYear(), from.getMonth(), from.getDate())) return candidate;
  const lastNext = new Date(y, m + 2, 0).getDate();
  return new Date(y, m + 1, Math.min(day, lastNext), 12, 0, 0);
}

function daysBetween(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime();
  return Math.ceil(ms / 86400000);
}

export function useCardAlerts(wallets: Wallet[], _transactions: Tx[]): CardAlert[] {
  return useMemo(() => {
    const today = new Date();
    return wallets
      .filter((w) => w.type === "credito")
      .map<CardAlert>((w) => {
        const closingDay = w.closing_day ?? null;
        const dueDay = w.due_day ?? null;
        const closeDate = closingDay ? nextOccurrence(closingDay, today) : null;
        const dueDate = dueDay ? nextOccurrence(dueDay, today) : null;
        const daysToClose = closeDate ? daysBetween(closeDate, today) : null;
        const daysToDue = dueDate ? daysBetween(dueDate, today) : null;
        // En tarjetas, el saldo "negativo" representa lo gastado.
        const pending = Math.max(0, -(w.balance ?? 0));

        let level: CardAlert["level"] = "ok";
        if (daysToDue !== null && daysToDue <= 3) level = "urgent";
        else if (daysToClose !== null && daysToClose <= 3) level = "warn";
        else if ((daysToDue !== null && daysToDue <= 7) || (daysToClose !== null && daysToClose <= 7)) level = "info";

        return { wallet: w, closingDay, dueDay, daysToClose, daysToDue, closeDate, dueDate, pending, level };
      })
      .sort((a, b) => {
        const av = a.daysToDue ?? a.daysToClose ?? 999;
        const bv = b.daysToDue ?? b.daysToClose ?? 999;
        return av - bv;
      });
  }, [wallets, _transactions]);
}
