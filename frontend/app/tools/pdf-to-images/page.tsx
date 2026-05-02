"use client";

import { useState } from "react";
import { UniversalDropzone } from "@/components/dropzone/UniversalDropzone";
import { JobProgress } from "@/components/progress/JobProgress";
import { SettingsPanel } from "@/components/layout/SettingsPanel";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { motion } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";
import { apiUpload } from "@/lib/api";
import { toast } from "sonner";

export default function PDFToImagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  
  const [dpi, setDpi] = useState<"72" | "150" | "300">("150");
  const [format, setFormat] = useState<"jpeg" | "png">("jpeg");

  const handleStartConvert = async () => {
    if (!file) {
      toast.error("Please upload a PDF.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("dpi", dpi);
      formData.append("format", format);

      const res = await apiUpload.post("/tools/pdf-to-images", formData);
      setJobId(res.data.job_id);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to start conversion.");
      console.error(err);
    }
  };

  if (!file) {
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
            PDF to Images
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Convert each page of your PDF into high-quality JPG or PNG images.
          </p>
          <UniversalDropzone
            onFilesAccepted={(files) => setFile(files[0])}
            maxFiles={1}
            title="Upload PDF"
          />
        </div>
      </div>
    );
  }

  if (jobId) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center">
        <JobProgress jobId={jobId} onReset={() => { setJobId(null); setFile(null); }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-16">
      <Toolbar 
        title={`Converting: ${file.name}`}
        actions={
          <button onClick={() => setFile(null)} className="text-sm text-zinc-400 hover:text-white">
            Change File
          </button>
        }
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6 items-start justify-center mt-12">
        <SettingsPanel title="Output Settings" defaultOpen={true}>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="label">Image Format</label>
              <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                <button
                  onClick={() => setFormat("jpeg")}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${format === "jpeg" ? "bg-white/10 text-white shadow-sm" : "text-zinc-400 hover:text-white"}`}
                >
                  JPEG
                </button>
                <button
                  onClick={() => setFormat("png")}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${format === "png" ? "bg-white/10 text-white shadow-sm" : "text-zinc-400 hover:text-white"}`}
                >
                  PNG
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="label">Quality (DPI)</label>
              <select
                value={dpi}
                onChange={(e) => setDpi(e.target.value as any)}
                className="input-field w-full"
              >
                <option value="72">Standard Quality (72 DPI)</option>
                <option value="150">High Quality (150 DPI)</option>
                <option value="300">Maximum Quality (300 DPI - Slower)</option>
              </select>
            </div>

            <div className="pt-6 border-t border-white/10">
              <button 
                onClick={handleStartConvert}
                className="btn-primary w-full bg-pink-500 hover:bg-pink-600 shadow-pink-500/25"
              >
                Convert to {format.toUpperCase()}
              </button>
            </div>
          </div>
        </SettingsPanel>
      </div>
    </div>
  );
}
