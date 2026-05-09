"use client";

import { useState } from "react";
import { UniversalDropzone } from "@/components/dropzone/UniversalDropzone";
import { JobProgress } from "@/components/progress/JobProgress";
import { motion } from "framer-motion";
import { Images } from "lucide-react";
import { apiUpload } from "@/lib/api";
import { toast } from "sonner";

export default function ExtractImagesToolPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const handleStartExtract = async () => {
    if (!file) {
      toast.error("Please upload a PDF.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiUpload.post("/extract-images", formData);
      setJobId(res.data.job_id);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to start extraction job.");
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
            <Images className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-white tracking-tight">
            Extract Images
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Extract all embedded images from your PDF document as a ZIP file.
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
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-24 pb-12 px-4 items-center">
      <div className="glass p-8 rounded-2xl space-y-6 max-w-xl w-full">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="font-bold text-lg text-white">{file.name}</h3>
            <p className="text-sm text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button onClick={() => setFile(null)} className="text-sm text-pink-400 hover:text-pink-300">
            Change File
          </button>
        </div>

        <p className="text-sm text-zinc-400">
          This tool scans the PDF document for embedded image objects and saves them without recompressing or losing quality.
        </p>

        <div className="pt-4 flex justify-end">
          <button onClick={handleStartExtract} className="btn-primary w-full md:w-auto bg-pink-500 hover:bg-pink-600 shadow-pink-500/25">
            Extract Images
          </button>
        </div>
      </div>
    </div>
  );
}
