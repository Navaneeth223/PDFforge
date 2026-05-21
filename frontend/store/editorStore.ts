import { create } from 'zustand';
import { fabric } from 'fabric';

export type ToolType = 'select' | 'text' | 'rect' | 'circle' | 'pen' | 'image' | 'arrow' | 'line' | 'eraser';

interface PageData {
  imageBase64: string;
  width: number;
  height: number;
  pageNumber: number;
  canvasJson?: string;
}

interface EditorState {
  canvas: fabric.Canvas | null;
  zoom: number;
  showGrid: boolean;
  activeTool: ToolType;
  pages: PageData[];
  currentPageIndex: number;
  selectedObjects: fabric.Object[];
  history: string[];
  historyIndex: number;
  isHistoryUpdating: boolean;
  
  // Actions
  setCanvas: (canvas: fabric.Canvas | null) => void;
  setTool: (tool: ToolType) => void;
  setPages: (pages: PageData[]) => void;
  setCurrentPageIndex: (index: number) => void;
  setZoom: (zoom: number) => void;
  setSelectedObjects: (objects: fabric.Object[]) => void;
  toggleGrid: () => void;
  saveHistory: (state: string) => void;
  saveCurrentPageObjects: () => void;
  undo: () => void;
  redo: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  canvas: null,
  zoom: 1,
  showGrid: false,
  activeTool: 'select',
  pages: [],
  currentPageIndex: 0,
  selectedObjects: [],
  history: [],
  historyIndex: -1,
  isHistoryUpdating: false,

  setCanvas: (canvas) => set({ canvas }),
  setTool: (activeTool) => set({ activeTool }),
  setPages: (pages) => set({ pages }),
  setCurrentPageIndex: (currentPageIndex) => set({ currentPageIndex }),
  setZoom: (zoom) => set({ zoom }),
  setSelectedObjects: (selectedObjects) => set({ selectedObjects }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  saveCurrentPageObjects: () => {
    const { canvas, pages, currentPageIndex } = get();
    if (!canvas) return;
    
    // Temporarily hide grid before saving JSON
    const objects = canvas.getObjects();
    const grid = objects.find(obj => (obj as any).name === 'grid');
    if (grid) {
      canvas.remove(grid);
    }
    
    const json = JSON.stringify(canvas.toJSON());
    
    if (grid) {
      canvas.add(grid);
      canvas.sendToBack(grid);
    }
    
    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...updatedPages[currentPageIndex],
      canvasJson: json
    };
    set({ pages: updatedPages });
  },

  saveHistory: (stateStr) => set((store) => {
    const newHistory = store.history.slice(0, store.historyIndex + 1);
    newHistory.push(stateStr);
    return { history: newHistory, historyIndex: newHistory.length - 1 };
  }),
  undo: () => set((store) => {
    if (store.historyIndex > 0) {
      const newIndex = store.historyIndex - 1;
      const stateStr = store.history[newIndex];
      if (store.canvas) {
        store.isHistoryUpdating = true;
        store.canvas.loadFromJSON(stateStr, () => {
          store.canvas?.renderAll();
          useEditorStore.setState({ isHistoryUpdating: false });
        });
      }
      return { historyIndex: newIndex, isHistoryUpdating: true };
    }
    return store;
  }),
  redo: () => set((store) => {
    if (store.historyIndex < store.history.length - 1) {
      const newIndex = store.historyIndex + 1;
      const stateStr = store.history[newIndex];
      if (store.canvas) {
        store.isHistoryUpdating = true;
        store.canvas.loadFromJSON(stateStr, () => {
          store.canvas?.renderAll();
          useEditorStore.setState({ isHistoryUpdating: false });
        });
      }
      return { historyIndex: newIndex, isHistoryUpdating: true };
    }
    return store;
  }),
}));
