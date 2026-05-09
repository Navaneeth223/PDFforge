"use client";

import { ToolPage } from "@/components/layout/ToolPage";
import { Copy } from "lucide-react";

export default function MergeWordPage() {
  return (
    <ToolPage
      title="Merge Word"
      description="Combine multiple .docx files into a single document."
      icon={Copy}
      category="Word Tool"
      endpoint="/word/merge"
      buttonText="Merge Documents"
      multiple={true}
      accept={{
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      }}
    />
  );
}
