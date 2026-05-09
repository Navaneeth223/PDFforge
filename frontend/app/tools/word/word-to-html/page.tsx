"use client";

import { ToolPage } from "@/components/layout/ToolPage";
import { Globe } from "lucide-react";

export default function WordToHtmlPage() {
  return (
    <ToolPage
      title="Word to HTML"
      description="Convert your Word documents to clean, semantic HTML code."
      icon={Globe}
      category="Word Tool"
      endpoint="/word/to-html"
      buttonText="Convert to HTML"
      accept={{
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      }}
    />
  );
}
