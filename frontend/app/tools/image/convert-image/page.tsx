"use client";

import { ToolPage } from "@/components/layout/ToolPage";
import { Image as ImageIcon } from "lucide-react";
import { useState } from "react";

export default function ConvertImagePage() {
  const [targetFormat, setTargetFormat] = useState("png");

  return (
    <ToolPage
      title="Convert Image"
      description="Convert images to JPG, PNG, WEBP, or other formats."
      icon={ImageIcon}
      endpoint="/image/convert"
      accept={{
        "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".tiff"]
      }}
      buttonText={`Convert to ${targetFormat.toUpperCase()}`}
      category="Image"
      extraFields={(formData) => {
        formData.append("target_format", targetFormat);
      }}
      renderOptions={() => (
        <div className="space-y-4">
          <label className="label text-white block mb-2 font-semibold">Target Format</label>
          <div className="grid grid-cols-3 gap-4">
            {["png", "jpg", "webp"].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setTargetFormat(fmt)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  targetFormat === fmt
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-300 ring-2 ring-indigo-500/20"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
                }`}
              >
                <div className="font-bold uppercase text-white">{fmt}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    />
  );
}
