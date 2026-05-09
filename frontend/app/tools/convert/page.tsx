"use client";

import { useState, useMemo } from "react";
import { UniversalDropzone } from "@/components/dropzone/UniversalDropzone";
import { JobProgress } from "@/components/progress/JobProgress";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ArrowRight, FileText, FileCode, ImageIcon, Table, Presentation } from "lucide-react";
import { apiUpload } from "@/lib/api";
import { toast } from "sonner";

const CONVERSION_MAP: Record<string, { label: string, icon: any, options: { ext: string, label: string, endpoint: string }[] }> = {
  ".pdf": {
    label: "PDF Document",
    icon: FileText,
    options: [
      { ext: "docx", label: "to Word (.docx)", endpoint: "/tools/pdf-to-word" },
      { ext: "xlsx", label: "to Excel (.xlsx)", endpoint: "/tools/pdf-to-excel" },
      { ext: "pptx", label: "to PowerPoint (.pptx)", endpoint: "/tools/pdf-to-ppt" },
      { ext: "png", label: "to Images (.zip)", endpoint: "/tools/pdf-to-images" },
      { ext: "txt", label: "to Text (.txt)", endpoint: "/tools/pdf-to-text" },
    ]
  },
  ".docx": {
    label: "Word Document",
    icon: FileText,
    options: [
      { ext: "pdf", label: "to PDF (.pdf)", endpoint: "/word/to-pdf" },
      { ext: "html", label: "to HTML (.html)", endpoint: "/word/to-html" },
      { ext: "txt", label: "to Text (.txt)", endpoint: "/word/to-text" },
    ]
  },
  ".xlsx": {
    label: "Excel Spreadsheet",
    icon: Table,
    options: [
      { ext: "pdf", label: "to PDF (.pdf)", endpoint: "/excel/to-pdf" },
      { ext: "csv", label: "to CSV (.csv)", endpoint: "/excel/to-csv" },
      { ext: "json", label: "to JSON (.json)", endpoint: "/excel/to-json" },
    ]
  },
  ".pptx": {
    label: "PowerPoint Presentation",
    icon: Presentation,
    options: [
      { ext: "pdf", label: "to PDF (.pdf)", endpoint: "/ppt/to-pdf" },
      { ext: "png", label: "to Images (.zip)", endpoint: "/ppt/to-images" },
    ]
  },
  ".png": {
    label: "Image (PNG)",
    icon: ImageIcon,
    options: [
      { ext: "pdf", label: "to PDF (.pdf)", endpoint: "/image/to-pdf" },
      { ext: "jpg", label: "to JPEG (.jpg)", endpoint: "/image/convert" },
      { ext: "webp", label: "to WebP (.webp)", endpoint: "/image/convert" },
    ]
  },
  ".jpg": {
    label: "Image (JPEG)",
    icon: ImageIcon,
    options: [
      { ext: "pdf", label: "to PDF (.pdf)", endpoint: "/image/to-pdf" },
      { ext: "png", label: "to PNG (.png)", endpoint: "/image/convert" },
      { ext: "webp", label: "to WebP (.webp)", endpoint: "/image/convert" },
    ]
  },
  ".jpeg": {
    label: "Image (JPEG)",
    icon: ImageIcon,
    options: [
      { ext: "pdf", label: "to PDF (.pdf)", endpoint: "/image/to-pdf" },
      { ext: "png", label: "to PNG (.png)", endpoint: "/image/convert" },
      { ext: "webp", label: "to WebP (.webp)", endpoint: "/image/convert" },
    ]
  }
};

export default function SmartConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fileInfo = useMemo(() => {
    if (!file) return null;
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    return CONVERSION_MAP[ext] || null;
  }, [file]);

  const handleConvert = async (option: typeof CONVERSION_MAP[string]["options"][0]) => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      // Most endpoints expect "file" or "files"
      if (option.endpoint.includes("merge") || option.endpoint.includes("to-pdf") && !option.endpoint.includes("word") && !option.endpoint.includes("excel") && !option.endpoint.includes("ppt")) {
         formData.append("files", file);
      } else {
         formData.append("file", file);
      }

      // Special case for image convert format
      if (option.endpoint === "/image/convert") {
        formData.append("target_format", option.ext);
      }

      const res = await apiUpload.post(option.endpoint, formData);
      setJobId(res.data.job_id);
    } catch (err) {
      toast.error("Conversion failed to start.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-yellow-500/10 text-yellow-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-500/5"
          >
            <Zap className="w-10 h-10 fill-current" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black font-serif text-white tracking-tight">
            Smart Converter
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-medium">
            Any format, any file. We'll handle the rest.
          </p>
        </div>

        {!jobId ? (
          <div className="space-y-8">
            <UniversalDropzone
              onFilesAccepted={(files) => setFile(files[0])}
              multiple={false}
              title={file ? file.name : "Drop any document or image"}
              subtitle={file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF, Word, Excel, PPT, PNG, JPG..."}
            />

            <AnimatePresence mode="wait">
              {file && fileInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 text-zinc-500 font-bold uppercase tracking-widest text-xs px-2">
                    <fileInfo.icon className="w-4 h-4" />
                    Detected: {fileInfo.label}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {fileInfo.options.map((opt) => (
                      <button
                        key={opt.ext}
                        disabled={loading}
                        onClick={() => handleConvert(opt)}
                        className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] hover:border-white/20 transition-all group text-left"
                      >
                        <div>
                          <div className="text-white font-bold text-lg mb-1">Convert {opt.label}</div>
                          <div className="text-zinc-500 text-sm">High-fidelity conversion</div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {file && !fileInfo && (
                <motion.div 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }}
                   className="text-center py-12 bg-red-500/5 border border-red-500/10 rounded-3xl"
                >
                  <p className="text-red-400 font-bold">Unsupported file format for Smart Conversion.</p>
                  <button onClick={() => setFile(null)} className="mt-4 text-zinc-500 hover:text-white transition-colors underline">Try another file</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <JobProgress
            jobId={jobId}
            onReset={() => {
              setJobId(null);
              setFile(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
