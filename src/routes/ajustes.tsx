import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Bell, Lock, Palette, HelpCircle, ChevronRight, Repeat, Target } from "lucide-react";

export const Route = createFileRoute("/ajustes")({ component: Ajustes });

const items = [
  { icon: Repeat, label: "Recurrentes y cuotas", hint: "Sueldo, alquiler, suscripciones, cuotas", to: "/recurrentes" as const },
  { icon: Target, label: "Metas de ahorro", hint: "Definí objetivos y mirá tu progreso", to: "/metas" as const },
  { icon: Bell, label: "Notificaciones", hint: "Alertas de presupuesto y vencimientos" },
  { icon: Lock, label: "Seguridad", hint: "PIN, biometría y bloqueo automático" },
  { icon: Palette, label: "Apariencia", hint: "Tema oscuro / claro" },
  { icon: HelpCircle, label: "Ayuda", hint: "Preguntas frecuentes" },
];

function Ajustes() {
  return (
    <AppShell title="Ajustes">
      <div className="space-y-2 animate-fade-up">
        {items.map((it) => {
          const inner = (
            <>
              <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center text-primary">
                <it.icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{it.label}</p>
                <p className="text-xs text-muted-foreground">{it.hint}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </>
          );
          return it.to ? (
            <Link key={it.label} to={it.to} className="tap w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-3 text-left">{inner}</Link>
          ) : (
            <button key={it.label} className="tap w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-3 text-left">{inner}</button>
          );
        })}
      </div>
      <p className="text-center text-xs text-muted-foreground mt-8">MangoX v0.1 · tus finanzas, sin vueltas</p>
    </AppShell>
  );
}
