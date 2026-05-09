"use client";

import { ToolPage } from "@/components/layout/ToolPage";
import { Table } from "lucide-react";

export default function ExcelToPdfPage() {
  return (
    <ToolPage
      title="Excel to PDF"
      description="Convert Excel spreadsheets to professional PDF documents. Supports .xlsx format."
      icon={Table}
      category="Excel Tool"
      endpoint="/excel/to-pdf"
      buttonText="Convert to PDF"
      accept={{
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      }}
    />
  );
}
