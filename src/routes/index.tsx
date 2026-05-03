import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({ component: Splash });

function Splash() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLeaving(true), 1200);
    const t2 = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) return navigate({ to: "/resumen" });
      const seen = localStorage.getItem("plata.onboarded");
      navigate({ to: seen ? "/auth" : "/onboarding" });
    }, 1700);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [navigate]);

  return (
    <div className={`min-h-screen grid place-items-center bg-background transition-opacity duration-500 ${leaving ? "opacity-0" : "opacity-100"}`}>
      <div className="flex flex-col items-center animate-gold-in">
        <div className="h-24 w-24 rounded-3xl grid place-items-center shadow-glow"
          style={{ background: "var(--gradient-gold)" }}>
          <span className="text-4xl font-black text-background">P</span>
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight">Plata</h1>
        <p className="mt-1 text-xs uppercase tracking-[0.4em] text-muted-foreground">Tu plata, con propósito</p>
      </div>
    </div>
  );
}
