"use client";

import { motion } from "framer-motion";

interface ToolbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Toolbar({ title, subtitle, actions }: ToolbarProps) {
  return (
    <div className="sticky top-16 z-40 w-full bg-background/80 backdrop-blur-md border-b border-white/5 py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
