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

    const saveState = () => {
      const store = useEditorStore.getState();
      if (store.isHistoryUpdating) return;
      store.saveHistory(JSON.stringify(fabricCanvas.toJSON()));
    };

    fabricCanvas.on('object:modified', saveState);
    fabricCanvas.on('object:added', saveState);
    fabricCanvas.on('object:removed', saveState);

    // Grid Snapping
    fabricCanvas.on('object:moving', (options) => {
      if (useEditorStore.getState().showGrid) {
        const grid = 50;
        options.target!.set({
          left: Math.round(options.target!.left! / grid) * grid,
          top: Math.round(options.target!.top! / grid) * grid
        });
      }
    });

    // Keydown listener for delete
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObjects = fabricCanvas.getActiveObjects();
        if (activeObjects.length) {
          const isTextEditing = activeObjects.some(obj => (obj as any).isEditing);
          if (!isTextEditing) {
            fabricCanvas.remove(...activeObjects);
            fabricCanvas.discardActiveObject();
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);

    // Initial state
    setTimeout(() => saveState(), 100);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      fabricCanvas.dispose();
      setCanvas(null);
    };
  }, [setCanvas, setSelectedObjects]);

  // Handle Grid
  useEffect(() => {
    const canvas = useEditorStore.getState().canvas;
    if (!canvas) return;

    if (showGrid) {
      const grid = 50;
      const width = canvas.width || 800;
      const height = canvas.height || 1100;
      
      const lines = [];
      for (let i = 0; i < (width / grid); i++) {
        lines.push(new fabric.Line([i * grid, 0, i * grid, height], { 
          stroke: '#e5e7eb', 
          selectable: false, 
          evented: false, 
          opacity: 0.5 
        }));
      }
      for (let i = 0; i < (height / grid); i++) {
        lines.push(new fabric.Line([0, i * grid, width, i * grid], { 
          stroke: '#e5e7eb', 
          selectable: false, 
          evented: false, 
          opacity: 0.5 
        }));
      }
      const gridGroup = new fabric.Group(lines, { 
        selectable: false, 
        evented: false,
        name: 'grid'
      });
      canvas.add(gridGroup);
      canvas.sendToBack(gridGroup);
    } else {
      const objects = canvas.getObjects();
      const grid = objects.find(obj => (obj as any).name === 'grid');
      if (grid) canvas.remove(grid);
    }
    canvas.renderAll();
  }, [showGrid]);

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
  }, [activeTool]);

  return (
    <div className="relative flex-1 bg-zinc-900 overflow-auto p-12 flex justify-center items-start scrollbar-hide">
      <div className="relative shadow-2xl shadow-black/50 ring-1 ring-white/10 bg-white">
        {/* Persistent Page Margin visual (unselectable, just a visual guide) */}
        <div className="absolute inset-8 border border-dashed border-zinc-300 pointer-events-none z-0 opacity-50" />
        <canvas ref={canvasRef} className="relative z-10" />
      </div>
    </div>
  );
}
