"use client";

import { useEditorStore } from "@/store/editorStore";
import { useState, useEffect } from "react";
import { fabric } from "fabric";

export default function PropertiesPanel() {
  const { canvas, selectedObjects, activeTool } = useEditorStore();
  const [fillColor, setFillColor] = useState("#000000");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [fontSize, setFontSize] = useState(24);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushWidth, setBrushWidth] = useState(5);

  const activeObj = selectedObjects[0];

  useEffect(() => {
    if (activeObj) {
      setFillColor((activeObj.fill as string) || "#000000");
      setStrokeColor((activeObj.stroke as string) || "#000000");
      setStrokeWidth(activeObj.strokeWidth || 0);
      if (activeObj.type === "i-text" || activeObj.type === "text") {
        setFontSize((activeObj as fabric.IText).fontSize || 24);
      }
    }
  }, [activeObj]);

  if (!activeObj && activeTool !== "pen") {
    return (
      <div className="w-64 bg-zinc-950 border-l border-white/5 p-6 flex flex-col z-20">
        <h3 className="text-white font-bold mb-4">Properties</h3>
        <p className="text-sm text-zinc-500">Select an object to edit its properties.</p>
      </div>
    );
  }

  if (activeTool === "pen" && !activeObj) {
    return (
      <div className="w-64 bg-zinc-950 border-l border-white/5 p-6 flex flex-col z-20 overflow-y-auto">
        <h3 className="text-white font-bold mb-6">Drawing Brush</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Brush Color</label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={brushColor}
                onChange={(e) => {
                  const val = e.target.value;
                  setBrushColor(val);
                  if (canvas && canvas.freeDrawingBrush) {
                    canvas.freeDrawingBrush.color = val;
                  }
                }}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
              />
              <span className="text-sm text-white font-mono">{brushColor}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Brush Size</label>
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={brushWidth}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setBrushWidth(val);
                if (canvas && canvas.freeDrawingBrush) {
                  canvas.freeDrawingBrush.width = val;
                }
              }}
              className="w-full accent-indigo-500"
            />
            <div className="text-right text-xs text-zinc-500">{brushWidth}px</div>
          </div>
        </div>
      </div>
    );
  }

  const updateProperty = (key: string, value: any) => {
    if (!canvas || !activeObj) return;
    activeObj.set(key, value);
    canvas.renderAll();
  };

  const isText = activeObj.type === "i-text" || activeObj.type === "text";

  return (
    <div className="w-64 bg-zinc-950 border-l border-white/5 p-6 flex flex-col z-20 overflow-y-auto">
      <h3 className="text-white font-bold mb-6">Properties</h3>
      
      <div className="space-y-6">
        {/* Fill Color */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Fill Color</label>
          <div className="flex items-center gap-2">
            <input 
              type="color" 
              value={fillColor}
              onChange={(e) => {
                setFillColor(e.target.value);
                updateProperty("fill", e.target.value);
              }}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
            />
            <span className="text-sm text-white font-mono">{fillColor}</span>
          </div>
        </div>

        {/* Stroke Color */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Border Color</label>
          <div className="flex items-center gap-2">
            <input 
              type="color" 
              value={strokeColor}
              onChange={(e) => {
                setStrokeColor(e.target.value);
                updateProperty("stroke", e.target.value);
              }}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
            />
            <span className="text-sm text-white font-mono">{strokeColor}</span>
          </div>
        </div>

        {/* Border Size */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Border Size</label>
          <input 
            type="range" 
            min="0" 
            max="20" 
            value={strokeWidth}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setStrokeWidth(val);
              updateProperty("strokeWidth", val);
            }}
            className="w-full accent-indigo-500"
          />
          <div className="text-right text-xs text-zinc-500">{strokeWidth}px</div>
        </div>

        {/* Text specific */}
        {isText && (
          <div className="space-y-2 pt-4 border-t border-white/10">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Font Size</label>
            <input 
              type="number" 
              value={fontSize}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setFontSize(val);
                updateProperty("fontSize", val);
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* Dimensions */}
        <div className="space-y-2 pt-4 border-t border-white/10">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Dimensions</label>
          <div className="grid grid-cols-2 gap-2 text-sm text-zinc-400">
            <div>
              <span className="text-zinc-600 mr-2">W</span>
              {Math.round((activeObj.width || 0) * (activeObj.scaleX || 1))}
            </div>
            <div>
              <span className="text-zinc-600 mr-2">H</span>
              {Math.round((activeObj.height || 0) * (activeObj.scaleY || 1))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
