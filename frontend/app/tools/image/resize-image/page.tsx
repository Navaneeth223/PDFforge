"use client";

import { useState } from "react";
import { ToolPage } from "@/components/layout/ToolPage";
import { Crop } from "lucide-react";

export default function ResizeImagePage() {
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);

  return (
    <ToolPage
      title="Resize Image"
      description="Change image dimensions while maintaining quality."
      icon={Crop}
      category="Image Tool"
      endpoint="/image/resize"
      buttonText="Resize Image"
      accept={{
        "image/png": [".png"],
        "image/jpeg": [".jpg", ".jpeg"],
      }}
      extraFields={(formData) => {
        formData.append("width", width.toString());
        formData.append("height", height.toString());
      }}
      renderOptions={() => (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Width (px)</label>
            <input 
              type="number" 
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Height (px)</label>
            <input 
              type="number" 
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>
      )}
    />
  );
}
