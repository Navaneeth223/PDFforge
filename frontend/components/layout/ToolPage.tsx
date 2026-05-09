"use client";

import { useState } from "react";
import { UniversalDropzone } from "@/components/dropzone/UniversalDropzone";
import { JobProgress } from "@/components/progress/JobProgress";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { apiUpload } from "@/lib/api";
import { toast } from "sonner";

interface ToolPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  endpoint: string;
  accept: Record<string, string[]>;
  multiple?: boolean;
  buttonText?: string;
  category?: string;
  extraFields?: (formData: FormData) => void;
  renderOptions?: () => React.ReactNode;
}

export function ToolPage({
  title,
  description,
  icon: Icon,
  endpoint,
  accept,
  multiple = false,
  buttonText = "Start Processing",
  category = "Tool",
  extraFields,
  renderOptions
}: ToolPageProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (files.length === 0) {
      toast.error("Please upload a file.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (multiple) {
        files.forEach((file) => formData.append("files", file));
      } else {
        formData.append("file", files[0]);
      }

      if (extraFields) {
        extraFields(formData);
      }

      const res = await apiUpload.post(endpoint, formData);
      setJobId(res.data.job_id);
    } catch (err) {
      toast.error("Failed to start job.");
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
            className="w-20 h-20 bg-indigo-500/10 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6"
          >
            <Icon className="w-10 h-10" />
          </motion.div>
          <div className="text-indigo-400 font-bold uppercase tracking-widest text-xs">{category}</div>
          <h1 className="text-4xl md:text-6xl font-black font-serif text-white tracking-tight">
            {title}
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto font-medium">
            {description}
          </p>
        </div>

        {!jobId ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <UniversalDropzone
              onFilesAccepted={setFiles}
              maxFiles={multiple ? 0 : 1}
              title={files.length > 0 ? (multiple ? `${files.length} files selected` : files[0].name) : `Upload files for ${title}`}
              subtitle={`Drag & drop or click to browse. Supported: ${Object.values(accept).flat().join(", ")}`}
              accept={accept}
            />

            {renderOptions && (
              <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
                {renderOptions()}
              </div>
            )}

            {files.length > 0 && (
              <div className="flex justify-center mt-12">
                <button 
                  onClick={handleStart} 
                  disabled={loading}
                  className="btn-primary px-12 py-4 text-lg shadow-2xl shadow-indigo-500/20"
                >
                  {loading ? "Processing..." : buttonText}
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <JobProgress
            jobId={jobId}
            onReset={() => {
              setJobId(null);
              setFiles([]);
            }}
          />
        )}
      </div>
    </div>
  );
}
