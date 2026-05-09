"use client";

import { ToolPage } from "@/components/layout/ToolPage";
import { Video } from "lucide-react";

export default function PptToVideoPage() {
  return (
    <ToolPage
      title="PPT to Video"
      description="Convert your PowerPoint presentations into high-quality videos."
      icon={Video}
      endpoint="/ppt/to-video"
      accept={{
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
        "application/vnd.ms-powerpoint": [".ppt"]
      }}
      buttonText="Convert to Video"
      category="PPT"
    />
  );
}
