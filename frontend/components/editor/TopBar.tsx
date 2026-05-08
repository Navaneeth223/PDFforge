"use client";

import Link from "next/link";
import { 
  Download, Save, Share2, Undo2, Redo2, 
  ChevronDown, FileCode, Printer, HelpCircle
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import axios from "axios";
import { toast } from "sonner";

export default function TopBar() {
  const { canvas, pages } = useEditorStore();

  const handleExport = async () => {
    if (!canvas || pages.length === 0) return;
    
    toast.loading("Flattening canvas...");
    try {
      // In a real app, we'd loop through all pages and get their data
      // For MVP, we'll just export the current page as an example
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2 // High res
      });

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/editor/export-pdf`, {
        pages: [{ fullPageImage: dataURL }]
      });

      if (response.data.job_id) {
        toast.success("Job started!");
        // Redirect or start polling
      }
    } catch (error) {
      toast.error("Export failed");
    }
  };

  return (
    <div className="h-14 bg-zinc-950 border-b border-white/5 flex items-center justify-between px-6 z-30">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center font-black text-white text-xs">D</div>
          <span className="font-serif font-black text-white tracking-tighter">Docxio Editor</span>
        </Link>
        
        <div className="h-4 w-[1px] bg-white/10" />
        
        <div className="flex items-center gap-1">
          <button className="p-2 text-zinc-500 hover:text-white transition-colors" title="Undo (Ctrl+Z)"><Undo2 className="w-4 h-4" /></button>
          <button className="p-2 text-zinc-500 hover:text-white transition-colors" title="Redo (Ctrl+Y)"><Redo2 className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
          <Save className="w-4 h-4" /> Save
        </button>
        
        <div className="flex items-center">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-l-lg transition-all shadow-lg shadow-indigo-500/20"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
          <button className="bg-indigo-500/80 hover:bg-indigo-600 border-l border-white/10 text-white p-1.5 rounded-r-lg transition-all">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        
        <button className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
