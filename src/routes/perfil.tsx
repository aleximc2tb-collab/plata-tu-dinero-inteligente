import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/perfil")({ component: () => <RequireAuth><Perfil /></RequireAuth> });

function Perfil() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const initial = (user?.user_metadata?.display_name || user?.email || "P").charAt(0).toUpperCase();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <AppShell title="Perfil">
      <div className="animate-fade-up flex flex-col items-center text-center mt-6">
        <div className="h-24 w-24 rounded-full bg-primary/10 grid place-items-center text-3xl font-bold text-primary border border-primary/20">{initial}</div>
        <h2 className="mt-4 text-xl font-bold">{user?.user_metadata?.display_name || user?.email?.split("@")[0]}</h2>
        <p className="text-sm text-muted-foreground">{user?.email}</p>

        <button onClick={logout} className="tap mt-10 w-full h-14 rounded-2xl border-2 border-danger text-danger font-semibold flex items-center justify-center gap-2">
          <LogOut className="h-5 w-5" /> Cerrar sesión
        </button>
      </div>
    </AppShell>
  );
}
