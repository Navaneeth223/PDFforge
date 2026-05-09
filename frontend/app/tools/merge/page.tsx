"use client";

import { ToolPage } from "@/components/layout/ToolPage";
import { Layers } from "lucide-react";

export default function MergeToolPage() {
  return (
    <ToolPage
      title="Merge PDFs"
      description="Combine multiple PDF files into one in the order you want. Free, fast, and completely secure."
      icon={Layers}
      category="PDF Tool"
      endpoint="/tools/merge"
      buttonText="Merge PDFs"
      multiple={true}
      accept={{ "application/pdf": [".pdf"] }}
    />
  );
}
