"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/editor/TopBar";
import Toolbar from "@/components/editor/Toolbar";
import EditorCanvas from "@/components/editor/EditorCanvas";
import PropertiesPanel from "@/components/editor/PropertiesPanel";
import { useEditorStore } from "@/store/editorStore";
import { Upload, FileText, Loader2 } from "lucide-react";
import axios from "axios";

export default function EditorPage() {
  const { setPages, pages } = useEditorStore();
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/editor/import-pdf`, formData);
      if (response.data.pages) {
        setPages(response.data.pages);
      }
    } catch (error) {
      console.error("Import failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null;

  if (pages.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <TopBar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-xl w-full text-center space-y-12">
            <div className="space-y-4">
              <h1 className="text-4xl font-black font-serif text-white tracking-tight">Open the Canvas.</h1>
              <p className="text-zinc-500 text-lg">Upload a PDF to start editing or start with a blank page.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col items-center justify-center p-12 bg-white/5 border-2 border-dashed border-white/10 rounded-3xl hover:bg-white/[0.08] hover:border-indigo-500/50 transition-all cursor-pointer group">
                <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform mb-6">
                  {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                </div>
                <h3 className="text-white font-bold mb-2">Import PDF</h3>
                <p className="text-zinc-500 text-sm">PDF, DOCX, Images</p>
              </label>

              <button 
                onClick={() => setPages([{ imageBase64: "", width: 800, height: 1100, pageNumber: 1 }])}
                className="flex flex-col items-center justify-center p-12 bg-white/5 border-2 border-dashed border-white/10 rounded-3xl hover:bg-white/[0.08] hover:border-emerald-500/50 transition-all group"
              >
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform mb-6">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-white font-bold mb-2">Blank Canvas</h3>
                <p className="text-zinc-500 text-sm">Start from scratch</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-900 overflow-hidden">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <Toolbar />
        <EditorCanvas />
        <PropertiesPanel />
      </div>
    </div>
  );
}
