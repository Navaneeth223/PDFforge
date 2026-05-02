"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Settings2 } from "lucide-react";
import { useState } from "react";

interface SettingsPanelProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function SettingsPanel({ title, children, defaultOpen = true }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // On mobile, default to closed even if defaultOpen is true
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, []);

  return (
    <>
      {/* Mobile Trigger */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-500/25"
        >
          <Settings2 className="w-6 h-6" />
        </button>
      </div>

      {/* Backdrop for Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {mounted && (isOpen || (typeof window !== "undefined" && window.innerWidth >= 768)) && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`
              fixed md:sticky top-0 md:top-24 right-0 z-50 md:z-10
              w-[320px] h-full md:h-[calc(100vh-8rem)]
              bg-card/95 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none
              border-l border-white/10 md:border-none
              flex flex-col shadow-2xl md:shadow-none
            `}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5 md:hidden">
              <h3 className="font-bold text-lg text-white">{title}</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="hidden md:block mb-4">
              <h3 className="font-bold text-lg text-white px-2 border-b border-white/5 pb-2">{title}</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-2 space-y-6 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
