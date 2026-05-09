"use client";

import { useState } from "react";
import { UniversalDropzone } from "@/components/dropzone/UniversalDropzone";
import { JobProgress } from "@/components/progress/JobProgress";
import { SettingsPanel } from "@/components/layout/SettingsPanel";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { PDFPageThumbnails } from "@/components/pdf-viewer/PDFPageThumbnails";
import { motion } from "framer-motion";
import { CopyPlus } from "lucide-react";
import { apiUpload } from "@/lib/api";
import { toast } from "sonner";

export default function ExtractPagesToolPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);

  const handleStartExtract = async () => {
    if (!file) {
      toast.error("Please upload a PDF.");
      return;
    }
    if (selectedPages.length === 0) {
      toast.error("Please select at least one page to extract.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pages", selectedPages.sort((a,b) => a-b).join(","));

      const res = await apiUpload.post("/extract-pages", formData);
      setJobId(res.data.job_id);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to start extraction job.");
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
            className="w-16 h-16 bg-fuchsia-500/10 text-fuchsia-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <CopyPlus className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-white tracking-tight">
            Extract Pages
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Select specific pages from your PDF to extract them into a new document.
          </p>
          <UniversalDropzone
            onFilesAccepted={(files) => setFile(files[0])}
            maxFiles={1}
            title="Upload PDF to Extract From"
          />
        </div>
      </div>
    );
  }

  if (jobId) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center">
        <JobProgress jobId={jobId} onReset={() => { setJobId(null); setFile(null); setSelectedPages([]); }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-16">
      <Toolbar 
        title={`Extracting from: ${file.name}`}
        subtitle={`${selectedPages.length} pages selected`}
        actions={
          <button onClick={() => {setFile(null); setSelectedPages([])}} className="text-sm text-zinc-400 hover:text-white">
            Change File
          </button>
        }
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6">
        <div className="flex-1 overflow-auto bg-white/5 rounded-2xl border border-white/10 p-6 min-h-[500px]">
          <PDFPageThumbnails 
            file={file}
            selectable={true}
            reorderable={false}
            onSelectionChange={setSelectedPages}
          />
        </div>

        <SettingsPanel title="Extraction Settings">
          <div className="space-y-6">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
              <div className="text-3xl font-black text-white">{selectedPages.length}</div>
              <div className="text-sm text-zinc-400">Pages Selected</div>
            </div>

            <p className="text-sm text-zinc-400">
              Click on the thumbnails to select the pages you want to keep. The selected pages will be extracted and saved as a new PDF document.
            </p>

            <div className="pt-6 border-t border-white/10">
              <button 
                onClick={handleStartExtract}
                disabled={selectedPages.length === 0}
                className="btn-primary w-full bg-fuchsia-500 hover:bg-fuchsia-600 shadow-fuchsia-500/25 disabled:opacity-50"
              >
                Extract Pages
              </button>
            </div>
          </div>
        </SettingsPanel>
      </div>
    </div>
  );
}
