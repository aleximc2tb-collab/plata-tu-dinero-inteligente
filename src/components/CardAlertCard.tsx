import { Money } from "./Money";
import { walletMeta } from "@/hooks/useFinance";
import type { CardAlert } from "@/hooks/useCardAlerts";
import { AlertTriangle, CalendarClock, Settings2 } from "lucide-react";

const LEVEL_STYLES: Record<CardAlert["level"], string> = {
  ok: "border-border",
  info: "border-primary/40",
  warn: "border-amber-500/60",
  urgent: "border-danger/70",
};

const LEVEL_LABEL: Record<CardAlert["level"], string> = {
  ok: "Al día",
  info: "Próximo",
  warn: "Cerca del cierre",
  urgent: "Vence pronto",
};

export function CardAlertCard({ alert, onConfig }: { alert: CardAlert; onConfig: () => void }) {
  const meta = walletMeta[alert.wallet.type];
  const needsConfig = !alert.closingDay && !alert.dueDay;

  return (
    <div className={`glass rounded-2xl p-5 border ${LEVEL_STYLES[alert.level]} space-y-3`}>
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-muted grid place-items-center text-xl">{meta.emoji}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{alert.wallet.name}</p>
          <p className="text-[11px] text-muted-foreground">{LEVEL_LABEL[alert.level]}</p>
        </div>
        <button onClick={onConfig} className="tap text-muted-foreground hover:text-primary">
          <Settings2 className="h-4 w-4" />
        </button>
      </div>

      {needsConfig ? (
        <button onClick={onConfig} className="w-full text-xs text-primary text-left flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5" /> Configurá cierre y vencimiento para recibir alertas
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2 text-xs">
          {alert.closingDay && (
            <div className="rounded-xl bg-muted/60 p-3">
              <div className="flex items-center gap-1 text-muted-foreground">
                <CalendarClock className="h-3 w-3" /> Cierre día {alert.closingDay}
              </div>
              <p className={`mt-1 font-semibold ${alert.daysToClose !== null && alert.daysToClose <= 3 ? "text-amber-500" : ""}`}>
                {alert.daysToClose === 0 ? "Hoy" : `en ${alert.daysToClose} días`}
              </p>
            </div>
          )}
          {alert.dueDay && (
            <div className="rounded-xl bg-muted/60 p-3">
              <div className="flex items-center gap-1 text-muted-foreground">
                <AlertTriangle className="h-3 w-3" /> Vto día {alert.dueDay}
              </div>
              <p className={`mt-1 font-semibold ${alert.daysToDue !== null && alert.daysToDue <= 3 ? "text-danger" : ""}`}>
                {alert.daysToDue === 0 ? "Hoy" : `en ${alert.daysToDue} días`}
              </p>
            </div>
          )}
        </div>
      )}

      {alert.pending > 0 && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">A pagar</span>
          <Money value={alert.pending} className="text-base font-bold text-danger" />
        </div>
      )}
    </div>
  );
}
