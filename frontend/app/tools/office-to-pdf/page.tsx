"use client";

import { useState } from "react";
import { UniversalDropzone } from "@/components/dropzone/UniversalDropzone";
import { JobProgress } from "@/components/progress/JobProgress";
import { motion } from "framer-motion";
import { FileDown } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function OfficeToPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);

  const handleStartConvert = async () => {
    if (files.length !== 1) {
      toast.error("Please upload exactly 1 Office document.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", files[0]);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/tools/office-to-pdf`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setJobId(res.data.job_id);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to start conversion job.");
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
            className="w-16 h-16 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <FileDown className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-white tracking-tight">
            Word to PDF
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Convert your Word, Excel, and PowerPoint documents to PDF format.
          </p>
        </div>

        {!jobId ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <UniversalDropzone
              onFilesAccepted={setFiles}
              maxFiles={1}
              title="Upload Office Document"
              subtitle="Drag & drop your .doc, .docx, .xls, .ppt, or click to browse"
              accept={{
                "application/msword": [".doc"],
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
                "application/vnd.ms-excel": [".xls"],
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
                "application/vnd.ms-powerpoint": [".ppt"],
                "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"]
              }}
            />

            {files.length === 1 && (
              <div className="flex justify-center mt-8">
                <button onClick={handleStartConvert} className="btn-primary w-full md:w-auto">
                  Convert to PDF
                </button>
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
              }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
