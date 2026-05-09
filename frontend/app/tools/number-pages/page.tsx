"use client";

import { useState } from "react";
import { UniversalDropzone } from "@/components/dropzone/UniversalDropzone";
import { JobProgress } from "@/components/progress/JobProgress";
import { SettingsPanel } from "@/components/layout/SettingsPanel";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { motion } from "framer-motion";
import { Hash } from "lucide-react";
import { apiUpload } from "@/lib/api";
import { toast } from "sonner";

type HAlign = "left" | "center" | "right";
type VAlign = "header" | "footer";

export default function NumberPagesToolPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const [hAlign, setHAlign] = useState<HAlign>("center");
  const [vAlign, setVAlign] = useState<VAlign>("footer");
  const [startNum, setStartNum] = useState(1);
  const [fontSize, setFontSize] = useState(12);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");

  const handleStart = async () => {
    if (!file) {
      toast.error("Please upload a PDF.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("h_align", hAlign);
      formData.append("v_align", vAlign);
      formData.append("start_number", startNum.toString());
      formData.append("font_size", fontSize.toString());
      formData.append("prefix", prefix);
      formData.append("suffix", suffix);

      const res = await apiUpload.post("/number-pages", formData);
      setJobId(res.data.job_id);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to add page numbers.");
    }
  };

  if (!file) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-violet-500/10 text-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Hash className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-white tracking-tight">
            Add Page Numbers
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Stamp page numbers on your PDF — configure position, size, prefix, and more.
          </p>
          <UniversalDropzone
            onFilesAccepted={(f) => setFile(f[0])}
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
        title={`Numbering: ${file.name}`}
        actions={
          <button onClick={() => setFile(null)} className="text-sm text-zinc-400 hover:text-white">
            Change File
          </button>
        }
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6 items-start justify-center mt-12">
        <SettingsPanel title="Page Number Settings" defaultOpen>
          <div className="space-y-6">
            {/* Vertical Position */}
            <div className="space-y-3">
              <label className="label">Vertical Position</label>
              <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                {(["header", "footer"] as VAlign[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setVAlign(v)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${
                      vAlign === v ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Horizontal Position */}
            <div className="space-y-3">
              <label className="label">Horizontal Position</label>
              <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                {(["left", "center", "right"] as HAlign[]).map((h) => (
                  <button
                    key={h}
                    onClick={() => setHAlign(h)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${
                      hAlign === h ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Number */}
            <div className="space-y-2">
              <label className="label">Start Number</label>
              <input
                type="number"
                min="1"
                value={startNum}
                onChange={(e) => setStartNum(parseInt(e.target.value) || 1)}
                className="input-field w-full"
              />
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <label className="label flex justify-between">
                <span>Font Size</span><span>{fontSize}pt</span>
              </label>
              <input
                type="range"
                min="8"
                max="24"
                step="1"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>

            {/* Prefix / Suffix */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="label">Prefix</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  placeholder="e.g. Page "
                  className="input-field"
                />
              </div>
              <div className="space-y-2">
                <label className="label">Suffix</label>
                <input
                  type="text"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  placeholder="e.g.  / Total"
                  className="input-field"
                />
              </div>
            </div>

            {/* Preview pill */}
            <div className="bg-black/30 rounded-xl p-4 border border-white/5 text-center">
              <span className="text-sm text-zinc-400">Preview: </span>
              <span className="text-white font-medium">{prefix}{startNum}{suffix}</span>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={handleStart}
                className="btn-primary w-full bg-violet-500 hover:bg-violet-600 shadow-violet-500/25"
              >
                Add Page Numbers
              </button>
            </div>
          </div>
        </SettingsPanel>
      </div>
    </div>
  );
}
