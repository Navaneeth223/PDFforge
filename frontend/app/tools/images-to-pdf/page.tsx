"use client";

import { useState } from "react";
import { UniversalDropzone } from "@/components/dropzone/UniversalDropzone";
import { JobProgress } from "@/components/progress/JobProgress";
import { SettingsPanel } from "@/components/layout/SettingsPanel";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function ImagesToPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  
  const [layout, setLayout] = useState<"fit" | "fill" | "original">("fit");
  const [pageSize, setPageSize] = useState<"A4" | "Letter" | "A3">("A4");

  const handleStartConvert = async () => {
    if (files.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }

    try {
      const formData = new FormData();
      files.forEach(file => formData.append("files", file));
      formData.append("layout", layout);
      formData.append("page_size", pageSize);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/tools/images-to-pdf`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setJobId(res.data.job_id);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to start conversion.");
      console.error(err);
    }
  };

  if (files.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-pink-500/10 text-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <ImageIcon className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-white tracking-tight">
            Images to PDF
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Convert JPG, PNG, and WebP images to a single PDF document.
          </p>
          <UniversalDropzone
            onFilesAccepted={setFiles}
            title="Upload Images"
            subtitle="Drag & drop your images here"
            accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }}
          />
        </div>
      </div>
    );
  }

  if (jobId) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center">
        <JobProgress jobId={jobId} onReset={() => { setJobId(null); setFiles([]); }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-16">
      <Toolbar 
        title={`${files.length} Images Selected`}
        actions={
          <button onClick={() => setFiles([])} className="text-sm text-zinc-400 hover:text-white">
            Clear All
          </button>
        }
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6">
        <div className="flex-1 overflow-auto bg-white/5 rounded-2xl border border-white/10 p-6 min-h-[500px]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {files.map((file, i) => (
              <div key={i} className="aspect-square bg-black/40 rounded-xl border border-white/10 overflow-hidden relative group">
                {/* We use an object URL for preview */}
                <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-xs font-medium px-2 py-1 bg-black/80 rounded-md truncate max-w-[90%]">
                    {file.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <SettingsPanel title="PDF Settings">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="label">Page Size</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as any)}
                className="input-field w-full"
              >
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="Letter">US Letter (8.5 × 11 in)</option>
                <option value="A3">A3 (297 × 420 mm)</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="label">Image Layout</label>
              <select
                value={layout}
                onChange={(e) => setLayout(e.target.value as any)}
                className="input-field w-full"
              >
                <option value="fit">Fit inside page (with margins)</option>
                <option value="fill">Fill entire page (no margins)</option>
              </select>
            </div>

            <div className="pt-6 border-t border-white/10">
              <button 
                onClick={handleStartConvert}
                className="btn-primary w-full bg-pink-500 hover:bg-pink-600 shadow-pink-500/25"
              >
                Convert to PDF
              </button>
            </div>
          </div>
        </SettingsPanel>
      </div>
    </div>
  );
}
