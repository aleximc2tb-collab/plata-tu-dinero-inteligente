import { useState } from "react";
import { Sheet } from "./Sheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Wallet } from "@/hooks/useFinance";
import { parseAmount, isValidAmount } from "@/utils/money";
import { Link2, Camera, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Comida", "Supermercado", "Transporte", "Salidas", "Servicios", "Salud", "Hogar", "Ropa", "Streaming", "Otros"];

type ParsedTicket = {
  amount: number;
  merchant: string;
  date: string;
  category: string;
};

type Step = "menu" | "link" | "scan" | "confirm";

interface Props {
  open: boolean;
  onClose: () => void;
  wallets: Wallet[];
  onCreated: () => void;
}

export function ScanTicketSheet({ open, onClose, wallets, onCreated }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("menu");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // confirm form
  const [parsed, setParsed] = useState<ParsedTicket | null>(null);
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("Otros");
  const [walletId, setWalletId] = useState("");
  const [date, setDate] = useState("");

  const reset = () => {
    setStep("menu"); setUrl(""); setError(null); setParsed(null);
    setAmount(""); setMerchant(""); setCategory("Otros"); setWalletId(""); setDate("");
  };

  const handleClose = () => { reset(); onClose(); };

  const processLink = async () => {
    if (!url.trim()) return;
    setBusy(true); setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("parse-ticket", {
        body: { url: url.trim() },
      });
      if (error) throw new Error(error.message ?? "Error al procesar");
      if (data?.error) throw new Error(data.error);
      const p = data as ParsedTicket;
      setParsed(p);
      setAmount(String(p.amount));
      setMerchant(p.merchant);
      setCategory(p.category);
      setDate(p.date);
      setWalletId(wallets[0]?.id ?? "");
      setStep("confirm");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos leer el ticket");
    } finally {
      setBusy(false);
    }
  };

  const saveTx = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseAmount(amount);
    if (!user) { toast.error("Tu sesión expiró. Volvé a entrar."); return; }
    if (!walletId) { toast.error("Elegí desde qué billetera."); return; }
    if (!isValidAmount(amt)) { toast.error("Poné un monto válido."); return; }
    if (!date) { toast.error("Falta la fecha del ticket."); return; }

    setBusy(true);
    const cleanMerchant = (merchant || "").trim() || null;
    const occurredAt = new Date(date + "T12:00:00").toISOString();

    // Dedup en cliente: mismo monto + fecha + comercio
    if (cleanMerchant) {
      const dayStart = new Date(date + "T00:00:00").toISOString();
      const dayEnd = new Date(date + "T23:59:59").toISOString();
      const { data: dupes } = await supabase
        .from("transactions")
        .select("id")
        .eq("user_id", user.id)
        .eq("amount", amt)
        .eq("merchant", cleanMerchant)
        .gte("occurred_at", dayStart)
        .lte("occurred_at", dayEnd)
        .is("deleted_at", null)
        .limit(1);
      if (dupes && dupes.length > 0) {
        setBusy(false);
        toast.error("Este ticket ya estaba cargado.", { description: "No lo sumamos de nuevo." });
        return;
      }
    }

    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      wallet_id: walletId,
      type: "gasto",
      amount: amt,
      category,
      category_emoji: "",
      notes: cleanMerchant,
      merchant: cleanMerchant,
      occurred_at: occurredAt,
    });
    setBusy(false);
    if (error) {
      if (error.code === "23505") {
        toast.error("Este ticket ya estaba cargado.", { description: "No lo sumamos de nuevo." });
      } else {
        toast.error("No pudimos guardar esto. Probá nuevamente.", { description: error.message });
        setError(error.message);
      }
      return;
    }
    toast.success("Listo, anotamos tu gasto.", { description: cleanMerchant ?? undefined });
    onCreated();
    handleClose();
  };

  return (
    <Sheet open={open} onClose={handleClose} title={titleFor(step)}>
      {step === "menu" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Cargá un gasto sin escribir nada.</p>
          <button
            onClick={() => setStep("link")}
            className="tap w-full flex items-center gap-3 p-4 rounded-2xl glass border border-primary/20 hover:border-primary/50 transition-colors"
          >
            <div className="h-11 w-11 rounded-xl bg-primary/15 grid place-items-center">
              <Link2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">Pegá el link de un ticket</p>
              <p className="text-xs text-muted-foreground">AFIP, comercios, compras online</p>
            </div>
          </button>

          <button
            onClick={() => setStep("scan")}
            className="tap w-full flex items-center gap-3 p-4 rounded-2xl glass border border-border/50"
          >
            <div className="h-11 w-11 rounded-xl bg-muted grid place-items-center">
              <Camera className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">Sacale una foto</p>
              <p className="text-xs text-muted-foreground">Disponible en breve</p>
            </div>
          </button>

          <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-gold-soft/50">
            <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              Detectamos monto, comercio y categoría por vos.
            </p>
          </div>
        </div>
      )}

      {step === "link" && (
        <div className="space-y-3">
          <button onClick={() => { setStep("menu"); setError(null); }} className="tap text-xs text-muted-foreground flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Volver
          </button>
          <input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://serviciosweb.afip.gob.ar/..."
            inputMode="url"
            className="w-full h-12 rounded-xl bg-muted px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <button
            disabled={busy || !url.trim()}
            onClick={processLink}
            className="tap w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Leyendo el ticket…</> : "Leer ticket"}
          </button>
          <p className="text-[11px] text-muted-foreground text-center">
            Pegá el link del ticket fiscal o de tu compra online.
          </p>
        </div>
      )}

      {step === "scan" && (
        <div className="space-y-4 text-center py-6">
          <button onClick={() => setStep("menu")} className="tap text-xs text-muted-foreground flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Volver
          </button>
          <div className="mx-auto h-24 w-24 rounded-3xl glass-gold grid place-items-center">
            <Camera className="h-10 w-10 text-primary" />
          </div>
          <p className="text-sm font-semibold">Pronto vas a poder sacarle una foto al ticket.</p>
          <p className="text-xs text-muted-foreground">
            Mientras tanto, pegá el link de tu compra.
          </p>
          <button onClick={() => setStep("link")} className="tap w-full h-11 rounded-xl bg-muted text-sm font-medium">
            Pegar link en su lugar
          </button>
        </div>
      )}

      {step === "confirm" && parsed && (
        <form onSubmit={saveTx} className="space-y-3">
          <div className="p-4 rounded-2xl glass-gold">
            <p className="text-xs text-muted-foreground">Encontramos un gasto</p>
            <p className="text-sm font-semibold mt-1">
              en <span className="text-primary">{parsed.merchant}</span>
            </p>
          </div>

          <label className="block">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Monto</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              className="mt-1 w-full h-14 rounded-xl bg-muted px-4 text-xl font-bold text-center outline-none focus:ring-2 focus:ring-primary num"
            />
          </label>

          <label className="block">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Comercio</span>
            <input
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="mt-1 w-full h-11 rounded-xl bg-muted px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Categoría</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full h-11 rounded-xl bg-muted px-3 text-sm outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Fecha</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full h-11 rounded-xl bg-muted px-3 text-sm outline-none"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Billetera</span>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="mt-1 w-full h-11 rounded-xl bg-muted px-3 text-sm outline-none"
            >
              {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </label>

          {error && <p className="text-xs text-danger">{error}</p>}

          <button
            disabled={busy || !walletId || !amount}
            className="tap w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Guardar gasto
          </button>
        </form>
      )}
    </Sheet>
  );
}

function titleFor(step: Step): string {
  switch (step) {
    case "menu": return "Cargar un gasto";
    case "link": return "Pegá el link";
    case "scan": return "Sacar foto del ticket";
    case "confirm": return "Revisá y guardá";
  }
}
