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
  // Organize
  { name: "Merge PDFs", desc: "Combine multiple PDFs into one", icon: Layers, href: "/tools/merge", color: "text-blue-500", bg: "bg-blue-500/10", category: "Organize" },
  { name: "Split PDF", desc: "Extract pages or split into multiple files", icon: Scissors, href: "/tools/split", color: "text-indigo-500", bg: "bg-indigo-500/10", category: "Organize" },
  { name: "Rotate PDF", desc: "Rotate pages 90, 180, or 270 degrees", icon: RotateCw, href: "/tools/rotate", color: "text-orange-500", bg: "bg-orange-500/10", category: "Organize" },
  { name: "Extract Pages", desc: "Save specific pages as a new PDF", icon: Copy, href: "/tools/extract-pages", color: "text-cyan-500", bg: "bg-cyan-500/10", category: "Organize" },
  { name: "Crop PDF", desc: "Trim white space or margins", icon: Crop, href: "/tools/crop", color: "text-amber-500", bg: "bg-amber-500/10", category: "Organize" },

  // Convert
  { name: "Images to PDF", desc: "Convert JPG/PNG to PDF format", icon: ImageIcon, href: "/tools/images-to-pdf", color: "text-pink-500", bg: "bg-pink-500/10", category: "Convert" },
  { name: "Office to PDF", desc: "Convert Word, Excel, PPT to PDF", icon: Briefcase, href: "/tools/office-to-pdf", color: "text-blue-600", bg: "bg-blue-600/10", category: "Convert" },
  { name: "HTML to PDF", desc: "Convert webpages or raw HTML to PDF", icon: Globe, href: "/tools/html-to-pdf", color: "text-blue-400", bg: "bg-blue-400/10", category: "Convert" },
  { name: "PDF to Word", desc: "Convert PDF to editable Word document", icon: FileText, href: "/tools/pdf-to-word", color: "text-sky-500", bg: "bg-sky-500/10", category: "Convert" },
  { name: "PDF to Excel", desc: "Extract tables to Excel spreadsheets", icon: Table, href: "/tools/pdf-to-excel", color: "text-green-500", bg: "bg-green-500/10", category: "Convert" },
  { name: "PDF to PPT", desc: "Convert PDF pages to PPT slides", icon: Presentation, href: "/tools/pdf-to-ppt", color: "text-red-400", bg: "bg-red-400/10", category: "Convert" },
  { name: "PDF to Images", desc: "Extract pages as high-quality images", icon: Images, href: "/tools/pdf-to-images", color: "text-rose-500", bg: "bg-rose-500/10", category: "Convert" },
  { name: "PDF to Text", desc: "Extract plain text content", icon: Type, href: "/tools/pdf-to-text", color: "text-zinc-400", bg: "bg-zinc-400/10", category: "Convert" },
  { name: "Extract Images", desc: "Save all embedded images from a PDF", icon: ImagePlus, href: "/tools/extract-images", color: "text-fuchsia-500", bg: "bg-fuchsia-500/10", category: "Convert" },

  // Edit & Security
  { name: "Compress", desc: "Reduce file size without losing quality", icon: Minimize2, href: "/tools/compress", color: "text-purple-500", bg: "bg-purple-500/10", category: "Edit & Security" },
  { name: "Protect", desc: "Encrypt your PDF with AES-256", icon: Lock, href: "/tools/protect", color: "text-emerald-500", bg: "bg-emerald-500/10", category: "Edit & Security" },
  { name: "Unlock", desc: "Remove password protection", icon: Unlock, href: "/tools/unlock", color: "text-teal-500", bg: "bg-teal-500/10", category: "Edit & Security" },
  { name: "Redact", desc: "Permanently blackout sensitive info", icon: ShieldAlert, href: "/tools/redact", color: "text-red-500", bg: "bg-red-500/10", category: "Edit & Security" },
  { name: "Sign PDF", desc: "Add electronic signatures", icon: PenTool, href: "/tools/sign", color: "text-yellow-500", bg: "bg-yellow-500/10", category: "Edit & Security" },
  { name: "Watermark", desc: "Add text or image stamps", icon: Stamp, href: "/tools/watermark", color: "text-violet-500", bg: "bg-violet-500/10", category: "Edit & Security" },
  { name: "Page Numbers", desc: "Add page numbering to your PDF", icon: Hash, href: "/tools/number-pages", color: "text-slate-400", bg: "bg-slate-400/10", category: "Edit & Security" },
  { name: "Metadata", desc: "View and edit document metadata", icon: FileSearch, href: "/tools/metadata", color: "text-lime-500", bg: "bg-lime-500/10", category: "Edit & Security" },

  // Advanced
  { name: "OCR PDF", desc: "Make scanned PDFs searchable", icon: ScanText, href: "/tools/ocr", color: "text-yellow-600", bg: "bg-yellow-600/10", category: "Advanced" },
  { name: "Repair PDF", desc: "Fix corrupted or broken PDF files", icon: Wrench, href: "/tools/repair", color: "text-orange-600", bg: "bg-orange-600/10", category: "Advanced" },
  { name: "Compare PDFs", desc: "Side-by-side visual difference", icon: GitCompare, href: "/tools/compare", color: "text-teal-600", bg: "bg-teal-600/10", category: "Advanced" },
];

