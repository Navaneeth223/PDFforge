"use client";

import { useState, useRef, useEffect } from "react";
import { UniversalDropzone } from "@/components/dropzone/UniversalDropzone";
import { JobProgress } from "@/components/progress/JobProgress";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { PDFViewer } from "@/components/pdf-viewer/PDFViewer";
import { motion } from "framer-motion";
import { GitCompare } from "lucide-react";
import { apiUpload } from "@/lib/api";
import { toast } from "sonner";

export default function CompareToolPage() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const handleStart = async () => {
    if (!fileA || !fileB) {
      toast.error("Please upload both PDFs to compare.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file_a", fileA);
      formData.append("file_b", fileB);

      const res = await apiUpload.post("/tools/compare", formData);
      setJobId(res.data.job_id);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to start comparison.");
    }
  };

  if (jobId) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center">
        <JobProgress
          jobId={jobId}
          onReset={() => { setJobId(null); setFileA(null); setFileB(null); }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Hero */}
      {!fileA && !fileB && (
        <div className="pt-24 pb-8 px-4 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-teal-500/10 text-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <GitCompare className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-white tracking-tight mb-4">
            Compare PDFs
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Upload two documents and get a side-by-side visual diff highlighting every change.
          </p>
        </div>
      )}

      {fileA || fileB ? (
        <Toolbar
          title="Compare PDFs"
          subtitle={`${fileA?.name ?? "—"} vs ${fileB?.name ?? "—"}`}
          actions={
            <button
              onClick={handleStart}
              disabled={!fileA || !fileB}
              className="btn-primary bg-teal-500 hover:bg-teal-600 shadow-teal-500/25 disabled:opacity-50 text-sm px-6 py-2"
            >
              Generate Diff
            </button>
          }
        />
      ) : null}

      {/* Side-by-side upload / preview area */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-4 mt-4">
        {/* Document A */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-teal-400 uppercase tracking-widest">
              Document A {fileA && `— ${fileA.name}`}
            </span>
            {fileA && (
              <button onClick={() => setFileA(null)} className="text-xs text-zinc-500 hover:text-white">
                Remove
              </button>
            )}
          </div>
          {fileA ? (
            <div className="flex-1 overflow-auto">
              <PDFViewer file={fileA} />
            </div>
          ) : (
            <UniversalDropzone
              onFilesAccepted={(f) => setFileA(f[0])}
              maxFiles={1}
              title="Upload first PDF"
              subtitle="The original document"
            />
          )}
        </div>

        {/* Divider */}
        <div className="hidden md:flex flex-col items-center justify-center gap-2 text-zinc-600">
          <div className="w-px flex-1 bg-white/5" />
          <GitCompare className="w-5 h-5" />
          <div className="w-px flex-1 bg-white/5" />
        </div>

        {/* Document B */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-purple-400 uppercase tracking-widest">
              Document B {fileB && `— ${fileB.name}`}
            </span>
            {fileB && (
              <button onClick={() => setFileB(null)} className="text-xs text-zinc-500 hover:text-white">
                Remove
              </button>
            )}
          </div>
          {fileB ? (
            <div className="flex-1 overflow-auto">
              <PDFViewer file={fileB} />
            </div>
          ) : (
            <UniversalDropzone
              onFilesAccepted={(f) => setFileB(f[0])}
              maxFiles={1}
              title="Upload second PDF"
              subtitle="The modified document"
            />
          )}
        </div>
      </div>

      {/* Mobile CTA */}
      {(fileA || fileB) && (
        <div className="md:hidden p-4 border-t border-white/5">
          <button
            onClick={handleStart}
            disabled={!fileA || !fileB}
            className="btn-primary w-full bg-teal-500 hover:bg-teal-600 shadow-teal-500/25 disabled:opacity-50"
          >
            Generate Diff
          </button>
        </div>
      )}
    </div>
  );
}
