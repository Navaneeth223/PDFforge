"use client";

import { useState } from "react";
import { UniversalDropzone } from "@/components/dropzone/UniversalDropzone";
import { JobProgress } from "@/components/progress/JobProgress";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import { apiUpload } from "@/lib/api";
import { toast } from "sonner";

export default function MergeToolPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);

  const handleStartMerge = async () => {
    if (files.length < 2) {
      toast.error("Please upload at least 2 PDFs to merge.");
      return;
    }

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const res = await apiUpload.post("/tools/merge", formData);
      setJobId(res.data.job_id);
    } catch (err) {
      toast.error("Failed to start merge job.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Layers className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-white tracking-tight">
            Merge PDFs
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Combine multiple PDF files into one in the order you want. Free, fast, and completely secure.
          </p>
        </div>

        {!jobId ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <UniversalDropzone
              onFilesAccepted={setFiles}
              title="Upload PDFs to Merge"
              subtitle="Drag & drop multiple PDFs, or click to browse"
              accept={{ "application/pdf": [".pdf"] }}
            />

            {files.length >= 2 && (
              <div className="flex justify-center mt-8">
                <button onClick={handleStartMerge} className="btn-primary w-full md:w-auto">
                  Merge PDFs
                </button>
              </div>
            )}
            {files.length === 1 && (
              <p className="text-center text-zinc-500 mt-4 text-sm">
                Add at least one more PDF to merge.
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <JobProgress
              jobId={jobId}
              onReset={() => {
                setJobId(null);
                setFiles([]);
              }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
