"use client";

import { ToolPage } from "@/components/layout/ToolPage";
import { FileText } from "lucide-react";

export default function ExcelToCsvPage() {
  return (
    <ToolPage
      title="Excel to CSV"
      description="Convert Excel spreadsheets to comma-separated values (CSV) files."
      icon={FileText}
      category="Excel Tool"
      endpoint="/excel/to-csv"
      buttonText="Convert to CSV"
      accept={{
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      }}
    />
  );
}
