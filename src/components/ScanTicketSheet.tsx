import { useState } from "react";
import { Sheet } from "./Sheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Wallet } from "@/hooks/useFinance";
import { Link2, Camera, Loader2, ArrowLeft, Sparkles } from "lucide-react";

const CATEGORY_EMOJI: Record<string, string> = {
  Comida: "🍔", Supermercado: "🛒", Transporte: "🚗", Salidas: "🍻",
  Servicios: "🧾", Salud: "💊", Hogar: "🏠", Ropa: "👕",
  Streaming: "📺", Otros: "✨",
};

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
    const amt = Number(amount.replace(/\./g, "").replace(",", "."));
    if (!user || !walletId || !amt) return;
    setBusy(true);
    const emoji = CATEGORY_EMOJI[category] ?? "🧾";
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      wallet_id: walletId,
      type: "gasto",
      amount: amt,
      category,
      category_emoji: emoji,
      notes: merchant ? `🧾 ${merchant}` : null,
      occurred_at: new Date(date + "T12:00:00").toISOString(),
    });
    setBusy(false);
    if (!error) { onCreated(); handleClose(); }
    else setError(error.message);
  };

  return (
    <Sheet open={open} onClose={handleClose} title={titleFor(step)}>
      {step === "menu" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Cargá un gasto en segundos.</p>
          <button
            onClick={() => setStep("link")}
            className="tap w-full flex items-center gap-3 p-4 rounded-2xl glass border border-primary/20 hover:border-primary/50 transition-colors"
          >
            <div className="h-11 w-11 rounded-xl bg-primary/15 grid place-items-center">
              <Link2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">Pegar link de ticket</p>
              <p className="text-xs text-muted-foreground">AFIP, comercios, e-commerce</p>
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
              <p className="text-sm font-semibold">Escanear ticket</p>
              <p className="text-xs text-muted-foreground">Próximamente 📷</p>
            </div>
          </button>

          <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-gold-soft/50">
            <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              Detectamos monto, comercio y categoría automáticamente con IA.
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
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Procesando…</> : "Procesar"}
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
          <p className="text-sm font-semibold">Próximamente vas a poder escanear tickets directamente 📷</p>
          <p className="text-xs text-muted-foreground">
            Mientras tanto, usá la opción de pegar link.
          </p>
          <button onClick={() => setStep("link")} className="tap w-full h-11 rounded-xl bg-muted text-sm font-medium">
            Pegar link en su lugar
          </button>
        </div>
      )}

      {step === "confirm" && parsed && (
        <form onSubmit={saveTx} className="space-y-3">
          <div className="p-4 rounded-2xl glass-gold">
            <p className="text-xs text-muted-foreground">Detectamos un gasto</p>
            <p className="text-sm font-semibold mt-1">
              en <span className="text-primary">{parsed.merchant}</span> 🧾
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
                {Object.keys(CATEGORY_EMOJI).map((c) => (
                  <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>
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
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Agregar gasto
          </button>
        </form>
      )}
    </Sheet>
  );
}

function titleFor(step: Step): string {
  switch (step) {
    case "menu": return "Cargar gasto rápido";
    case "link": return "Pegar link de ticket";
    case "scan": return "Escanear ticket";
    case "confirm": return "Confirmar gasto";
  }
}
