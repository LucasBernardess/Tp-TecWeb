"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { useAuth } from "@/lib/authContext";

const PUBLIC_ROUTES = ["/login"];

export function Shell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (!loading && !user && !isPublicRoute) {
      router.replace("/login");
    }
  }, [loading, user, isPublicRoute, router]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (loading || !user) {
    // Enquanto verifica a sessão (ou redireciona para /login), não renderiza nada.
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <main
        className="flex-1 min-h-screen transition-all duration-200"
        style={{ marginLeft: collapsed ? "4rem" : "15rem" }}
      >
        {children}
      </main>
    </div>
  );
}
