"use client";

import { ToolPage } from "@/components/layout/ToolPage";
import { Copy } from "lucide-react";

export default function MergeExcelPage() {
  return (
    <ToolPage
      title="Merge Excel"
      description="Combine multiple Excel spreadsheets into a single workbook."
      icon={Copy}
      endpoint="/excel/merge"
      accept={{
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
        "application/vnd.ms-excel": [".xls"]
      }}
      multiple={true}
      buttonText="Merge Sheets"
      category="Excel"
    />
  );
}
