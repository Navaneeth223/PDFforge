import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="text-center max-w-md space-y-6">
        <div className="relative">
          <span className="text-[160px] font-black font-serif leading-none text-white/5 select-none block">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center">
              <Search className="w-10 h-10" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black font-serif tracking-tight text-white">
            Page Not Found
          </h1>
          <p className="text-zinc-400 text-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/25"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to PDFForge
        </Link>
      </div>
    </div>
  );
}
