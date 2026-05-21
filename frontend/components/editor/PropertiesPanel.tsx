"use client";
 
import { useEditorStore } from "@/store/editorStore";
import { useState, useEffect } from "react";
import { fabric } from "fabric";
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Copy, Layers, ArrowUp, ArrowDown, MoveUp, MoveDown
} from "lucide-react";

export default function PropertiesPanel() {
  const { canvas, selectedObjects, activeTool } = useEditorStore();
  const [fillColor, setFillColor] = useState("#000000");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [fontSize, setFontSize] = useState(24);
  const [fontWeight, setFontWeight] = useState("normal");
  const [fontStyle, setFontStyle] = useState("normal");
  const [underline, setUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState("left");
  const [fontFamily, setFontFamily] = useState("sans-serif");
  
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushWidth, setBrushWidth] = useState(5);

  const activeObj = selectedObjects[0];

  useEffect(() => {
    if (activeObj) {
      setFillColor((activeObj.fill as string) || "#000000");
      setStrokeColor((activeObj.stroke as string) || "#000000");
      setStrokeWidth(activeObj.strokeWidth || 0);
      setOpacity(activeObj.opacity ?? 1);
      if (activeObj.type === "i-text" || activeObj.type === "text") {
        setFontSize((activeObj as fabric.IText).fontSize || 24);
        setFontWeight((activeObj as fabric.IText).fontWeight || "normal");
        setFontStyle((activeObj as fabric.IText).fontStyle || "normal");
        setUnderline((activeObj as fabric.IText).underline || false);
        setTextAlign((activeObj as fabric.IText).textAlign || "left");
        setFontFamily((activeObj as fabric.IText).fontFamily || "sans-serif");
      }
    }
  }, [activeObj]);

  if (!activeObj && activeTool !== "pen" && activeTool !== "eraser") {
    return (
      <div className="w-64 bg-zinc-950 border-l border-white/5 p-6 flex flex-col z-20">
        <h3 className="text-white font-bold mb-4">Properties</h3>
        <p className="text-sm text-zinc-500">Select an object to edit its properties.</p>
      </div>
    );
  }

  if ((activeTool === "pen" || activeTool === "eraser") && !activeObj) {
    const isEraser = activeTool === "eraser";
    return (
      <div className="w-64 bg-zinc-950 border-l border-white/5 p-6 flex flex-col z-20 overflow-y-auto">
        <h3 className="text-white font-bold mb-6">{isEraser ? "Eraser Size" : "Drawing Brush"}</h3>
        <div className="space-y-6">
          {!isEraser && (
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
          )}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Size</label>
            <input 
              type="range" 
              min="1" 
              max="100" 
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
    (activeObj as any).set(key, value);
    canvas.renderAll();
    
    // Save history state on property edit
    const store = useEditorStore.getState();
    store.saveHistory(JSON.stringify(canvas.toJSON()));
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

        {/* Opacity */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Opacity</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05"
            value={opacity}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setOpacity(val);
              updateProperty("opacity", val);
            }}
            className="w-full accent-indigo-500"
          />
          <div className="text-right text-xs text-zinc-500">{Math.round(opacity * 100)}%</div>
        </div>

        {/* Text specific */}
        {isText && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Font Family</label>
              <select 
                value={fontFamily}
                onChange={(e) => {
                  setFontFamily(e.target.value);
                  updateProperty("fontFamily", e.target.value);
                }}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="sans-serif">Sans-Serif</option>
                <option value="serif">Serif</option>
                <option value="monospace">Monospace</option>
                <option value="cursive">Cursive</option>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
              </select>
            </div>

            <div className="space-y-2">
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

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Text Style</label>
              <div className="flex gap-1">
                <button 
                  onClick={() => {
                    const newVal = fontWeight === "bold" ? "normal" : "bold";
                    setFontWeight(newVal);
                    updateProperty("fontWeight", newVal);
                  }}
                  className={`flex-1 p-2 rounded-lg border transition-all flex items-center justify-center ${
                    fontWeight === "bold" 
                      ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" 
                      : "border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    const newVal = fontStyle === "italic" ? "normal" : "italic";
                    setFontStyle(newVal);
                    updateProperty("fontStyle", newVal);
                  }}
                  className={`flex-1 p-2 rounded-lg border transition-all flex items-center justify-center ${
                    fontStyle === "italic" 
                      ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" 
                      : "border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    const newVal = !underline;
                    setUnderline(newVal);
                    updateProperty("underline", newVal);
                  }}
                  className={`flex-1 p-2 rounded-lg border transition-all flex items-center justify-center ${
                    underline 
                      ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" 
                      : "border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Underline className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Alignment</label>
              <div className="flex gap-1">
                {(["left", "center", "right"] as const).map((align) => (
                  <button 
                    key={align}
                    onClick={() => {
                      setTextAlign(align);
                      updateProperty("textAlign", align);
                    }}
                    className={`flex-1 p-2 rounded-lg border transition-all flex items-center justify-center ${
                      textAlign === align 
                        ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" 
                        : "border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {align === "left" && <AlignLeft className="w-4 h-4" />}
                    {align === "center" && <AlignCenter className="w-4 h-4" />}
                    {align === "right" && <AlignRight className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Arrangement & Layering */}
        <div className="space-y-2 pt-4 border-t border-white/10">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Arrangement
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button 
              onClick={() => {
                if (!canvas || !activeObj) return;
                canvas.bringToFront(activeObj);
                canvas.renderAll();
              }}
              className="py-2 px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              Bring to Front
            </button>
            <button 
              onClick={() => {
                if (!canvas || !activeObj) return;
                canvas.sendToBack(activeObj);
                // Keep grid at the absolute back
                const gridObj = canvas.getObjects().find(obj => (obj as any).name === 'grid');
                if (gridObj) {
                  canvas.sendToBack(gridObj);
                }
                canvas.renderAll();
              }}
              className="py-2 px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              Send to Back
            </button>
            <button 
              onClick={() => {
                if (!canvas || !activeObj) return;
                canvas.bringForward(activeObj);
                canvas.renderAll();
              }}
              className="py-2 px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              Bring Forward
            </button>
            <button 
              onClick={() => {
                if (!canvas || !activeObj) return;
                canvas.sendBackward(activeObj);
                // Keep grid at the absolute back
                const gridObj = canvas.getObjects().find(obj => (obj as any).name === 'grid');
                if (gridObj) {
                  canvas.sendToBack(gridObj);
                }
                canvas.renderAll();
              }}
              className="py-2 px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              Send Backward
            </button>
          </div>
        </div>

        {/* Duplicate Element */}
        <div className="space-y-2 pt-4 border-t border-white/10">
          <button 
            onClick={() => {
              if (!canvas || !activeObj) return;
              activeObj.clone((cloned: any) => {
                canvas.discardActiveObject();
                cloned.set({
                  left: cloned.left + 25,
                  top: cloned.top + 25,
                  evented: true,
                });
                if (cloned.type === 'activeSelection') {
                  cloned.canvas = canvas;
                  cloned.forEachObject((obj: any) => {
                    canvas.add(obj);
                  });
                  cloned.setCoords();
                } else {
                  canvas.add(cloned);
                }
                canvas.setActiveObject(cloned);
                canvas.requestRenderAll();
                
                // Trigger history save
                const store = useEditorStore.getState();
                store.saveHistory(JSON.stringify(canvas.toJSON()));
              });
            }}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/10"
          >
            <Copy className="w-4 h-4" /> Duplicate Element
          </button>
        </div>

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

