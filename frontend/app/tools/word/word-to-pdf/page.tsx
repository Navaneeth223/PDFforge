"use client";

import { ToolPage } from "@/components/layout/ToolPage";
import { FileText } from "lucide-react";

export default function WordToPdfPage() {
  return (
    <ToolPage
      title="Word to PDF"
      description="Convert your Microsoft Word documents to high-quality PDF files instantly. Supports .docx format."
      icon={FileText}
      category="Word Tool"
      endpoint="/word/to-pdf"
      buttonText="Convert to PDF"
      accept={{
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      }}
    />
  );
}
