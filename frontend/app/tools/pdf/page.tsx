"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ALL_TOOLS } from "@/lib/tools";

export default function CategoryPage() {
  const category = "PDF";
  
  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter(tool => tool.category === category);
  }, [category]);

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-4xl md:text-6xl font-black font-serif text-white tracking-tight">{category} Tools</h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-medium">
            Everything you need to work with {category} files.
          </p>
        </div>

        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredTools.map((tool) => (
              <motion.div
                layout
                key={tool.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Link href={tool.href} className="block h-full">
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="tool-card h-full flex flex-col p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] hover:border-white/20 transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 ${tool.bg} ${tool.color}`}>
                      <tool.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{tool.name}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">{tool.desc}</p>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
