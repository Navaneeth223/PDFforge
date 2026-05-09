import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const getBaseUrl = () => API_BASE_URL;

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 300000, // 5 minutes for large files
  headers: {
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.error?.message ||
      error?.message ||
      'Unknown error occurred';
    return Promise.reject(new Error(message));
  }
);

// ─── PDF Tool API Functions ──────────────────────────────────────────

export const pdfApi = {
  // Merge
  merge: (files: File[]) => {
    const form = new FormData();
    files.forEach(f => form.append('files', f));
    return apiClient.post('/pdf/merge', form, { responseType: 'blob' });
  },

  // Split
  split: (file: File, mode: string, ranges: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('mode', mode);
    form.append('ranges', ranges);
    return apiClient.post('/pdf/split', form, { responseType: 'blob' });
  },

  // Compress
  compress: (file: File, level: 'low' | 'medium' | 'high') => {
    const form = new FormData();
    form.append('file', file);
    form.append('level', level);
    return apiClient.post('/pdf/compress', form, { responseType: 'blob' });
  },

  // Rotate
  rotate: (file: File, angle: number, pages: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('angle', String(angle));
    form.append('pages', pages);
    return apiClient.post('/pdf/rotate', form, { responseType: 'blob' });
  },

  // Add page numbers
  addPageNumbers: (file: File, options: any) => {
    const form = new FormData();
    form.append('file', file);
    Object.entries(options).forEach(([k, v]) => form.append(k, String(v)));
    return apiClient.post('/pdf/page-numbers', form, { responseType: 'blob' });
  },

  // Watermark
  watermark: (file: File, options: any) => {
    const form = new FormData();
    form.append('file', file);
    Object.entries(options).forEach(([k, v]) => form.append(k, String(v)));
    return apiClient.post('/pdf/watermark', form, { responseType: 'blob' });
  },

  // Protect
  protect: (file: File, password: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('password', password);
    return apiClient.post('/pdf/protect', form, { responseType: 'blob' });
  },

  // Unlock
  unlock: (file: File, password: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('password', password);
    return apiClient.post('/pdf/unlock', form, { responseType: 'blob' });
  },

  // Extract pages
  extractPages: (file: File, pages: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('pages', pages);
    return apiClient.post('/pdf/extract-pages', form, { responseType: 'blob' });
  },

  // OCR (Usually a job)
  ocr: (file: File, language: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('language', language);
    return apiClient.post('/pdf/ocr', form);
  },
};

// ─── Legacy/Compatibility Export ──────────────────────────────────
export const apiUpload = async (endpoint: string, formData: FormData) => {
  // Try to determine if we should expect a blob or JSON
  const isDirectTool = endpoint.includes('rotate') || 
                       endpoint.includes('compress') || 
                       endpoint.includes('page-numbers') ||
                       endpoint.includes('merge') ||
                       endpoint.includes('split') ||
                       endpoint.includes('watermark') ||
                       endpoint.includes('protect') ||
                       endpoint.includes('unlock');

  const config = isDirectTool ? { responseType: 'blob' as const } : {};
  
  // Clean up endpoint prefix if it's missing /api/v1/pdf
  let url = endpoint;
  if (!url.startsWith('/api/v1')) {
    if (url.startsWith('/pdf/')) url = `/api/v1${url}`;
    else if (url.startsWith('/')) url = `/api/v1/pdf${url}`;
    else url = `/api/v1/pdf/${url}`;
  }

  return apiClient.post(url, formData, config);
};

// ─── Download Helper ─────────────────────────────────────────────

export function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