const CATEGORIES = ["All", "Organize", "Convert", "Edit & Security", "Advanced"];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           tool.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || tool.category === activeCategory;
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
            <h1 className="text-5xl md:text-7xl font-black font-serif tracking-tight text-white mb-6">
              Every PDF Tool.<br />
              <span className="text-gradient">Free Forever.</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-medium">
              A complete, open-source toolkit for all your PDF needs.
              <br className="hidden md:block" />
              No registration, no limits, 100% private.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center gap-4 pt-4"
          >
            <Link href="#tools" className="btn-primary shadow-indigo-500/25">
              Explore Tools <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-6 bg-zinc-950/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "Lightning Fast", desc: "Optimized C++/Python backend for instant processing." },
            { icon: LockKeyhole, title: "100% Secure", desc: "Files are processed in memory and never stored permanently." },
            { icon: Github, title: "Open Source", desc: "Completely free and self-hostable on your own servers." }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 rounded-2xl flex flex-col items-center text-center space-y-4"
            >
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">{feature.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-6">
            <h2 className="text-3xl md:text-5xl font-black font-serif text-white tracking-tight">Our Toolkit</h2>
            
            {/* Search and Filters */}
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search 25+ PDF tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-lg"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full text-zinc-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      activeCategory === cat 
                        ? "bg-white text-black" 
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
                      className="tool-card h-full flex flex-col p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] hover:border-white/20 transition-all group"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${tool.bg} ${tool.color}`}>
                        <tool.icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-white mb-1">{tool.name}</h3>
                      <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{tool.desc}</p>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredTools.length === 0 && (
            <div className="text-center py-20">
              <p className="text-zinc-500 text-lg">No tools found matching "{searchQuery}"</p>
              <button 
                onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                className="mt-4 text-indigo-400 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-white/5 py-16 bg-zinc-950/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2 font-serif text-xl font-bold tracking-tight">
              <span className="text-white">PDF</span>
              <span className="text-indigo-400">Forge</span>
            </div>
            <p className="text-zinc-500 text-sm max-w-xs text-center md:text-left">
              The precision-engineered open source PDF toolkit. 
              Built for performance, privacy, and simplicity.
            </p>
          </div>
          <div className="flex gap-12">
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-widest">Platform</h4>
              <ul className="text-zinc-500 text-sm space-y-2">
                <li><Link href="/#tools" className="hover:text-white transition-colors">Tools</Link></li>
                <li><a href="https://github.com" className="hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-widest">Legal</h4>
              <ul className="text-zinc-500 text-sm space-y-2">
                <li><span className="cursor-not-allowed">Privacy</span></li>
                <li><span className="cursor-not-allowed">Terms</span></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 text-center text-zinc-600 text-xs">
          <p>© {new Date().getFullYear()} PDFForge. Built with Next.js, FastAPI, and PyMuPDF. MIT Licensed.</p>
        </div>
      </footer>
    </div>
  );
}
