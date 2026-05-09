"use client";

import { useState } from "react";
import { UniversalDropzone } from "@/components/dropzone/UniversalDropzone";
import { JobProgress } from "@/components/progress/JobProgress";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { apiUpload } from "@/lib/api";
import { toast } from "sonner";

export default function RedactToolPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [searchTerms, setSearchTerms] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);

  const handleStartRedact = async () => {
    if (files.length !== 1) {
      toast.error("Please upload exactly 1 PDF.");
      return;
    }
    if (!searchTerms.trim()) {
      toast.error("Please enter at least one term to redact.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("search_terms", searchTerms);
      formData.append("case_sensitive", caseSensitive.toString());

      const res = await apiUpload.post("/redact", formData);
      setJobId(res.data.job_id);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to start redaction job.");
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
            className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <ShieldAlert className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-white tracking-tight">
            Redact PDF
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Permanently remove sensitive text from your PDF.
          </p>
        </div>

        {!jobId ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {files.length === 0 ? (
              <UniversalDropzone
                onFilesAccepted={setFiles}
                maxFiles={1}
                title="Upload PDF to Redact"
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
                  <div className="space-y-2">
                    <label className="label">Terms to Redact (comma-separated)</label>
                    <input
                      type="text"
                      value={searchTerms}
                      onChange={(e) => setSearchTerms(e.target.value)}
                      placeholder="e.g. SSN, John Doe, confidential"
                      className="input-field"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="case-sensitive"
                      checked={caseSensitive}
                      onChange={(e) => setCaseSensitive(e.target.checked)}
                      className="w-4 h-4 rounded bg-white/5 border-white/20 text-indigo-500 focus:ring-indigo-500/50"
                    />
                    <label htmlFor="case-sensitive" className="text-sm text-zinc-300">
                      Case Sensitive
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button onClick={handleStartRedact} className="btn-primary w-full md:w-auto bg-red-500 hover:bg-red-600 shadow-red-500/25 hover:shadow-red-500/40">
                    Redact Information
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
                setJobId(null);
                setFiles([]);
                setSearchTerms("");
              }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
