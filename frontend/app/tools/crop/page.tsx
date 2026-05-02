"use client";

import { useState } from "react";
import { UniversalDropzone } from "@/components/dropzone/UniversalDropzone";
import { JobProgress } from "@/components/progress/JobProgress";
import { SettingsPanel } from "@/components/layout/SettingsPanel";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { motion } from "framer-motion";
import { Crop } from "lucide-react";
import { apiUpload } from "@/lib/api";
import { toast } from "sonner";

export default function CropToolPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  // Crop margins in points (72pt = 1 inch)
  const [top, setTop] = useState(0);
  const [right, setRight] = useState(0);
  const [bottom, setBottom] = useState(0);
  const [left, setLeft] = useState(0);
  const [pages, setPages] = useState("all");

  const handleStart = async () => {
    if (!file) {
      toast.error("Please upload a PDF.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("top", top.toString());
      formData.append("right", right.toString());
      formData.append("bottom", bottom.toString());
      formData.append("left", left.toString());
      formData.append("pages", pages);

      const res = await apiUpload.post("/tools/crop", formData);
      setJobId(res.data.job_id);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to crop PDF.");
    }
  };

  if (!file) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Crop className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-white tracking-tight">
            Crop PDF
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Remove margins and trim white space from your PDF pages by setting crop margins.
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
        title={`Cropping: ${file.name}`}
        actions={
          <button onClick={() => setFile(null)} className="text-sm text-zinc-400 hover:text-white">
            Change File
          </button>
        }
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6 items-start justify-center mt-12">
        <SettingsPanel title="Crop Settings" defaultOpen>
          <div className="space-y-6">
            <p className="text-sm text-zinc-400">
              Enter crop margins in points (pt). 72pt = 1 inch. Positive values trim inward from each edge.
            </p>

            {/* Crop Visual */}
            <div className="relative w-32 h-44 mx-auto">
              <div className="absolute inset-0 bg-white/5 border border-white/20 rounded" />
              <div
                className="absolute bg-amber-500/20 border border-amber-500/60 rounded"
                style={{
                  top: `${Math.min(top / 2, 20)}px`,
                  right: `${Math.min(right / 2, 20)}px`,
                  bottom: `${Math.min(bottom / 2, 20)}px`,
                  left: `${Math.min(left / 2, 20)}px`,
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs text-amber-400 font-medium">
                Crop Area
              </span>
            </div>

            {/* Margin inputs */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Top", value: top, set: setTop },
                { label: "Right", value: right, set: setRight },
                { label: "Bottom", value: bottom, set: setBottom },
                { label: "Left", value: left, set: setLeft },
              ].map(({ label, value, set }) => (
                <div key={label} className="space-y-1">
                  <label className="label text-xs">{label} (pt)</label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={value}
                    onChange={(e) => set(Math.max(0, parseInt(e.target.value) || 0))}
                    className="input-field"
                  />
                </div>
              ))}
            </div>

            {/* Page range */}
            <div className="space-y-2">
              <label className="label">Apply to Pages</label>
              <input
                type="text"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder='all, or e.g. "1,3,5-9"'
                className="input-field"
              />
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={handleStart}
                className="btn-primary w-full bg-amber-500 hover:bg-amber-600 shadow-amber-500/25 text-white"
              >
                Crop PDF
              </button>
            </div>
          </div>
        </SettingsPanel>
      </div>
    </div>
  );
}
