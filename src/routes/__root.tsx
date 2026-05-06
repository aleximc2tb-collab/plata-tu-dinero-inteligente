import { Outlet, createRootRoute, HeadContent, Scripts, Link } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary num">404</h1>
        <h2 className="mt-4 text-xl font-semibold">No encontramos esa página</h2>
        <p className="mt-2 text-sm text-muted-foreground">Probá volver al inicio.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground tap">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#FFF6EC" },
      { title: "MangoX — tus finanzas, sin vueltas" },
      { name: "description", content: "MangoX: ordená tu plata, controlá tus gastos y alcanzá tus metas. Simple y claro." },
      { property: "og:title", content: "MangoX — tus finanzas, sin vueltas" },
      { property: "og:description", content: "Controlá tus gastos, entendé tu plata y alcanzá tus metas con MangoX." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: () => <Outlet />,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <head><HeadContent /></head>
      <body>{children}<Toaster position="top-center" richColors /><Scripts /></body>
    </html>
  );
}
