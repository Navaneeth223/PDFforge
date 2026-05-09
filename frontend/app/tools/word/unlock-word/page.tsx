"use client";

import { ToolPage } from "@/components/layout/ToolPage";
import { Unlock } from "lucide-react";
import { useState } from "react";

export default function UnlockWordPage() {
  const [password, setPassword] = useState("");

  return (
    <ToolPage
      title="Unlock Word Document"
      description="Remove password protection from Word documents."
      icon={Unlock}
      endpoint="/word/unlock"
      accept={{
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
        "application/msword": [".doc"]
      }}
      buttonText="Unlock Document"
      category="Word"
      extraFields={(formData) => {
        formData.append("password", password);
      }}
      renderOptions={() => (
        <div className="space-y-4">
          <label className="label text-white block mb-2 font-semibold">Document Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter password..." 
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      )}
    />
  );
}
