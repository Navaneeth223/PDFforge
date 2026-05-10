import { useState } from 'react';
import { downloadFile } from '@/lib/api';
import { toast } from 'sonner';

type SubmitState = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

export function useToolSubmit() {
  const [state, setState] = useState<SubmitState>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);

  const submit = async (
    apiCall: () => Promise<any>,
    outputFilename: string,
  ) => {
    setState('uploading');
    setProgress(10);
    setJobId(null);

    try {
      setState('processing');
      setProgress(40);

      const response = await apiCall();
      setProgress(90);

      // 1. Direct file response (blob)
      if (response.data instanceof Blob || response.headers['content-type']?.includes('application/pdf')) {
        const blob = response.data instanceof Blob ? response.data : new Blob([response.data as any], { type: 'application/pdf' });
        downloadFile(blob, outputFilename);
        setProgress(100);
        setState('done');
        toast.success('Done! Your file is downloading.');
        return;
      }

      // 2. Job-based response
      if (response.data?.job_id) {
        setJobId(response.data.job_id);
        setState('processing');
        // The component will handle the JobProgress/SSE from here
        return;
      }

      throw new Error('Unexpected response format from server.');
    } catch (err: any) {
      console.error("[Submit Error]", err);
      setState('error');
      const msg = err.message || 'Something went wrong. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  const reset = () => {
    setState('idle');
    setProgress(0);
    setErrorMessage('');
    setJobId(null);
  };

  return { state, progress, errorMessage, jobId, submit, reset };
}
