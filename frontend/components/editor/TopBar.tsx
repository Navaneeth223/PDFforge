"use client";

import Link from "next/link";
import { 
  Download, Save, Share2, Undo2, Redo2, 
  ChevronDown, FileCode, Printer, HelpCircle,
  Menu
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import axios from "axios";
import { toast } from "sonner";
import { useState } from "react";

export default function TopBar() {
  const { canvas, pages, undo, redo, zoom, setZoom } = useEditorStore();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleExport = async () => {
    if (!canvas) return;
    
    toast.loading("Generating PDF...", { id: "export" });
    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([canvas.width || 800, canvas.height || 1100]);
      
      const imgData = canvas.toDataURL({ format: "png", quality: 1.0, multiplier: 2 });
      const imgBytes = await fetch(imgData).then(res => res.arrayBuffer());
      const image = await pdfDoc.embedPng(imgBytes);
      
      page.drawImage(image, { 
        x: 0, y: 0, 
        width: canvas.width || 800, 
        height: canvas.height || 1100 
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Docxio-Export.pdf";
      link.click();
      
      toast.success("PDF Exported Successfully!", { id: "export" });
    } catch (error) {
      console.error(error);
      toast.error("Export failed", { id: "export" });
    }
  };

  const handleAction = (action: string) => {
    setActiveMenu(null);
    if (!canvas) return;

    switch(action) {
      case 'new':
        canvas.clear();
        canvas.backgroundColor = "#ffffff";
        canvas.renderAll();
        toast.success("Started a new canvas");
        break;
      case 'save':
        const json = JSON.stringify(canvas.toJSON());
        const blob = new Blob([json], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Docxio-Project.json";
        link.click();
        toast.success("Project Saved!");
        break;
      case 'undo':
        undo();
        break;
      case 'redo':
        redo();
        break;
      case 'zoom_in':
        setZoom(zoom + 0.1);
        canvas.setZoom(zoom + 0.1);
        break;
      case 'zoom_out':
        setZoom(Math.max(0.1, zoom - 0.1));
        canvas.setZoom(Math.max(0.1, zoom - 0.1));
        break;
      case 'reset_zoom':
        setZoom(1);
        canvas.setZoom(1);
        break;
      case 'clear':
        canvas.clear();
        canvas.backgroundColor = "#ffffff";
        canvas.renderAll();
        break;
      case 'delete':
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length) {
          canvas.remove(...activeObjects);
          canvas.discardActiveObject();
        }
        break;
      case 'export':
        handleExport();
        break;
      default:
        toast.info(`${action} clicked`);
    }
  };

  return (
    <div className="h-14 bg-zinc-950 border-b border-white/5 flex items-center justify-between px-6 z-30">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center font-black text-white text-xs">D</div>
          <span className="font-serif font-black text-white tracking-tighter">Docxio Editor</span>
        </Link>
        
        <div className="h-4 w-[1px] bg-white/10 mx-2" />
        
        {/* Software Menus */}
        <div className="flex items-center gap-1 text-sm font-medium text-zinc-400">
          <div className="relative">
            <button onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')} className="px-3 py-1 hover:text-white hover:bg-white/5 rounded transition-colors">File</button>
            {activeMenu === 'file' && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-zinc-900 border border-white/10 rounded-lg shadow-xl py-1 z-50">
                <button onClick={() => handleAction('new')} className="w-full text-left px-4 py-2 hover:bg-indigo-500 hover:text-white transition-colors">New Canvas</button>
                <button onClick={() => handleAction('save')} className="w-full text-left px-4 py-2 hover:bg-indigo-500 hover:text-white transition-colors">Save Project</button>
                <div className="h-[1px] bg-white/10 my-1" />
                <button onClick={() => handleAction('export')} className="w-full text-left px-4 py-2 hover:bg-indigo-500 hover:text-white transition-colors">Export PDF</button>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')} className="px-3 py-1 hover:text-white hover:bg-white/5 rounded transition-colors">Edit</button>
            {activeMenu === 'edit' && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-zinc-900 border border-white/10 rounded-lg shadow-xl py-1 z-50">
                <button onClick={() => handleAction('undo')} className="w-full text-left px-4 py-2 hover:bg-indigo-500 hover:text-white transition-colors flex justify-between">Undo <span className="text-zinc-500 text-xs">Ctrl+Z</span></button>
                <button onClick={() => handleAction('redo')} className="w-full text-left px-4 py-2 hover:bg-indigo-500 hover:text-white transition-colors flex justify-between">Redo <span className="text-zinc-500 text-xs">Ctrl+Y</span></button>
                <div className="h-[1px] bg-white/10 my-1" />
                <button onClick={() => handleAction('delete')} className="w-full text-left px-4 py-2 hover:bg-indigo-500 hover:text-white transition-colors flex justify-between">Delete <span className="text-zinc-500 text-xs">Del</span></button>
                <button onClick={() => handleAction('clear')} className="w-full text-left px-4 py-2 hover:bg-red-500 hover:text-white transition-colors text-red-400">Clear Canvas</button>
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')} className="px-3 py-1 hover:text-white hover:bg-white/5 rounded transition-colors">View</button>
            {activeMenu === 'view' && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-zinc-900 border border-white/10 rounded-lg shadow-xl py-1 z-50">
                <button onClick={() => handleAction('zoom_in')} className="w-full text-left px-4 py-2 hover:bg-indigo-500 hover:text-white transition-colors">Zoom In</button>
                <button onClick={() => handleAction('zoom_out')} className="w-full text-left px-4 py-2 hover:bg-indigo-500 hover:text-white transition-colors">Zoom Out</button>
                <button onClick={() => handleAction('reset_zoom')} className="w-full text-left px-4 py-2 hover:bg-indigo-500 hover:text-white transition-colors">Actual Size</button>
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => setActiveMenu(activeMenu === 'build' ? null : 'build')} className="px-3 py-1 hover:text-white hover:bg-white/5 rounded transition-colors text-indigo-400">Build</button>
            {activeMenu === 'build' && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-zinc-900 border border-white/10 rounded-lg shadow-xl py-1 z-50">
                <button onClick={() => handleAction('export')} className="w-full text-left px-4 py-2 hover:bg-indigo-500 hover:text-white transition-colors font-bold">Build & Export</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {canvas && (
           <div className="text-xs text-zinc-500 mr-4 font-mono bg-white/5 px-2 py-1 rounded">
             {canvas.width}x{canvas.height}px
           </div>
        )}
        
        <div className="flex items-center gap-2 border-r border-white/10 pr-4 mr-2">
          <button onClick={() => handleAction('undo')} className="p-2 text-zinc-500 hover:text-white transition-colors" title="Undo (Ctrl+Z)"><Undo2 className="w-4 h-4" /></button>
          <button onClick={() => handleAction('redo')} className="p-2 text-zinc-500 hover:text-white transition-colors" title="Redo (Ctrl+Y)"><Redo2 className="w-4 h-4" /></button>
        </div>
        
        <button onClick={() => handleAction('save')} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
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
      </div>
    </div>
  );
}
