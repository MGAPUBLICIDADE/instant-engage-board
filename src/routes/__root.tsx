import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import appCss from "../styles.css?url";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const PUBLIC_ROUTES = ["/login"];

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Conecta MGA" },
      { name: "description", content: "Mídia Inteligente para clínicas" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  // Aplica dados pendentes da empresa após primeiro login pós-confirmação de email
  useEffect(() => {
    if (!user) return;
    try {
      const raw = localStorage.getItem("pending_empresa_data");
      if (!raw) return;
      const parsed = JSON.parse(raw) as { email: string; payload: Record<string, unknown> };
      if (parsed.email !== user.email) return;
      (async () => {
        const { data: empresa, error } = await supabase
          .from("empresa")
          .upsert({ user_id: user.id, ...parsed.payload }, { onConflict: "user_id" })
          .select()
          .single();
        if (error || !empresa) return;
        await supabase
          .from("configuracao_empresa")
          .upsert(
            { empresa_id: (empresa as { id: string }).id, preferencias: {} },
            { onConflict: "empresa_id" },
          );
        localStorage.removeItem("pending_empresa_data");
      })();
    } catch {}
  }, [user]);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated && !isPublic) {
      navigate({ to: "/login" });
    }
  }, [loading, isAuthenticated, isPublic, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isPublic) return <>{children}</>;
  if (!isAuthenticated) return null;

  return <AppShell>{children}</AppShell>;
}

function RootComponent() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        <Outlet />
      </AuthGate>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
