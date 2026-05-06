import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({ component: Splash });

function Splash() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLeaving(true), 1100);
    const t2 = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) return navigate({ to: "/resumen" });
      const seen = localStorage.getItem("plata.onboarded");
      navigate({ to: seen ? "/auth" : "/onboarding" });
    }, 1500);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [navigate]);

  return (
    <div className={`min-h-screen grid place-items-center bg-background transition-opacity duration-500 ${leaving ? "opacity-0" : "opacity-100"}`}>
      <div className="flex flex-col items-center animate-gold-in">
        <Logo size={120} />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Mango<span className="text-primary">X</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">tus finanzas, sin vueltas.</p>
      </div>
    </div>
  );
}
