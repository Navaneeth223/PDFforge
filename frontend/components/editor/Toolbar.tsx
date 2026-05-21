"use client";

import { 
  MousePointer2, Type, Square, Circle, 
  Pencil, Image as ImageIcon, ArrowUpRight, 
  Minus, Scissors, Eraser, Grid3X3, ZoomIn, ZoomOut
} from "lucide-react";
import { useEditorStore, ToolType } from "@/store/editorStore";
import { fabric } from "fabric";

const TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'rect', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'pen', icon: Pencil, label: 'Draw' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
  { id: 'image', icon: ImageIcon, label: 'Image' },
  { id: 'arrow', icon: ArrowUpRight, label: 'Arrow' },
];

export default function Toolbar() {
  const { activeTool, setTool, showGrid, toggleGrid } = useEditorStore();

  const handleToolClick = (toolId: ToolType) => {
    setTool(toolId);
    const canvas = useEditorStore.getState().canvas;
    if (!canvas) return;

    const center = canvas.getCenter();

    if (toolId === 'rect') {
      const rect = new fabric.Rect({
        left: center.left,
        top: center.top,
        fill: '#6366f1',
        width: 150,
        height: 100,
        originX: 'center',
        originY: 'center',
        rx: 8,
        ry: 8
      });
      canvas.add(rect);
      canvas.setActiveObject(rect);
      setTool('select');
    } else if (toolId === 'circle') {
      const circle = new fabric.Circle({
        left: center.left,
        top: center.top,
        fill: '#10b981',
        radius: 60,
        originX: 'center',
        originY: 'center',
      });
      canvas.add(circle);
      canvas.setActiveObject(circle);
      setTool('select');
    } else if (toolId === 'text') {
      const text = new fabric.IText('Type something', {
        left: center.left,
        top: center.top,
        fontFamily: 'sans-serif',
        fill: '#000000',
        fontSize: 32,
        originX: 'center',
        originY: 'center',
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      text.enterEditing();
      text.selectAll();
      setTool('select');
    } else if (toolId === 'arrow') {
      const arrowPath = "M 0 0 L 100 0 M 100 0 L 85 -10 M 100 0 L 85 10";
      const arrow = new fabric.Path(arrowPath, {
        left: center.left,
        top: center.top,
        stroke: '#000000',
        strokeWidth: 4,
        fill: '',
        originX: 'center',
        originY: 'center',
      });
      canvas.add(arrow);
      canvas.setActiveObject(arrow);
      setTool('select');
    } else if (toolId === 'image') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (f) => {
          fabric.Image.fromURL(f.target?.result as string, (img) => {
            img.scaleToWidth(300);
            img.set({
              left: center.left,
              top: center.top,
              originX: 'center',
              originY: 'center',
            });
            canvas.add(img);
            canvas.setActiveObject(img);
            setTool('select');
          });
        };
        reader.readAsDataURL(file);
      };
      input.click();
      setTool('select');
    }
  };

  return (
    <div className="w-16 bg-zinc-950 border-r border-white/5 flex flex-col items-center py-6 gap-4 z-20">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          onClick={() => handleToolClick(tool.id as ToolType)}
          className={`p-3 rounded-xl transition-all group relative ${
            activeTool === tool.id 
              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
              : "text-zinc-500 hover:text-white hover:bg-white/5"
          }`}
          title={tool.label}
        >
          <tool.icon className="w-5 h-5" />
          <span className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/5 z-50">
            {tool.label}
          </span>
        </button>
      ))}

      <div className="h-[1px] w-8 bg-white/5 my-2" />

      <button
        onClick={() => toggleGrid()}
        className={`p-3 rounded-xl transition-all group relative ${
          showGrid
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
            : "text-zinc-500 hover:text-white hover:bg-white/5"
        }`}
        title="Toggle Grid"
      >
        <Grid3X3 className="w-5 h-5" />
        <span className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/5 z-50">
          Toggle Grid
        </span>
      </button>
    </div>
  );
}
