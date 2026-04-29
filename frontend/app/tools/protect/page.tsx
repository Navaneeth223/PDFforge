"use client";

import { useState } from "react";
import { UniversalDropzone } from "@/components/dropzone/UniversalDropzone";
import { JobProgress } from "@/components/progress/JobProgress";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function ProtectToolPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  
  const [userPassword, setUserPassword] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [allowPrint, setAllowPrint] = useState(false);
  const [allowCopy, setAllowCopy] = useState(false);
  const [allowEdit, setAllowEdit] = useState(false);
  const [allowAnnotate, setAllowAnnotate] = useState(false);

  const handleStartProtect = async () => {
    if (files.length !== 1) {
      toast.error("Please upload exactly 1 PDF.");
      return;
    }
    if (!userPassword) {
      toast.error("Please provide a password to protect the PDF.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("user_password", userPassword);
      formData.append("owner_password", ownerPassword || userPassword);
      formData.append("allow_print", allowPrint.toString());
      formData.append("allow_copy", allowCopy.toString());
      formData.append("allow_edit", allowEdit.toString());
      formData.append("allow_annotate", allowAnnotate.toString());

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/tools/protect`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setJobId(res.data.job_id);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to protect PDF.");
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
            className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Lock className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-white tracking-tight">
            Protect PDF
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Encrypt your PDF with AES-256 and set custom permissions.
          </p>
        </div>

        {!jobId ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {files.length === 0 ? (
              <UniversalDropzone
                onFilesAccepted={setFiles}
                maxFiles={1}
                title="Upload PDF to Protect"
                subtitle="Drag & drop your PDF, or click to browse"
              />
            ) : (
              <div className="glass p-8 rounded-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="font-bold text-lg text-white">{files[0].name}</h3>
                    <p className="text-sm text-zinc-400">{(files[0].size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button onClick={() => setFiles([])} className="text-sm text-emerald-400 hover:text-emerald-300">
                    Change File
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-white mb-2 border-b border-white/10 pb-2">Passwords</h4>
                    <div className="space-y-2">
                      <label className="label">Open Password (Required)</label>
                      <input
                        type="password"
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        placeholder="Password required to open file"
                        className="input-field"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="label">Permissions Password (Optional)</label>
                      <input
                        type="password"
                        value={ownerPassword}
                        onChange={(e) => setOwnerPassword(e.target.value)}
                        placeholder="Password required to change permissions"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-white mb-2 border-b border-white/10 pb-2">Permissions</h4>
                    {[
                      { id: "print", label: "Allow Printing", state: allowPrint, set: setAllowPrint },
                      { id: "copy", label: "Allow Copying", state: allowCopy, set: setAllowCopy },
                      { id: "edit", label: "Allow Editing", state: allowEdit, set: setAllowEdit },
                      { id: "annotate", label: "Allow Annotations", state: allowAnnotate, set: setAllowAnnotate },
                    ].map((perm) => (
                      <div key={perm.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <label htmlFor={perm.id} className="text-sm text-zinc-300">
                          {perm.label}
                        </label>
                        <input
                          type="checkbox"
                          id={perm.id}
                          checked={perm.state}
                          onChange={(e) => perm.set(e.target.checked)}
                          className="w-4 h-4 rounded bg-white/5 border-white/20 text-emerald-500 focus:ring-emerald-500/50"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button onClick={handleStartProtect} className="btn-primary w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25 hover:shadow-emerald-500/40">
                    Encrypt PDF
                  </button>
                </div>
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
                setUserPassword("");
              }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
