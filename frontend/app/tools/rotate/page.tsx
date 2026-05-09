"use client";

import { useState } from "react";
import { UniversalDropzone } from "@/components/dropzone/UniversalDropzone";
import { JobProgress } from "@/components/progress/JobProgress";
import { SettingsPanel } from "@/components/layout/SettingsPanel";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { PDFPageThumbnails } from "@/components/pdf-viewer/PDFPageThumbnails";
import { motion } from "framer-motion";
import { RefreshCw, RotateCw, RotateCcw, AlertCircle, Loader2 } from "lucide-react";
import { pdfApi } from "@/lib/api";
import { useToolSubmit } from "@/hooks/useToolSubmit";
import { toast } from "sonner";

export default function RotateToolPage() {
  const [file, setFile] = useState<File | null>(null);
  const { state, progress, jobId, submit, reset } = useToolSubmit();
  
  const [rotation, setRotation] = useState<number>(90);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [mode, setMode] = useState<"all" | "selected">("all");

  const handleStartRotate = async () => {
    if (!file) return;

    const pages = (mode === "all" || selectedPages.length === 0) 
      ? "all" 
      : selectedPages.join(",");

    await submit(
      () => pdfApi.rotate(file, rotation, pages),
      `rotated_${file.name}`
    );
  };

  if (!file) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <RefreshCw className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-white tracking-tight">
            Rotate PDF
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Rotate your PDF pages 90, 180, or 270 degrees.
          </p>
          <UniversalDropzone
            onFilesAccepted={(files) => setFile(files[0])}
            maxFiles={1}
            title="Upload PDF to Rotate"
          />
        </div>
      </div>
    );
  }

  if (state !== 'idle') {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex flex-col items-center justify-center space-y-8">
        <JobProgress 
          jobId={jobId} 
          onReset={() => { reset(); setFile(null); }} 
          customProgress={jobId ? undefined : progress}
          status={state === 'processing' ? 'Processing...' : 'Uploading...'}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-16">
      <Toolbar 
        title={`Rotating: ${file.name}`}
        subtitle="Select pages and apply rotation"
        actions={
          <button onClick={() => setFile(null)} className="text-sm text-zinc-400 hover:text-white">
            Change File
          </button>
        }
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6">
        {/* Main Content (Thumbnails) */}
        <div className="flex-1 overflow-auto bg-white/5 rounded-2xl border border-white/10 p-6 min-h-[500px]">
          <PDFPageThumbnails 
            file={file}
            selectable={true}
            reorderable={false}
            onSelectionChange={setSelectedPages}
          />
        </div>

        {/* Sidebar Settings */}
        <SettingsPanel title="Rotation Settings">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="label">Pages to Rotate</label>
              <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                <button
                  onClick={() => setMode("all")}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === "all" ? "bg-white/10 text-white shadow-sm" : "text-zinc-400 hover:text-white"}`}
                >
                  All Pages
                </button>
                <button
                  onClick={() => setMode("selected")}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === "selected" ? "bg-white/10 text-white shadow-sm" : "text-zinc-400 hover:text-white"}`}
                >
                  Selected ({selectedPages.length})
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="label">Direction</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRotation(90)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-colors ${rotation === 90 ? "border-blue-500 bg-blue-500/10 text-blue-400" : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"}`}
                >
                  <RotateCw className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Right 90°</span>
                </button>
                <button
                  onClick={() => setRotation(-90)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-colors ${rotation === -90 ? "border-blue-500 bg-blue-500/10 text-blue-400" : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"}`}
                >
                  <RotateCcw className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Left 90°</span>
                </button>
                <button
                  onClick={() => setRotation(180)}
                  className={`col-span-2 flex items-center justify-center p-4 rounded-xl border transition-colors ${rotation === 180 ? "border-blue-500 bg-blue-500/10 text-blue-400" : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"}`}
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Upside Down (180°)</span>
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <button 
                onClick={handleStartRotate}
                disabled={mode === "selected" && selectedPages.length === 0}
                className="btn-primary w-full bg-blue-500 hover:bg-blue-600 shadow-blue-500/25 disabled:opacity-50"
              >
                Apply Rotation
              </button>
            </div>
          </div>
        </SettingsPanel>
      </div>
    </div>
  );
}
