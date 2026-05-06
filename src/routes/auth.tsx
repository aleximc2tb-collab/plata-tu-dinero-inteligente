import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable";
import { Mail, Lock, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Ingresar — MangoX" }] }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/resumen" });
  }, [session, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name || email.split("@")[0] },
            emailRedirectTo: `${window.location.origin}/resumen`,
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes("Invalid login")) setError("Email o contraseña incorrectos");
      else if (msg.includes("already registered")) setError("Ese email ya está registrado, iniciá sesión");
      else setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/resumen" });
    if (r.error) setError("No pudimos iniciar con Google");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background px-6 py-10">
      <div className="flex flex-col items-center mb-8 animate-fade-up">
        <Logo size={72} />
        <h1 className="mt-3 text-2xl font-bold tracking-tight">
          Mango<span className="text-primary">X</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "login" ? "Bienvenido de vuelta" : "Creá tu cuenta"}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-3 animate-fade-up">
        {mode === "signup" && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="w-full h-14 rounded-2xl bg-card border border-border px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        )}
        <div className="relative">
          <Mail className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@ejemplo.com"
            className="w-full h-14 rounded-2xl bg-card border border-border pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="relative">
          <Lock className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full h-14 rounded-2xl bg-card border border-border pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {error && <p className="text-xs text-danger px-1">{error}</p>}

        <button disabled={busy} className="tap w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-glow disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "login" ? "Ingresar" : "Crear cuenta"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> o <div className="h-px flex-1 bg-border" />
      </div>

      <button onClick={google} className="tap w-full h-14 rounded-2xl border-2 border-primary text-primary font-semibold">
        Continuar con Google
      </button>

      <button
        onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
        className="mt-6 text-center text-sm text-muted-foreground tap"
      >
        {mode === "login" ? "¿No tenés cuenta? " : "¿Ya tenés cuenta? "}
        <span className="text-primary font-semibold">{mode === "login" ? "Registrate" : "Ingresá"}</span>
      </button>
    </div>
  );
}
