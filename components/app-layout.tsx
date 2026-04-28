"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, Database, Plus } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/30 group-hover:border-primary/60 transition-colors">
              <Terminal className="w-4 h-4 text-primary" />
            </div>
            <span className="font-mono font-bold text-lg tracking-tight">
              MockApi
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/mocks"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-mono transition-colors ${
                pathname.startsWith("/mocks")
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Database className="w-4 h-4" />
              My Mocks
            </Link>
            <Link
              href="/"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-mono transition-colors ${
                pathname === "/"
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Plus className="w-4 h-4" />
              New Mock
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        {children}
      </main>

      <footer className="border-t border-border py-5 mt-10">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs font-mono text-muted-foreground">
          MockApi — AI-Powered API Mocking
        </div>
      </footer>
    </div>
  );
}
