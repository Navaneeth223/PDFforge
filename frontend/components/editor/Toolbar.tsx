"use client";

import { 
  MousePointer2, Type, Square, Circle, 
  Pencil, Image as ImageIcon, ArrowUpRight, 
  Minus, Scissors, Eraser, Grid3X3, ZoomIn, ZoomOut
} from "lucide-react";
import { useEditorStore, ToolType } from "@/store/editorStore";

const TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'rect', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'pen', icon: Pencil, label: 'Draw' },
  { id: 'image', icon: ImageIcon, label: 'Image' },
  { id: 'arrow', icon: ArrowUpRight, label: 'Arrow' },
];

export default function Toolbar() {
  const { activeTool, setTool, toggleGrid, showGrid } = useEditorStore();

  return (
    <div className="w-16 bg-zinc-950 border-r border-white/5 flex flex-col items-center py-6 gap-4 z-20">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setTool(tool.id as ToolType)}
          className={`p-3 rounded-xl transition-all group relative ${
            activeTool === tool.id 
              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
              : "text-zinc-500 hover:text-white hover:bg-white/5"
          }`}
          title={tool.label}
        >
          <tool.icon className="w-5 h-5" />
          <span className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/5">
            {tool.label}
          </span>
        </button>
      ))}

      <div className="mt-auto flex flex-col gap-4">
        <button 
          onClick={toggleGrid}
          className={`p-3 rounded-xl transition-all ${showGrid ? "text-indigo-400 bg-indigo-500/10" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
        >
          <Grid3X3 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
