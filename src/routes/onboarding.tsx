import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

const steps = [
  { emoji: "🏆", title: "Bienvenido a Plata", desc: "Un asistente financiero para que cada peso tenga un propósito." },
  { emoji: "💳", title: "Agregá tus billeteras", desc: "Efectivo, banco, Mercado Pago, Ualá, tarjetas. Todo en un solo lugar." },
  { emoji: "✍️", title: "Registrá tus gastos", desc: "Anotá rápido y entendé en qué se te va la plata, sin planillas." },
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
        <div className="h-32 w-32 rounded-[2rem] glass-gold grid place-items-center text-6xl shadow-glow mb-8">{s.emoji}</div>
        <h2 className="text-3xl font-black tracking-tight mb-3">{s.title}</h2>
        <p className="text-base text-muted-foreground max-w-xs">{s.desc}</p>
      </div>

      <button onClick={next} className="tap w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-glow">
        {last ? "Empezar" : "Siguiente"} <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}
