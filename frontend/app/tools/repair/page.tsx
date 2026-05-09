"use client";

import { useState } from "react";
import { UniversalDropzone } from "@/components/dropzone/UniversalDropzone";
import { JobProgress } from "@/components/progress/JobProgress";
import { motion } from "framer-motion";
import { Wrench } from "lucide-react";
import { apiUpload } from "@/lib/api";
import { toast } from "sonner";

export default function RepairToolPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const handleStartRepair = async () => {
    if (!file) {
      toast.error("Please upload a PDF.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiUpload.post("/repair", formData);
      setJobId(res.data.job_id);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to start repair job.");
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
            className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Wrench className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-white tracking-tight">
            Repair PDF
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Fix corrupted or damaged PDF documents.
          </p>
          <UniversalDropzone
            onFilesAccepted={(files) => setFile(files[0])}
            maxFiles={1}
            title="Upload Corrupted PDF"
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
          <button onClick={() => setFile(null)} className="text-sm text-blue-400 hover:text-blue-300">
            Change File
          </button>
        </div>

        <p className="text-sm text-zinc-400">
          This tool attempts to reconstruct the PDF file structure and recover as much data as possible from a corrupted document.
        </p>

        <div className="pt-4 flex justify-end">
          <button onClick={handleStartRepair} className="btn-primary w-full md:w-auto bg-blue-500 hover:bg-blue-600 shadow-blue-500/25">
            Repair PDF
          </button>
        </div>
      </div>
    </div>
  );
}
