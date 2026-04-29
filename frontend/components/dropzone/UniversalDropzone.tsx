"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UniversalDropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  maxFiles?: number;
  accept?: Record<string, string[]>;
  title?: string;
  subtitle?: string;
}

export function UniversalDropzone({
  onFilesAccepted,
  maxFiles = 0,
  accept = { "application/pdf": [".pdf"] },
  title = "Drag & drop files here",
  subtitle = "or click to browse from your device",
}: UniversalDropzoneProps) {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      let newFiles = [...files, ...acceptedFiles];
      if (maxFiles > 0 && newFiles.length > maxFiles) {
        newFiles = newFiles.slice(0, maxFiles);
      }
      setFiles(newFiles);
      onFilesAccepted(newFiles);
    },
    [files, maxFiles, onFilesAccepted]
  );

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFilesAccepted(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: maxFiles > 0 ? maxFiles : undefined,
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div
        {...getRootProps()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all duration-300 cursor-pointer overflow-hidden
          ${
            isDragActive
              ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]"
              : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="absolute inset-0 noise-overlay pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className={`p-4 rounded-full mb-4 transition-colors duration-300 ${isDragActive ? 'bg-indigo-500/20' : 'bg-white/5'}`}>
            <UploadCloud className={`h-10 w-10 ${isDragActive ? 'text-indigo-400' : 'text-zinc-400'}`} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-zinc-400">{subtitle}</p>
        </div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-2"
          >
            {files.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 glass"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-500/20 p-2">
                    <FileIcon className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200 line-clamp-1">{file.name}</p>
                    <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
