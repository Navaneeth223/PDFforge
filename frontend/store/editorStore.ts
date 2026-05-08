import { create } from 'zustand';
import { fabric } from 'fabric';

export type ToolType = 'select' | 'text' | 'rect' | 'circle' | 'pen' | 'image' | 'arrow' | 'line';

interface PageData {
  imageBase64: string;
  width: number;
  height: number;
  pageNumber: number;
}

interface EditorState {
  canvas: fabric.Canvas | null;
  zoom: number;
  showGrid: boolean;
  activeTool: ToolType;
  pages: PageData[];
  currentPageIndex: number;
  selectedObjects: fabric.Object[];
  
  // Actions
  setCanvas: (canvas: fabric.Canvas | null) => void;
  setTool: (tool: ToolType) => void;
  setPages: (pages: PageData[]) => void;
  setCurrentPageIndex: (index: number) => void;
  setZoom: (zoom: number) => void;
  setSelectedObjects: (objects: fabric.Object[]) => void;
  toggleGrid: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  canvas: null,
  zoom: 1,
  showGrid: false,
  activeTool: 'select',
  pages: [],
  currentPageIndex: 0,
  selectedObjects: [],

  setCanvas: (canvas) => set({ canvas }),
  setTool: (activeTool) => set({ activeTool }),
  setPages: (pages) => set({ pages }),
  setCurrentPageIndex: (currentPageIndex) => set({ currentPageIndex }),
  setZoom: (zoom) => set({ zoom }),
  setSelectedObjects: (selectedObjects) => set({ selectedObjects }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
}));
