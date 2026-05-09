"use client";

import { ToolPage } from "@/components/layout/ToolPage";
import { FileJson } from "lucide-react";

export default function ExcelToJsonPage() {
  return (
    <ToolPage
      title="Excel to JSON"
      description="Convert your Excel spreadsheets to JSON data for easy API consumption."
      icon={FileJson}
      endpoint="/excel/to-json"
      accept={{
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
        "application/vnd.ms-excel": [".xls"]
      }}
      buttonText="Convert to JSON"
      category="Excel"
    />
  );
}
