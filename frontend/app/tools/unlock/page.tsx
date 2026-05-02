"use client";

import { useState } from "react";
import { UniversalDropzone } from "@/components/dropzone/UniversalDropzone";
import { JobProgress } from "@/components/progress/JobProgress";
import { motion } from "framer-motion";
import { Unlock } from "lucide-react";
import { apiUpload } from "@/lib/api";
import { toast } from "sonner";

export default function UnlockToolPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  const handleStartUnlock = async () => {
    if (!file) {
      toast.error("Please upload a PDF.");
      return;
    }
    if (!password) {
      toast.error("Please provide the password to unlock the file.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);

      const res = await apiUpload.post("/tools/unlock", formData);
      setJobId(res.data.job_id);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to unlock PDF. Incorrect password?");
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
            className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Unlock className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-white tracking-tight">
            Unlock PDF
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Remove password security from your PDF instantly.
          </p>
          <UniversalDropzone
            onFilesAccepted={(files) => setFile(files[0])}
            maxFiles={1}
            title="Upload Locked PDF"
          />
        </div>
      </div>
    );
  }

  if (jobId) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center">
        <JobProgress jobId={jobId} onReset={() => { setJobId(null); setFile(null); setPassword(""); }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-24 pb-12 px-4 items-center">
      <div className="glass p-8 rounded-2xl space-y-6 max-w-xl w-full">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="font-bold text-lg text-white">{file.name}</h3>
            <p className="text-sm text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button onClick={() => setFile(null)} className="text-sm text-emerald-400 hover:text-emerald-300">
            Change File
          </button>
        </div>

        <div className="space-y-4">
          <label className="label">Current Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter the password required to open this file"
            className="input-field w-full"
          />
          <p className="text-sm text-zinc-400">
            We will use this password to decrypt the file and then permanently remove the security restrictions.
          </p>
        </div>

        <div className="pt-4 flex justify-end">
          <button onClick={handleStartUnlock} className="btn-primary w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25 text-white">
            Unlock PDF
          </button>
        </div>
      </div>
    </div>
  );
}
