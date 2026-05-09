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
  jobId?: string | null;
  onComplete?: () => void;
  onReset?: () => void;
  customProgress?: number;
  status?: string;
}

export function JobProgress({ jobId, onComplete, onReset, customProgress, status: customStatus }: JobProgressProps) {
  const [status, setStatus] = useState<JobStatus>({
    state: "PENDING",
    progress: customProgress || 0,
    message: customStatus || "Initializing...",
  });

  useEffect(() => {
    if (!jobId) return;

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
        message: "Lost connection to server. Please try again.",
      }));
    };

    return () => {
      eventSource.close();
    };
  }, [jobId, onComplete]);

  // Update status message if custom props change and no jobId
  useEffect(() => {
    if (!jobId && (customProgress !== undefined || customStatus !== undefined)) {
      setStatus(prev => ({
        ...prev,
        progress: customProgress ?? prev.progress,
        message: customStatus ?? prev.message
      }));
    }
  }, [jobId, customProgress, customStatus]);

  const handleDownload = () => {
    if (!jobId) return;
    const url = `${getBaseUrl()}/api/v1/jobs/${jobId}/download`;
    const link = document.createElement("a");
    link.href = url;
    link.download = `result_${jobId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentState = jobId ? status.state : "PROGRESS";
  const currentProgress = jobId ? status.progress : (customProgress ?? status.progress);
  const currentMessage = jobId ? status.message : (customStatus ?? status.message);

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl glass p-8 shadow-2xl">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        {currentState === "PENDING" || currentState === "PROGRESS" ? (
          <>
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                {Math.round(currentProgress)}%
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Processing Document</h3>
              <p className="text-sm text-zinc-400">{currentMessage || "Please wait..."}</p>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${currentProgress}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              />
            </div>
          </>
        ) : currentState === "SUCCESS" ? (
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
              <p className="text-sm text-red-400/80 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {status.message || "An unknown error occurred during processing."}
              </p>
            </div>
            {onReset && (
              <button onClick={onReset} className="btn-primary mt-4 w-full bg-zinc-800 hover:bg-zinc-700">
                Try Again
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
