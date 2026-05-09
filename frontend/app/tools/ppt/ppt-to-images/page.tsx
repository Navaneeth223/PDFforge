"use client";

import { ToolPage } from "@/components/layout/ToolPage";
import { Images } from "lucide-react";

export default function PptToImagesPage() {
  return (
    <ToolPage
      title="PPT to Images"
      description="Convert presentation slides to high-quality PNG images (bundled in a .zip file)."
      icon={Images}
      category="PowerPoint Tool"
      endpoint="/ppt/to-images"
      buttonText="Extract Images"
      accept={{
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      }}
    />
  );
}
