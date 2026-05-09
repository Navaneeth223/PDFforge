"use client";

import { useState } from "react";
import { UniversalDropzone } from "@/components/dropzone/UniversalDropzone";
import { JobProgress } from "@/components/progress/JobProgress";
import { SettingsPanel } from "@/components/layout/SettingsPanel";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { motion } from "framer-motion";
import { PenTool } from "lucide-react";
import { apiUpload } from "@/lib/api";
import { toast } from "sonner";

export default function SignToolPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const [signatureText, setSignatureText] = useState("");
  const [page, setPage] = useState(1);
  const [x, setX] = useState(100);
  const [y, setY] = useState(100);

  const handleStartSign = async () => {
    if (!file) {
      toast.error("Please upload a PDF.");
      return;
    }
    if (!signatureText) {
      toast.error("Please provide signature text.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature_text", signatureText);
      formData.append("page", page.toString());
      formData.append("x", x.toString());
      formData.append("y", y.toString());

      const res = await apiUpload.post("/sign", formData);
      setJobId(res.data.job_id);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to start signing.");
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
            className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <PenTool className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-white tracking-tight">
            Sign PDF
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Digitally sign your PDF documents.
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
        title={`Signing: ${file.name}`}
        actions={
          <button onClick={() => setFile(null)} className="text-sm text-zinc-400 hover:text-white">
            Change File
          </button>
        }
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6 items-start justify-center mt-12">
        <SettingsPanel title="Signature Settings" defaultOpen={true}>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="label">Signature Text</label>
              <input
                type="text"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder="Type your signature here..."
                className="input-field w-full font-serif italic text-lg"
              />
            </div>

            <div className="space-y-3">
              <label className="label">Page Number</label>
              <input
                type="number"
                min="1"
                value={page}
                onChange={(e) => setPage(parseInt(e.target.value))}
                className="input-field w-full"
              />
            </div>

            <div className="space-y-3">
              <label className="label">X Coordinate</label>
              <input
                type="number"
                value={x}
                onChange={(e) => setX(parseInt(e.target.value))}
                className="input-field w-full"
              />
            </div>

            <div className="space-y-3">
              <label className="label">Y Coordinate</label>
              <input
                type="number"
                value={y}
                onChange={(e) => setY(parseInt(e.target.value))}
                className="input-field w-full"
              />
            </div>

            <div className="pt-6 border-t border-white/10">
              <button 
                onClick={handleStartSign}
                className="btn-primary w-full bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/25 text-white"
              >
                Sign Document
              </button>
            </div>
          </div>
        </SettingsPanel>
      </div>
    </div>
  );
}
