"use client";

import { ToolPage } from "@/components/layout/ToolPage";
import { Copy } from "lucide-react";

export default function MergePptPage() {
  return (
    <ToolPage
      title="Merge PowerPoint"
      description="Combine multiple PowerPoint presentations into a single file."
      icon={Copy}
      endpoint="/ppt/merge"
      accept={{
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
        "application/vnd.ms-powerpoint": [".ppt"]
      }}
      multiple={true}
      buttonText="Merge Presentations"
      category="PPT"
    />
  );
}
