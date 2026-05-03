import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/perfil")({ component: Perfil });

function Perfil() {
  return (
    <AppShell title="Perfil">
      <div className="animate-fade-up flex flex-col items-center text-center mt-6">
        <div className="h-24 w-24 rounded-full glass-gold grid place-items-center text-3xl font-black text-primary shadow-glow">P</div>
        <h2 className="mt-4 text-xl font-bold">Hola 👋</h2>
        <p className="text-sm text-muted-foreground">Pronto vas a poder iniciar sesión y sincronizar tu plata.</p>
      </div>
    </AppShell>
  );
}
