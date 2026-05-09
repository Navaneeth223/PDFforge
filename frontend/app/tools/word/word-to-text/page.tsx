"use client";

import { ToolPage } from "@/components/layout/ToolPage";
import { FileText } from "lucide-react";

export default function WordToTextPage() {
  return (
    <ToolPage
      title="Word to Text"
      description="Extract raw text from Word documents."
      icon={FileText}
      endpoint="/word/to-text"
      accept={{
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
        "application/msword": [".doc"]
      }}
      buttonText="Convert to Text"
      category="Word"
    />
  );
}
