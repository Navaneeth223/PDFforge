"use client";

import { useState } from "react";
import { UniversalDropzone } from "@/components/dropzone/UniversalDropzone";
import { JobProgress } from "@/components/progress/JobProgress";
import { SettingsPanel } from "@/components/layout/SettingsPanel";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { motion } from "framer-motion";
import { FileSearch } from "lucide-react";
import { apiUpload } from "@/lib/api";
import { toast } from "sonner";

export default function MetadataToolPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("");
  const [keywords, setKeywords] = useState("");
  const [creator, setCreator] = useState("");
  const [producer, setProducer] = useState("");

  const handleStartUpdate = async () => {
    if (!file) {
      toast.error("Please upload a PDF.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (title) formData.append("title", title);
      if (author) formData.append("author", author);
      if (subject) formData.append("subject", subject);
      if (keywords) formData.append("keywords", keywords);
      if (creator) formData.append("creator", creator);
      if (producer) formData.append("producer", producer);

      const res = await apiUpload.post("/tools/metadata", formData);
      setJobId(res.data.job_id);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to start metadata job.");
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
            className="w-16 h-16 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <FileSearch className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-white tracking-tight">
            Edit Metadata
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Change or view PDF properties like title, author, subject, and keywords.
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
        title={`Editing Metadata: ${file.name}`}
        actions={
          <button onClick={() => setFile(null)} className="text-sm text-zinc-400 hover:text-white">
            Change File
          </button>
        }
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6 items-start justify-center mt-12">
        <SettingsPanel title="PDF Properties" defaultOpen={true}>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="label">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document Title"
                className="input-field w-full"
              />
            </div>
            
            <div className="space-y-3">
              <label className="label">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Document Author"
                className="input-field w-full"
              />
            </div>

            <div className="space-y-3">
              <label className="label">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Document Subject"
                className="input-field w-full"
              />
            </div>

            <div className="space-y-3">
              <label className="label">Keywords</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Comma separated keywords"
                className="input-field w-full"
              />
            </div>
            
            <div className="space-y-3">
              <label className="label">Creator Application</label>
              <input
                type="text"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                placeholder="e.g. Microsoft Word"
                className="input-field w-full"
              />
            </div>

            <div className="pt-6 border-t border-white/10">
              <button 
                onClick={handleStartUpdate}
                className="btn-primary w-full bg-purple-500 hover:bg-purple-600 shadow-purple-500/25 text-white"
              >
                Update Metadata
              </button>
            </div>
          </div>
        </SettingsPanel>
      </div>
    </div>
  );
}
