"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // In production you'd log to Sentry or similar
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md space-y-6">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black font-serif tracking-tight">Something went wrong</h1>
            <p className="text-zinc-400 text-sm">
              An unexpected error occurred. This has been logged automatically.
            </p>
            {error?.digest && (
              <p className="text-xs text-zinc-600 font-mono">Error ID: {error.digest}</p>
            )}
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/25"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
