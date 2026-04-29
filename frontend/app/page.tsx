"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  FileText, Layers, Scissors, Minimize2, 
  Lock, ShieldAlert, PenTool, Image as ImageIcon,
  Zap, LockKeyhole, Github, ArrowRight
} from "lucide-react";

const tools = [
  { name: "Merge PDFs", desc: "Combine multiple PDFs into one", icon: Layers, href: "/tools/merge", color: "text-blue-500", bg: "bg-blue-500/10" },
  { name: "Split PDF", desc: "Extract pages or split into multiple files", icon: Scissors, href: "/tools/split", color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { name: "Compress", desc: "Reduce file size without losing quality", icon: Minimize2, href: "/tools/compress", color: "text-purple-500", bg: "bg-purple-500/10" },
  { name: "PDF to Word", desc: "Convert PDF to editable Word document", icon: FileText, href: "/tools/pdf-to-word", color: "text-sky-500", bg: "bg-sky-500/10" },
  { name: "Protect", desc: "Encrypt your PDF with AES-256", icon: Lock, href: "/tools/protect", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { name: "Redact", desc: "Permanently blackout sensitive info", icon: ShieldAlert, href: "/tools/redact", color: "text-red-500", bg: "bg-red-500/10" },
  { name: "Sign PDF", desc: "Add electronic signatures to your PDF", icon: PenTool, href: "/tools/sign", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { name: "Images to PDF", desc: "Convert JPG/PNG to PDF format", icon: ImageIcon, href: "/tools/images-to-pdf", color: "text-pink-500", bg: "bg-pink-500/10" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif text-xl font-bold tracking-tight">
            <span className="text-white">PDF</span>
            <span className="text-indigo-400">Forge</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </nav>

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
              Merge, split, compress, convert, edit, sign, and protect your PDFs.
              <br className="hidden md:block" />
              No registration, no watermarks, no limits. Open source.
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
      <section className="py-20 px-6 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "Lightning Fast", desc: "Process your files in seconds using optimized C/C++ backends." },
            { icon: LockKeyhole, title: "100% Secure", desc: "Files are automatically deleted immediately after processing." },
            { icon: Github, title: "Open Source", desc: "Fully self-hostable. Deploy it on your own infrastructure." }
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
              <p className="text-zinc-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black font-serif text-white tracking-tight">Our Toolkit</h2>
            <p className="text-zinc-400">Everything you need to work with PDFs in one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, i) => (
              <Link href={tool.href} key={i}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.2 }}
                  className="tool-card h-full"
                >
                  <div className={`tool-card-icon ${tool.bg} ${tool.color}`}>
                    <tool.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{tool.name}</h3>
                    <p className="text-sm text-zinc-400 line-clamp-2">{tool.desc}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-zinc-500 text-sm">
        <p>Built with Next.js, FastAPI, and PyMuPDF. Open Source under MIT License.</p>
      </footer>
    </div>
  );
}
