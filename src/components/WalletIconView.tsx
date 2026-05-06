import { Banknote, Building2, Wallet as WalletIcon, CreditCard, type LucideIcon } from "lucide-react";
import type { WalletType } from "@/hooks/useFinance";

const map: Record<WalletType, LucideIcon> = {
  efectivo: Banknote,
  banco: Building2,
  mercadopago: WalletIcon,
  uala: WalletIcon,
  naranja: CreditCard,
  credito: CreditCard,
};

export function WalletIconView({ type, className = "" }: { type: WalletType; className?: string }) {
  const Icon = map[type] ?? WalletIcon;
  return <Icon className={`text-primary ${className}`} strokeWidth={1.8} />;
}
