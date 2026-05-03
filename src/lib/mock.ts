export type WalletType = "efectivo" | "banco" | "mercadopago" | "uala" | "naranja" | "credito";

export const walletMeta: Record<WalletType, { label: string; emoji: string }> = {
  efectivo: { label: "Efectivo", emoji: "💵" },
  banco: { label: "Banco", emoji: "🏦" },
  mercadopago: { label: "Mercado Pago", emoji: "💳" },
  uala: { label: "Ualá", emoji: "💳" },
  naranja: { label: "Naranja X", emoji: "💳" },
  credito: { label: "Tarjeta de crédito", emoji: "💳" },
};

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
}

export interface Tx {
  id: string;
  type: "ingreso" | "gasto";
  amount: number;
  category: string;
  categoryEmoji: string;
  walletId: string;
  date: string; // ISO
  notes?: string;
}

export interface Budget {
  id: string;
  name: string;
  emoji: string;
  assigned: number;
  spent: number;
}

export const wallets: Wallet[] = [
  { id: "w1", name: "Efectivo", type: "efectivo", balance: 45200 },
  { id: "w2", name: "Galicia", type: "banco", balance: 312540.55 },
  { id: "w3", name: "Mercado Pago", type: "mercadopago", balance: 89320.1 },
  { id: "w4", name: "Visa Galicia", type: "credito", balance: -125400 },
];

export const transactions: Tx[] = [
  { id: "t1", type: "gasto", amount: 8500, category: "Comida", categoryEmoji: "🍔", walletId: "w3", date: new Date().toISOString(), notes: "Pedidos Ya" },
  { id: "t2", type: "gasto", amount: 24300, category: "Supermercado", categoryEmoji: "🛒", walletId: "w2", date: new Date(Date.now() - 86400000).toISOString() },
  { id: "t3", type: "ingreso", amount: 850000, category: "Sueldo", categoryEmoji: "💼", walletId: "w2", date: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: "t4", type: "gasto", amount: 15600, category: "Transporte", categoryEmoji: "🚗", walletId: "w1", date: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: "t5", type: "gasto", amount: 42000, category: "Salidas", categoryEmoji: "🍻", walletId: "w3", date: new Date(Date.now() - 5 * 86400000).toISOString(), notes: "Cumple Juan" },
  { id: "t6", type: "gasto", amount: 9990, category: "Streaming", categoryEmoji: "📺", walletId: "w4", date: new Date(Date.now() - 6 * 86400000).toISOString() },
];

export const budgets: Budget[] = [
  { id: "b1", name: "Comida", emoji: "🍔", assigned: 120000, spent: 84500 },
  { id: "b2", name: "Supermercado", emoji: "🛒", assigned: 200000, spent: 145300 },
  { id: "b3", name: "Transporte", emoji: "🚗", assigned: 60000, spent: 38200 },
  { id: "b4", name: "Salidas", emoji: "🍻", assigned: 80000, spent: 92000 },
  { id: "b5", name: "Suscripciones", emoji: "📺", assigned: 25000, spent: 19980 },
  { id: "b6", name: "Ahorro", emoji: "🏆", assigned: 150000, spent: 0 },
];

export const totalAvailable = 180000;
