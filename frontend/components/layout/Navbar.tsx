"use client";

import Link from "next/link";
import { Github, FileText } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 shadow-lg shadow-indigo-500/20">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-white">
            PDF<span className="text-indigo-400">Forge</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/pdfforge"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Github className="h-4 w-4" />
            <span>Star on GitHub</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
