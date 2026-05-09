import { 
  FileText, Layers, Scissors, Minimize2, 
  Lock, ShieldAlert, PenTool, Image as ImageIcon,
  Zap, LockKeyhole, Github, ArrowRight,
  RotateCw, Copy, Globe, Table, Presentation,
  Images, Type, Stamp, Hash, Unlock,
  ScanText, ImagePlus, FileSearch, Wrench,
  GitCompare, Crop, Briefcase, Search, X
} from "lucide-react";

export const ALL_TOOLS = [
  // PDF
  { name: "Merge PDFs", desc: "Combine multiple PDFs into one", icon: Layers, href: "/tools/merge", color: "text-blue-500", bg: "bg-blue-500/10", category: "PDF" },
  { name: "Split PDF", desc: "Extract pages or split into multiple files", icon: Scissors, href: "/tools/split", color: "text-indigo-500", bg: "bg-indigo-500/10", category: "PDF" },
  { name: "Compress", desc: "Reduce file size without losing quality", icon: Minimize2, href: "/tools/compress", color: "text-purple-500", bg: "bg-purple-500/10", category: "PDF" },
  { name: "Sign PDF", desc: "Add electronic signatures", icon: PenTool, href: "/tools/sign", color: "text-yellow-500", bg: "bg-yellow-500/10", category: "PDF" },
  { name: "OCR PDF", desc: "Make scanned PDFs searchable", icon: ScanText, href: "/tools/ocr", color: "text-yellow-600", bg: "bg-yellow-600/10", category: "PDF" },

  // Word
  { name: "Word to PDF", desc: "Convert .docx to high-quality PDF", icon: FileText, href: "/tools/word/word-to-pdf", color: "text-blue-400", bg: "bg-blue-400/10", category: "Word" },
  { name: "Word to HTML", desc: "Convert Word documents to clean HTML", icon: Globe, href: "/tools/word/word-to-html", color: "text-orange-400", bg: "bg-orange-400/10", category: "Word" },
  { name: "Merge Word", desc: "Combine multiple .docx files", icon: Copy, href: "/tools/word/merge-word", color: "text-indigo-400", bg: "bg-indigo-400/10", category: "Word" },
  { name: "Word Compress", desc: "Reduce Word file size", icon: Minimize2, href: "/tools/word/compress-word", color: "text-purple-400", bg: "bg-purple-400/10", category: "Word" },

  // Excel
  { name: "Excel to PDF", desc: "Convert spreadsheets to PDF", icon: Table, href: "/tools/excel/excel-to-pdf", color: "text-green-500", bg: "bg-green-500/10", category: "Excel" },
  { name: "Excel to CSV", desc: "Convert .xlsx to CSV format", icon: FileText, href: "/tools/excel/excel-to-csv", color: "text-emerald-500", bg: "bg-emerald-500/10", category: "Excel" },
  { name: "Merge Excel", desc: "Combine multiple sheets into one", icon: Layers, href: "/tools/excel/merge-excel", color: "text-teal-500", bg: "bg-teal-500/10", category: "Excel" },

  // PowerPoint
  { name: "PPT to PDF", desc: "Convert presentations to PDF", icon: Presentation, href: "/tools/ppt/ppt-to-pdf", color: "text-red-500", bg: "bg-red-500/10", category: "PowerPoint" },
  { name: "PPT to Images", desc: "Convert slides to high-res PNGs", icon: Images, href: "/tools/ppt/ppt-to-images", color: "text-rose-500", bg: "bg-rose-500/10", category: "PowerPoint" },
  { name: "PPT to Video", desc: "Convert slideshow to MP4 video", icon: Zap, href: "/tools/ppt/ppt-to-video", color: "text-amber-500", bg: "bg-amber-500/10", category: "PowerPoint" },

  // Image
  { name: "Images to PDF", desc: "Convert JPG/PNG to PDF format", icon: ImageIcon, href: "/tools/image/images-to-pdf", color: "text-pink-500", bg: "bg-pink-500/10", category: "Images" },
  { name: "Remove BG", desc: "AI-powered background removal", icon: Scissors, href: "/tools/image/remove-bg", color: "text-violet-500", bg: "bg-violet-500/10", category: "Images" },
  { name: "Resize Image", desc: "Change image dimensions", icon: Crop, href: "/tools/image/resize-image", color: "text-sky-500", bg: "bg-sky-500/10", category: "Images" },

  // Convert
  { name: "Smart Converter", desc: "Convert anything to anything", icon: Zap, href: "/tools/convert", color: "text-yellow-400", bg: "bg-yellow-400/10", category: "Convert" },
];
