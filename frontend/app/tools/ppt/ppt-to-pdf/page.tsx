"use client";

import { ToolPage } from "@/components/layout/ToolPage";
import { Presentation } from "lucide-react";

export default function PptToPdfPage() {
  return (
    <ToolPage
      title="PowerPoint to PDF"
      description="Convert your presentations to high-quality PDF slides. Supports .pptx format."
      icon={Presentation}
      category="PowerPoint Tool"
      endpoint="/ppt/to-pdf"
      buttonText="Convert to PDF"
      accept={{
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      }}
    />
  );
}
