import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Wallet, PencilLine } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

const steps = [
  { Icon: Logo as unknown as typeof Wallet, isLogo: true, title: "Bienvenido a MangoX", desc: "Tus finanzas, sin vueltas. Controlá tu plata de forma simple." },
  { Icon: Wallet, isLogo: false, title: "Agregá tus billeteras", desc: "Efectivo, banco, Mercado Pago, tarjetas. Todo en un solo lugar." },
  { Icon: PencilLine, isLogo: false, title: "Registrá tus gastos", desc: "Anotá rápido y entendé en qué se te va la plata, sin planillas." },
];

function Onboarding() {
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const last = i === steps.length - 1;

  const next = () => {
    if (last) {
      localStorage.setItem("plata.onboarded", "1");
      navigate({ to: "/auth" });
    } else setI(i + 1);
  };

  const skip = () => { localStorage.setItem("plata.onboarded","1"); navigate({ to: "/auth" }); };
  const s = steps[i];

  return (
    <div className="min-h-screen flex flex-col bg-background px-6 py-10">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {steps.map((_, idx) => (
            <span key={idx} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-primary" : "w-4 bg-muted"}`} />
          ))}
        </div>
        {!last && <button onClick={skip} className="text-xs text-muted-foreground tap">Saltar</button>}
      </div>

      <div key={i} className="flex-1 flex flex-col items-center justify-center text-center animate-fade-up">
        <div className="h-32 w-32 rounded-3xl bg-card border border-border grid place-items-center mb-8 shadow-elegant">
          {s.isLogo ? <Logo size={96} /> : <s.Icon className="h-14 w-14 text-primary" strokeWidth={1.6} />}
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-3">{s.title}</h2>
        <p className="text-base text-muted-foreground max-w-xs">{s.desc}</p>
      </div>

      <button onClick={next} className="tap w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-glow">
        {last ? "Empezar" : "Siguiente"} <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}
