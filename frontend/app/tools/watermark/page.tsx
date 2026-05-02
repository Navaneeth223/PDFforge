"use client";

import { useState } from "react";
import { UniversalDropzone } from "@/components/dropzone/UniversalDropzone";
import { JobProgress } from "@/components/progress/JobProgress";
import { SettingsPanel } from "@/components/layout/SettingsPanel";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { motion } from "framer-motion";
import { Droplet, Type, Image as ImageIcon, LayoutGrid, Type as TypeIcon, FileText } from "lucide-react";
import { apiUpload } from "@/lib/api";
import { toast } from "sonner";

type WatermarkType = "text" | "image";

export default function WatermarkToolPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  // Settings
  const [type, setType] = useState<WatermarkType>("text");
  const [text, setText] = useState("CONFIDENTIAL");
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [opacity, setOpacity] = useState(0.5);
  const [angle, setAngle] = useState(45);
  const [color, setColor] = useState("#808080");
  const [position, setPosition] = useState("center");
  const [fontSize, setFontSize] = useState(48);

  const handleStartWatermark = async () => {
    if (!file) {
      toast.error("Please upload a PDF.");
      return;
    }

    if (type === "image" && !watermarkImage) {
      toast.error("Please upload a watermark image.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("watermark_type", type);
      formData.append("opacity", opacity.toString());
      formData.append("angle", angle.toString());
      formData.append("position", position);
      formData.append("font_size", fontSize.toString());

      if (type === "text") {
        formData.append("text", text);
        formData.append("color", color);
      } else if (watermarkImage) {
        formData.append("watermark_image", watermarkImage);
      }

      const res = await apiUpload.post("/tools/watermark", formData);
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
            Stamp an image or text over your PDF in seconds. Professional, secure, and fast.
          </p>
          <UniversalDropzone
            onFilesAccepted={(files) => setFile(files[0])}
            maxFiles={1}
            title="Upload PDF"
            accept={{ "application/pdf": [".pdf"] }}
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

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6 items-start mt-12">
        {/* Preview / Main Area */}
        <div className="flex-1 w-full bg-zinc-900/50 rounded-2xl border border-white/5 flex items-center justify-center min-h-[400px] relative overflow-hidden">
           <div className="text-center space-y-4">
              <div className="p-4 bg-white/5 rounded-full inline-block">
                <FileText className="w-12 h-12 text-zinc-500" />
              </div>
              <p className="text-zinc-500 font-medium">{file.name}</p>
              <div className="flex gap-2 justify-center">
                 <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-zinc-400">PDF Document</span>
                 <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
           </div>
        </div>

        {/* Settings Panel */}
        <SettingsPanel title="Watermark Settings" defaultOpen={true}>
          <div className="space-y-6">
            {/* Type Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl">
              <button
                onClick={() => setType("text")}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                  type === "text" ? "bg-cyan-500 text-white shadow-lg" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Type className="w-4 h-4" /> Text
              </button>
              <button
                onClick={() => setType("image")}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                  type === "image" ? "bg-cyan-500 text-white shadow-lg" : "text-zinc-400 hover:text-white"
                }`}
              >
                <ImageIcon className="w-4 h-4" /> Image
              </button>
            </div>

            {type === "text" ? (
              <>
                <div className="space-y-3">
                  <label className="label">Watermark Text</label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="input-field w-full font-bold"
                    placeholder="Enter text..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="label flex justify-between">
                    <span>Font Size</span>
                    <span>{fontSize}px</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <TypeIcon className="w-4 h-4 text-zinc-500" />
                    <input
                      type="range"
                      min="12"
                      max="144"
                      step="2"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="label">Color</label>
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
                      className="input-field flex-1 uppercase font-mono text-sm"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <label className="label">Watermark Image</label>
                <div 
                  className={`
                    border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors
                    ${watermarkImage ? "border-cyan-500/50 bg-cyan-500/5" : "border-white/10 hover:border-white/20"}
                  `}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) setWatermarkImage(file);
                    };
                    input.click();
                  }}
                >
                  {watermarkImage ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-white truncate">{watermarkImage.name}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setWatermarkImage(null); }}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <ImageIcon className="w-8 h-8 text-zinc-500 mx-auto" />
                      <p className="text-xs text-zinc-400">Click to upload image (PNG, JPG)</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="label flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" /> Position
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="input-field w-full bg-zinc-800"
              >
                <option value="center">Center</option>
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="label flex justify-between">
                <span>Opacity</span>
                <span>{Math.round(opacity * 100)}%</span>
              </label>
              <input
                type="range"
                min="0.05"
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
                min="-180"
                max="180"
                step="15"
                value={angle}
                onChange={(e) => setAngle(parseInt(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div className="pt-6 border-t border-white/10">
              <button 
                onClick={handleStartWatermark}
                className="btn-primary w-full bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/25 text-white py-4 text-lg"
              >
                Apply Watermark
              </button>
            </div>
          </div>
        </SettingsPanel>
      </div>
    </div>
  );
}
