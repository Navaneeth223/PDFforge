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

const ALL_TOOLS = [
  // PDF
  { name: "Merge PDFs", desc: "Combine multiple PDFs into one", icon: Layers, href: "/tools/merge", color: "text-blue-500", bg: "bg-blue-500/10", category: "PDF" },
  { name: "Split PDF", desc: "Extract pages or split into multiple files", icon: Scissors, href: "/tools/split", color: "text-indigo-500", bg: "bg-indigo-500/10", category: "PDF" },
  { name: "Compress", desc: "Reduce file size without losing quality", icon: Minimize2, href: "/tools/compress", color: "text-purple-500", bg: "bg-purple-500/10", category: "PDF" },
  { name: "Sign PDF", desc: "Add electronic signatures", icon: PenTool, href: "/tools/sign", color: "text-yellow-500", bg: "bg-yellow-500/10", category: "PDF" },
  { name: "OCR PDF", desc: "Make scanned PDFs searchable", icon: ScanText, href: "/tools/ocr", color: "text-yellow-600", bg: "bg-yellow-600/10", category: "PDF" },

  // Word
  { name: "Word to PDF", desc: "Convert .docx to high-quality PDF", icon: FileText, href: "/tools/word/word-to-pdf", color: "text-blue-400", bg: "bg-blue-400/10", category: "Word" },
  { name: "Word to HTML", desc: "Convert Word documents to clean HTML", icon: Globe, href: "/tools/word/word-to-html", color: "text-orange-400", bg: "bg-orange-400/10", category: "Word" },
  { name: "Merge Word", desc: "Combine multiple .docx files", icon: Copy, href: "/tools/word/merge-word", color: "text-indigo-400", bg: "bg-indigo-400/10", category: "Word" },
  { name: "Word Compress", desc: "Reduce Word file size", icon: Minimize2, href: "/tools/word/compress-word", color: "text-purple-400", bg: "bg-purple-400/10", category: "Word" },

  // Excel
  { name: "Excel to PDF", desc: "Convert spreadsheets to PDF", icon: Table, href: "/tools/excel/excel-to-pdf", color: "text-green-500", bg: "bg-green-500/10", category: "Excel" },
  { name: "Excel to CSV", desc: "Convert .xlsx to CSV format", icon: FileText, href: "/tools/excel/excel-to-csv", color: "text-emerald-500", bg: "bg-emerald-500/10", category: "Excel" },
  { name: "Merge Excel", desc: "Combine multiple sheets into one", icon: Layers, href: "/tools/excel/merge-excel", color: "text-teal-500", bg: "bg-teal-500/10", category: "Excel" },

  // PowerPoint
  { name: "PPT to PDF", desc: "Convert presentations to PDF", icon: Presentation, href: "/tools/ppt/ppt-to-pdf", color: "text-red-500", bg: "bg-red-500/10", category: "PowerPoint" },
  { name: "PPT to Images", desc: "Convert slides to high-res PNGs", icon: Images, href: "/tools/ppt/ppt-to-images", color: "text-rose-500", bg: "bg-rose-500/10", category: "PowerPoint" },
  { name: "PPT to Video", desc: "Convert slideshow to MP4 video", icon: Zap, href: "/tools/ppt/ppt-to-video", color: "text-amber-500", bg: "bg-amber-500/10", category: "PowerPoint" },

  // Image
  { name: "Images to PDF", desc: "Convert JPG/PNG to PDF format", icon: ImageIcon, href: "/tools/image/images-to-pdf", color: "text-pink-500", bg: "bg-pink-500/10", category: "Images" },
  { name: "Remove BG", desc: "AI-powered background removal", icon: Scissors, href: "/tools/image/remove-bg", color: "text-violet-500", bg: "bg-violet-500/10", category: "Images" },
  { name: "Resize Image", desc: "Change image dimensions", icon: Crop, href: "/tools/image/resize-image", color: "text-sky-500", bg: "bg-sky-500/10", category: "Images" },

  // Convert
  { name: "Smart Converter", desc: "Convert anything to anything", icon: Zap, href: "/tools/convert", color: "text-yellow-400", bg: "bg-yellow-400/10", category: "Convert" },
];

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
                <li><a href="https://github.com/Navaneeth223/docxio" className="hover:text-white transition-colors">GitHub</a></li>
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
