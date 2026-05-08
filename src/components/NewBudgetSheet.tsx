import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet } from "./Sheet";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { CategoryIcon } from "./CategoryIcon";
import { MoneyInput, moneyInputToNumber } from "./MoneyInput";

const PRESETS = [
  { emoji: "", name: "Comida" }, { emoji: "", name: "Supermercado" },
  { emoji: "", name: "Transporte" }, { emoji: "", name: "Salidas" },
  { emoji: "", name: "Suscripciones" }, { emoji: "", name: "Ahorro" },
  { emoji: "", name: "Servicios" }, { emoji: "", name: "Otros" },
];

export function NewBudgetSheet({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { user } = useAuth();
  const [preset, setPreset] = useState(PRESETS[0]);
  const [name, setName] = useState("");
  const [assigned, setAssigned] = useState("");
  const [period, setPeriod] = useState<"semanal" | "quincenal" | "mensual">("mensual");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = moneyInputToNumber(assigned) ?? 0;
    if (!user || !amt) return;
    setBusy(true);
    const { error } = await supabase.from("budget_categories").insert({
      user_id: user.id,
      name: name.trim() || preset.name,
      emoji: preset.emoji,
      assigned: amt,
      period,
    });
    setBusy(false);
    if (!error) {
      setAssigned(""); setName("");
      onCreated(); onClose();
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Asignar plata a una categoría">
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((p) => {
            const active = preset.name === p.name;
            return (
              <button type="button" key={p.name} onClick={() => { setPreset(p); setName(p.name); }}
                className={`tap rounded-xl p-2.5 flex flex-col items-center gap-1 ${active ? "bg-gold-soft ring-2 ring-primary" : "bg-muted"}`}>
                <CategoryIcon name={p.name} size={22} tone={active ? "primary" : "muted"} />
                <div className="text-[10px] text-muted-foreground">{p.name}</div>
              </button>
            );
          })}
        </div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={`Nombre (ej: ${preset.name})`}
          className="w-full h-12 rounded-xl bg-muted px-4 text-sm outline-none focus:ring-2 focus:ring-primary" />
        <MoneyInput autoFocus value={assigned} onChange={setAssigned} placeholder="¿Cuánto querés asignar?"
          className="w-full h-14 rounded-xl bg-muted px-4 text-lg font-bold text-center outline-none focus:ring-2 focus:ring-primary num" />
        <p className="text-[11px] text-muted-foreground text-center -mt-1">Asigná plata antes de gastar. Cada peso con su destino.</p>
        <div className="flex gap-2">
          {(["semanal", "quincenal", "mensual"] as const).map((p) => (
            <button type="button" key={p} onClick={() => setPeriod(p)}
              className={`tap flex-1 h-10 rounded-xl text-xs font-semibold capitalize ${period === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {p}
            </button>
          ))}
        </div>
        <button disabled={busy} className="tap w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Asignar plata
        </button>
      </form>
    </Sheet>
  );
}
