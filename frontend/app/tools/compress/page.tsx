"use client";

import { useState } from "react";
import { UniversalDropzone } from "@/components/dropzone/UniversalDropzone";
import { JobProgress } from "@/components/progress/JobProgress";
import { motion } from "framer-motion";
import { Minimize2 } from "lucide-react";
import { pdfApi } from "@/lib/api";
import { useToolSubmit } from "@/hooks/useToolSubmit";
import { toast } from "sonner";

export default function CompressToolPage() {
  const [files, setFiles] = useState<File[]>([]);
  const { state, progress, jobId, submit, reset } = useToolSubmit();
  const [level, setLevel] = useState<"low" | "medium" | "high">("medium");

  const handleStartCompress = async () => {
    if (files.length !== 1) {
      toast.error("Please upload exactly 1 PDF to compress.");
      return;
    }

    await submit(
      () => pdfApi.compress(files[0], level),
      `compressed_${files[0].name}`
    );
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
            <Minimize2 className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-white tracking-tight">
            Compress PDF
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Reduce file size while optimizing for maximal PDF quality.
          </p>
        </div>

        {state === 'idle' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {files.length === 0 ? (
              <UniversalDropzone
                onFilesAccepted={setFiles}
                maxFiles={1}
                title="Upload PDF to Compress"
                subtitle="Drag & drop your PDF, or click to browse"
              />
            ) : (
              <div className="glass p-8 rounded-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="font-bold text-lg text-white">{files[0].name}</h3>
                    <p className="text-sm text-zinc-400">{(files[0].size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button onClick={() => setFiles([])} className="text-sm text-indigo-400 hover:text-indigo-300">
                    Change File
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="label">Compression Level</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(["low", "medium", "high"] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setLevel(l)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          level === l
                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-300 ring-2 ring-indigo-500/20"
                            : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
                        }`}
                      >
                        <div className="font-bold mb-1 capitalize text-white">{l} Compression</div>
                        <div className="text-xs opacity-70">
                          {l === "low" ? "High quality, less compression" : l === "medium" ? "Good quality, good compression" : "Lower quality, high compression"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button onClick={handleStartCompress} className="btn-primary w-full md:w-auto">
                    Compress PDF
                  </button>
                </div>
              </div>
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
                reset();
                setFiles([]);
              }}
              customProgress={jobId ? undefined : progress}
              status={state === 'processing' ? 'Processing...' : 'Uploading...'}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
