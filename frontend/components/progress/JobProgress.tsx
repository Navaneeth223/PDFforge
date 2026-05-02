"use client";

import { useEffect, useState } from "react";
import { Loader2, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { getBaseUrl } from "@/lib/api";

interface JobStatus {
  state: "PENDING" | "PROGRESS" | "SUCCESS" | "FAILURE";
  progress: number;
  message: string;
  output_path?: string;
}

interface JobProgressProps {
  jobId: string;
  onComplete?: () => void;
  onReset?: () => void;
}

export function JobProgress({ jobId, onComplete, onReset }: JobProgressProps) {
  const [status, setStatus] = useState<JobStatus>({
    state: "PENDING",
    progress: 0,
    message: "Initializing...",
  });

  useEffect(() => {
    const eventSource = new EventSource(
      `${getBaseUrl()}/api/v1/jobs/${jobId}/status`
    );

    eventSource.onmessage = (event) => {
      try {
        const data: JobStatus = JSON.parse(event.data);
        setStatus(data);

        if (data.state === "SUCCESS" || data.state === "FAILURE") {
          eventSource.close();
          if (data.state === "SUCCESS" && onComplete) {
            onComplete();
          }
        }
      } catch (err) {
        console.error("Failed to parse SSE data", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error", err);
      eventSource.close();
      setStatus((prev) => ({
        ...prev,
        state: "FAILURE",
        message: "Lost connection to server.",
      }));
    };

    return () => {
      eventSource.close();
    };
  }, [jobId, onComplete]);

  const handleDownload = () => {
    const url = `${getBaseUrl()}/api/v1/jobs/${jobId}/download`;
    // Create a temporary link to download the file
    const link = document.createElement("a");
    link.href = url;
    link.download = `result_${jobId}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl glass p-8">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        {status.state === "PENDING" || status.state === "PROGRESS" ? (
          <>
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                {status.progress}%
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Processing Document</h3>
              <p className="text-sm text-zinc-400">{status.message || "Please wait..."}</p>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${status.progress}%` }}
                className="h-full bg-indigo-500 rounded-full"
              />
            </div>
          </>
        ) : status.state === "SUCCESS" ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-green-500/20 p-4 rounded-full"
            >
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Success!</h3>
              <p className="text-sm text-zinc-400">Your document is ready for download.</p>
            </div>
            <div className="flex w-full gap-4 pt-4">
              {onReset && (
                <button onClick={onReset} className="btn-ghost flex-1">
                  Start Over
                </button>
              )}
              <button onClick={handleDownload} className="btn-primary flex-1">
                <Download className="w-5 h-5 mr-2" />
                Download
              </button>
            </div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-red-500/20 p-4 rounded-full"
            >
              <AlertCircle className="w-12 h-12 text-red-500" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Processing Failed</h3>
              <p className="text-sm text-zinc-400">{status.message || "An unknown error occurred."}</p>
            </div>
            {onReset && (
              <button onClick={onReset} className="btn-ghost mt-4 w-full">
                Try Again
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
