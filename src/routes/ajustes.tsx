import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Bell, Lock, Palette, HelpCircle, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/ajustes")({ component: Ajustes });

const items = [
  { icon: Bell, label: "Notificaciones", hint: "Alertas de presupuesto y vencimientos" },
  { icon: Lock, label: "Seguridad", hint: "PIN, biometría y bloqueo automático" },
  { icon: Palette, label: "Apariencia", hint: "Tema oscuro / claro" },
  { icon: HelpCircle, label: "Ayuda", hint: "Preguntas frecuentes" },
];

function Ajustes() {
  return (
    <AppShell title="Ajustes">
      <div className="space-y-2 animate-fade-up">
        {items.map((it) => (
          <button key={it.label} className="tap w-full glass rounded-2xl p-4 flex items-center gap-3 text-left">
            <div className="h-10 w-10 rounded-xl glass-gold grid place-items-center text-primary">
              <it.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{it.label}</p>
              <p className="text-xs text-muted-foreground">{it.hint}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground mt-8">Plata v0.1 · Hecho con 💛 en Argentina</p>
    </AppShell>
  );
}
