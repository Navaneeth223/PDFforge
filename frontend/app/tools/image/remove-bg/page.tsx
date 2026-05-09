"use client";

import { ToolPage } from "@/components/layout/ToolPage";
import { Scissors } from "lucide-react";

export default function RemoveBgPage() {
  return (
    <ToolPage
      title="Remove Background"
      description="Remove image backgrounds instantly using AI. Best for portraits and product photos."
      icon={Scissors}
      category="Image Tool"
      endpoint="/image/remove-bg"
      buttonText="Remove Background"
      accept={{
        "image/png": [".png"],
        "image/jpeg": [".jpg", ".jpeg"],
      }}
    />
  );
}
