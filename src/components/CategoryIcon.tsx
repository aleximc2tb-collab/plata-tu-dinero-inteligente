import {
  Utensils, ShoppingCart, Bus, Home, Heart, Gamepad2, Plane, Shirt,
  Coffee, Fuel, Lightbulb, Wifi, Smartphone, GraduationCap, Stethoscope,
  Gift, PawPrint, Wrench, Briefcase, TrendingUp, Wallet as WalletIcon,
  Banknote, CreditCard, Building2, Receipt, Tag, Repeat, Target,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  comida: Utensils, restaurante: Utensils, restaurant: Utensils,
  super: ShoppingCart, supermercado: ShoppingCart, mercado: ShoppingCart, compras: ShoppingCart,
  transporte: Bus, taxi: Bus, uber: Bus, colectivo: Bus,
  hogar: Home, alquiler: Home, expensas: Home,
  salud: Stethoscope, medico: Stethoscope, farmacia: Stethoscope,
  ocio: Gamepad2, entretenimiento: Gamepad2, juegos: Gamepad2,
  viajes: Plane, viaje: Plane,
  ropa: Shirt, indumentaria: Shirt,
  cafe: Coffee, café: Coffee,
  nafta: Fuel, combustible: Fuel,
  servicios: Lightbulb, luz: Lightbulb, gas: Lightbulb, agua: Lightbulb,
  internet: Wifi, wifi: Wifi,
  celular: Smartphone, telefono: Smartphone,
  educacion: GraduationCap, educación: GraduationCap, estudios: GraduationCap,
  regalos: Gift, regalo: Gift,
  mascotas: PawPrint, mascota: PawPrint,
  mantenimiento: Wrench,
  trabajo: Briefcase, sueldo: Briefcase, freelance: Briefcase,
  inversiones: TrendingUp, inversion: TrendingUp,
  efectivo: Banknote,
  banco: Building2,
  mercadopago: WalletIcon, uala: WalletIcon, naranja: CreditCard,
  credito: CreditCard, tarjeta: CreditCard,
  ticket: Receipt, factura: Receipt,
  recurrente: Repeat,
  meta: Target, ahorro: Target,
};

export function getCategoryIcon(name?: string | null): LucideIcon {
  if (!name) return Tag;
  const k = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  for (const key of Object.keys(map)) {
    if (k.includes(key)) return map[key];
  }
  return Tag;
}

interface IconProps {
  name?: string | null;
  className?: string;
  tone?: "primary" | "muted" | "accent";
  size?: number;
}

export function CategoryIcon({ name, className = "", tone = "primary", size = 20 }: IconProps) {
  const Icon = getCategoryIcon(name);
  const color = tone === "primary" ? "text-primary" : tone === "accent" ? "text-accent" : "text-foreground";
  return <Icon className={`${color} ${className}`} strokeWidth={1.8} style={{ width: size, height: size }} />;
}
