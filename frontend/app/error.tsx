"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="text-center max-w-md space-y-6">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black font-serif tracking-tight text-white">
            Something went wrong
          </h1>
          <p className="text-zinc-400 text-sm">
            This tool encountered an error. Please try again or go back to the homepage.
          </p>
          {error?.message && (
            <p className="text-xs text-red-400/70 font-mono bg-red-500/5 rounded-lg p-2 border border-red-500/10">
              {error.message}
            </p>
          )}
        </div>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-500/25"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
