"use client";

import { useState } from "react";
import { UniversalDropzone } from "@/components/dropzone/UniversalDropzone";
import { JobProgress } from "@/components/progress/JobProgress";
import { SettingsPanel } from "@/components/layout/SettingsPanel";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { motion } from "framer-motion";
import { Droplet } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function WatermarkToolPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.5);
  const [angle, setAngle] = useState(45);
  const [color, setColor] = useState("#000000");

  const handleStartWatermark = async () => {
    if (!file) {
      toast.error("Please upload a PDF.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("text", text);
      formData.append("opacity", opacity.toString());
      formData.append("angle", angle.toString());
      formData.append("color", color);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/tools/watermark`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setJobId(res.data.job_id);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to start watermarking.");
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
            className="w-16 h-16 bg-cyan-500/10 text-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Droplet className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-white tracking-tight">
            Add Watermark
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Stamp an image or text over your PDF in seconds.
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
        title={`Watermarking: ${file.name}`}
        actions={
          <button onClick={() => setFile(null)} className="text-sm text-zinc-400 hover:text-white">
            Change File
          </button>
        }
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6 items-start justify-center mt-12">
        <SettingsPanel title="Watermark Settings" defaultOpen={true}>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="label">Text</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="input-field w-full font-bold"
              />
            </div>

            <div className="space-y-3">
              <label className="label flex justify-between">
                <span>Opacity</span>
                <span>{Math.round(opacity * 100)}%</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div className="space-y-3">
              <label className="label flex justify-between">
                <span>Rotation Angle</span>
                <span>{angle}°</span>
              </label>
              <input
                type="range"
                min="-90"
                max="90"
                step="15"
                value={angle}
                onChange={(e) => setAngle(parseInt(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div className="space-y-3">
              <label className="label">Color (Hex)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded border-0 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="input-field flex-1 uppercase font-mono"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <button 
                onClick={handleStartWatermark}
                className="btn-primary w-full bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/25 text-white"
              >
                Add Watermark
              </button>
            </div>
          </div>
        </SettingsPanel>
      </div>
    </div>
  );
}
