"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  FileText, Layers, Scissors, Minimize2, 
  Lock, ShieldAlert, PenTool, Image as ImageIcon,
  Zap, LockKeyhole, Github, ArrowRight,
  RotateCw, Copy, Globe, Table, Presentation,
  Images, Type, Stamp, Hash, Unlock,
  ScanText, ImagePlus, FileSearch, Wrench,
  GitCompare, Crop, Briefcase, Search, X
} from "lucide-react";

import { ALL_TOOLS } from "@/lib/tools";

const CATEGORIES = ["All Tools", "PDF", "Word", "Excel", "PowerPoint", "Images", "Convert"];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Tools");

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           tool.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All Tools" || tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-background selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-6">
              <Zap className="w-3 h-3 fill-current" /> Every Document Tool
            </div>
            <h1 className="text-6xl md:text-8xl font-black font-serif tracking-tight text-white mb-6">
              Every tool.<br />
              <span className="text-gradient">Free forever.</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-medium">
              No registration. No limits. Open source.
              <br className="hidden md:block" />
              The ultimate toolkit for PDF, Word, Excel, PPT, and Images.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link href="/editor" className="btn-primary shadow-indigo-500/25 px-8 py-4 text-lg">
              Open Canvas Editor <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link href="#tools" className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all">
              Explore All Tools
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="py-8 bg-zinc-950/80 border-y border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-x-12 gap-y-4 text-zinc-500 text-xs font-bold uppercase tracking-widest">
          <span>30+ Free Tools</span>
          <span>All File Formats</span>
          <span>No Registration</span>
          <span>Open Source</span>
          <span>Canvas Editor</span>
        </div>
      </div>

      {/* Tools Section */}
      <section id="tools" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-6">
            <h2 className="text-3xl md:text-5xl font-black font-serif text-white tracking-tight">Document Toolkit</h2>
            
            {/* Search and Filters */}
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search 45+ document tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-xl"
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                      activeCategory === cat 
                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                        : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid */}
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
                        {tool.icon ? <tool.icon className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
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
      </section>
      
      {/* Footer */}
      <footer className="border-t border-white/5 py-16 bg-zinc-950/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2 font-serif text-xl font-bold tracking-tight">
              <span className="text-white">Docx</span>
              <span className="text-indigo-400">io</span>
            </div>
            <p className="text-zinc-500 text-sm max-w-xs text-center md:text-left">
              The universal open source document toolkit. 
              Free forever. Open source.
            </p>
          </div>
          <div className="flex gap-12">
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-widest text-center md:text-left">Platform</h4>
              <ul className="text-zinc-500 text-sm space-y-2 text-center md:text-left">
                <li><Link href="/#tools" className="hover:text-white transition-colors">All Tools</Link></li>
                <li><Link href="/editor" className="hover:text-white transition-colors font-bold text-indigo-400">Canvas Editor</Link></li>
                <li><a href="https://github.com/Navaneeth223/PDFforge" className="hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 text-center text-zinc-600 text-xs">
          <p>© {new Date().getFullYear()} Docxio. MIT Licensed.</p>
        </div>
      </footer>
    </div>
  );
}
