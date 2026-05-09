"use client";

import { useState } from "react";
import { UniversalDropzone } from "@/components/dropzone/UniversalDropzone";
import { JobProgress } from "@/components/progress/JobProgress";
import { motion } from "framer-motion";
import { Scissors } from "lucide-react";
import { pdfApi } from "@/lib/api";
import { useToolSubmit } from "@/hooks/useToolSubmit";
import { toast } from "sonner";

export default function SplitToolPage() {
  const [files, setFiles] = useState<File[]>([]);
  const { state, progress, jobId, submit, reset } = useToolSubmit();

  const [mode, setMode] = useState<"ranges" | "every_n" | "pages">("ranges");
  const [ranges, setRanges] = useState("");
  const [everyN, setEveryN] = useState("1");
  const [pages, setPages] = useState("");

  const handleStartSplit = async () => {
    if (files.length !== 1) {
      toast.error("Please upload exactly 1 PDF to split.");
      return;
    }

    await submit(
      () => pdfApi.split(files[0], mode, mode === "ranges" ? ranges : mode === "every_n" ? everyN : pages),
      `split_${files[0].name}`
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
            <Scissors className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-white tracking-tight">
            Split PDF
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Extract pages from your PDF or split it into multiple smaller documents.
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
                title="Upload PDF to Split"
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
                  <label className="label">Split Mode</label>
                  <div className="grid grid-cols-3 gap-4">
                    {(["ranges", "every_n", "pages"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                          mode === m
                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                            : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
                        }`}
                      >
                        {m === "ranges" ? "Custom Ranges" : m === "every_n" ? "Fixed Size" : "Extract Pages"}
                      </button>
                    ))}
                  </div>
                </div>

                {mode === "ranges" && (
                  <div className="space-y-2">
                    <label className="label">Ranges (e.g. 1-3,5,7-9)</label>
                    <input
                      type="text"
                      value={ranges}
                      onChange={(e) => setRanges(e.target.value)}
                      placeholder="1-3,5,7-9"
                      className="input-field"
                    />
                  </div>
                )}
                {mode === "every_n" && (
                  <div className="space-y-2">
                    <label className="label">Split every N pages</label>
                    <input
                      type="number"
                      min="1"
                      value={everyN}
                      onChange={(e) => setEveryN(e.target.value)}
                      className="input-field"
                    />
                  </div>
                )}
                {mode === "pages" && (
                  <div className="space-y-2">
                    <label className="label">Specific Pages to Extract (e.g. 1,5,10)</label>
                    <input
                      type="text"
                      value={pages}
                      onChange={(e) => setPages(e.target.value)}
                      placeholder="1,5,10"
                      className="input-field"
                    />
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button onClick={handleStartSplit} className="btn-primary w-full md:w-auto">
                    Split PDF
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
