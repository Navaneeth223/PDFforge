"use client";

import { ToolPage } from "@/components/layout/ToolPage";
import { Minimize2 } from "lucide-react";

export default function CompressImagePage() {
  return (
    <ToolPage
      title="Compress Image"
      description="Reduce image file sizes without losing quality."
      icon={Minimize2}
      endpoint="/image/compress"
      accept={{
        "image/png": [".png"],
        "image/jpeg": [".jpg", ".jpeg"],
        "image/webp": [".webp"]
      }}
      buttonText="Compress Image"
      category="Image"
    />
  );
}
