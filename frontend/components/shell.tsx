"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

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
