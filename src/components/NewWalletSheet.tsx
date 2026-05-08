import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet } from "./Sheet";
import { walletMeta, type WalletType } from "@/hooks/useFinance";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { WalletIconView } from "./WalletIconView";
import { MoneyInput, moneyInputToNumber } from "./MoneyInput";

const TYPES: WalletType[] = ["efectivo", "banco", "mercadopago", "uala", "naranja", "credito"];

export function NewWalletSheet({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [type, setType] = useState<WalletType>("efectivo");
  const [balance, setBalance] = useState("");
  const [busy, setBusy] = useState(false);

  const isEfectivo = type === "efectivo";
  const namePlaceholder = useMemo(() => {
    if (isEfectivo) return "Apodo (opcional, ej: Caja casa)";
    if (type === "banco") return "¿Qué banco? (ej: Galicia, Santander)";
    return `Nombre (ej: ${walletMeta[type].label})`;
  }, [type, isEfectivo]);

  const helperText = isEfectivo
    ? "El efectivo no necesita nombre. Si tenés varios fajos, podés ponerle un apodo."
    : "Poné el nombre de la institución para identificarlo fácil.";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const finalName = isEfectivo
      ? (name.trim() || "Efectivo")
      : name.trim();
    if (!finalName) return;

    setBusy(true);
    const { error } = await supabase.from("wallets").insert({
      user_id: user.id,
      name: finalName,
      type,
      initial_balance: moneyInputToNumber(balance) ?? 0,
    });
    setBusy(false);
    if (!error) {
      setName(""); setBalance(""); setType("efectivo");
      onCreated(); onClose();
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Sumar billetera">
      <form onSubmit={submit} className="space-y-3">
        <p className="text-xs text-muted-foreground px-1">
          Las billeteras representan <span className="text-foreground font-medium">dónde está tu plata</span>: efectivo, un banco o una billetera virtual.
        </p>

        <div className="grid grid-cols-3 gap-2">
          {TYPES.map((t) => {
            const active = type === t;
            return (
              <button type="button" key={t} onClick={() => setType(t)}
                className={`tap rounded-xl p-3 flex flex-col items-center gap-1.5 ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                <WalletIconView type={t} className={`h-5 w-5 ${active ? "!text-primary-foreground" : ""}`} />
                <div className="text-[11px] font-medium">{walletMeta[t].label}</div>
              </button>
            );
          })}
        </div>

        <div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={namePlaceholder}
            className="w-full h-12 rounded-xl bg-muted px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="mt-1.5 text-[11px] text-muted-foreground px-1">{helperText}</p>
        </div>

        <MoneyInput
          value={balance}
          onChange={setBalance}
          placeholder="¿Con cuánto arrancás? (opcional)"
          className="w-full h-12 rounded-xl bg-muted px-4 text-sm outline-none focus:ring-2 focus:ring-primary num"
        />

        <button disabled={busy} className="tap w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Listo, crear billetera
        </button>
      </form>
    </Sheet>
  );
}
