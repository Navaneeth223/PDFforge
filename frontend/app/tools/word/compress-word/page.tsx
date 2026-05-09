"use client";

import { ToolPage } from "@/components/layout/ToolPage";
import { Minimize2 } from "lucide-react";

export default function CompressWordPage() {
  return (
    <ToolPage
      title="Compress Word Document"
      description="Reduce the file size of your Word documents."
      icon={Minimize2}
      endpoint="/word/compress"
      accept={{
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
        "application/msword": [".doc"]
      }}
      buttonText="Compress Document"
      category="Word"
    />
  );
}
