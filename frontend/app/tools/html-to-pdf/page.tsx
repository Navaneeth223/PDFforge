"use client";

import { useState } from "react";
import { JobProgress } from "@/components/progress/JobProgress";
import { SettingsPanel } from "@/components/layout/SettingsPanel";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function HTMLToPDFPage() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [mode, setMode] = useState<"url" | "html">("url");

  const handleStartConvert = async () => {
    if (mode === "url" && !url) {
      toast.error("Please enter a valid URL.");
      return;
    }
    if (mode === "html" && !htmlContent) {
      toast.error("Please paste some HTML content.");
      return;
    }

    try {
      const formData = new FormData();
      if (mode === "url") {
        formData.append("url", url);
      } else {
        formData.append("html_content", htmlContent);
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/tools/html-to-pdf`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setJobId(res.data.job_id);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to start conversion.");
      console.error(err);
    }
  };

  if (jobId) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center">
        <JobProgress jobId={jobId} onReset={() => { setJobId(null); }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-16">
      <div className="max-w-4xl mx-auto space-y-8 text-center pt-8 mb-8 px-4 w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
        >
          <Globe className="w-8 h-8" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black font-serif text-white tracking-tight">
          HTML to PDF
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Convert webpages or raw HTML code into a formatted PDF document.
        </p>
      </div>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6 items-start justify-center">
        <div className="flex-1 w-full bg-white/5 rounded-2xl border border-white/10 p-6">
          <div className="flex bg-black/40 rounded-xl p-1 border border-white/5 mb-6 max-w-xs mx-auto">
            <button
              onClick={() => setMode("url")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === "url" ? "bg-white/10 text-white shadow-sm" : "text-zinc-400 hover:text-white"}`}
            >
              URL
            </button>
            <button
              onClick={() => setMode("html")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === "html" ? "bg-white/10 text-white shadow-sm" : "text-zinc-400 hover:text-white"}`}
            >
              Raw HTML
            </button>
          </div>

          {mode === "url" ? (
            <div className="space-y-4 max-w-2xl mx-auto">
              <label className="label text-center block">Website URL</label>
              <input 
                type="url" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="input-field text-lg text-center"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <label className="label">Raw HTML Content</label>
              <textarea 
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="<h1>Hello World</h1><p>This will be rendered to PDF.</p>"
                className="input-field h-64 font-mono text-sm"
              />
            </div>
          )}

          <div className="pt-8 flex justify-center border-t border-white/10 mt-8">
            <button 
              onClick={handleStartConvert}
              className="btn-primary bg-blue-500 hover:bg-blue-600 shadow-blue-500/25 px-12"
            >
              Convert to PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
