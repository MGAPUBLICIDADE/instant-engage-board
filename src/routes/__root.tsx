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
import { syncPendingEmpresaData } from "@/lib/sync-pending-empresa";

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
      { property: "og:title", content: "Conecta MGA" },
      { name: "twitter:title", content: "Conecta MGA" },
      { property: "og:description", content: "Mídia Inteligente para clínicas" },
      { name: "twitter:description", content: "Mídia Inteligente para clínicas" },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d4985d75-d298-4ce1-883e-faa4d3033122/id-preview-ad62d5c2--7f0fbbcb-4e69-4b9d-96f9-b96b04cbe33e.lovable.app-1777230422150.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d4985d75-d298-4ce1-883e-faa4d3033122/id-preview-ad62d5c2--7f0fbbcb-4e69-4b9d-96f9-b96b04cbe33e.lovable.app-1777230422150.png",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
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
    void syncPendingEmpresaData({
      id: user.id,
      email: user.email,
      metadata: user.user_metadata,
    }).catch(() => undefined);
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
  if (pathname.startsWith("/conectadelivery")) return <>{children}</>;

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
