"use client";

import { useEffect, useRef } from "react";
import { fabric } from "fabric";
import { useEditorStore } from "@/store/editorStore";

export default function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    setCanvas, 
    pages, 
    currentPageIndex, 
    zoom, 
    showGrid, 
    activeTool,
    setSelectedObjects 
  } = useEditorStore();

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 1100,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });

    setCanvas(fabricCanvas);

    // Event listeners
    fabricCanvas.on("selection:created", (e) => setSelectedObjects(e.selected || []));
    fabricCanvas.on("selection:updated", (e) => setSelectedObjects(e.selected || []));
    fabricCanvas.on("selection:cleared", () => setSelectedObjects([]));

    return () => {
      fabricCanvas.dispose();
      setCanvas(null);
    };
  }, [setCanvas, setSelectedObjects]);

  // Handle page change
  useEffect(() => {
    const canvas = useEditorStore.getState().canvas;
    if (!canvas || !pages[currentPageIndex]) return;

    const page = pages[currentPageIndex];
    fabric.Image.fromURL(page.imageBase64, (img) => {
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
        scaleX: canvas.width! / img.width!,
        scaleY: canvas.height! / img.height!,
      });
    });
  }, [pages, currentPageIndex]);

  // Handle Tool Change
  useEffect(() => {
    const canvas = useEditorStore.getState().canvas;
    if (!canvas) return;

    canvas.isDrawingMode = activeTool === "pen";
    if (canvas.isDrawingMode) {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.width = 5;
      canvas.freeDrawingBrush.color = "#000000";
    }

    // Keydown listener for delete
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length) {
          // Check if we are currently editing text so we don't delete the whole object
          const isTextEditing = activeObjects.some(obj => (obj as any).isEditing);
          if (!isTextEditing) {
            canvas.remove(...activeObjects);
            canvas.discardActiveObject();
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTool]);

  return (
    <div className="relative flex-1 bg-zinc-900 overflow-auto p-12 flex justify-center items-start scrollbar-hide">
      <div className="shadow-2xl shadow-black/50 ring-1 ring-white/10">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
