"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical, Trash2 } from "lucide-react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PageItem {
  id: string;
  originalIndex: number;
}

interface PDFPageThumbnailsProps {
  file: File | string;
  onOrderChange?: (newOrder: number[]) => void;
  onSelectionChange?: (selectedPages: number[]) => void;
  selectable?: boolean;
  reorderable?: boolean;
  deletable?: boolean;
}

function SortablePageItem({
  page,
  file,
  selected,
  onToggleSelect,
  onDelete,
  selectable,
  reorderable,
  deletable,
}: {
  page: PageItem;
  file: File | string;
  selected: boolean;
  onToggleSelect?: (index: number) => void;
  onDelete?: (index: number) => void;
  selectable?: boolean;
  reorderable?: boolean;
  deletable?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-card border rounded-xl overflow-hidden shadow-sm transition-all ${
        isDragging ? "shadow-2xl shadow-indigo-500/20 ring-2 ring-indigo-500 scale-105" : "hover:shadow-md"
      } ${selected ? "ring-2 ring-indigo-500 border-indigo-500" : "border-border"}`}
    >
      <div className="bg-muted/30 aspect-[1/1.4] flex items-center justify-center p-2">
        <Page
          pageNumber={page.originalIndex}
          width={150}
          renderAnnotationLayer={false}
          renderTextLayer={false}
          loading={<div className="animate-pulse bg-muted w-full h-full rounded" />}
          className="shadow-sm drop-shadow-sm"
        />
      </div>

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
        <div className="flex justify-between items-start">
          {selectable && (
            <button
              onClick={() => onToggleSelect?.(page.originalIndex)}
              className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                selected ? "bg-indigo-500 border-indigo-500 text-white" : "bg-white/10 border-white/40 text-transparent hover:border-white"
              }`}
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          {deletable && (
            <button
              onClick={() => onDelete?.(page.originalIndex)}
              className="w-6 h-6 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-md">
        {page.originalIndex}
      </div>

      {reorderable && (
        <div
          {...attributes}
          {...listeners}
          className="absolute bottom-2 right-2 w-6 h-6 bg-black/60 backdrop-blur-sm rounded-md flex items-center justify-center text-white cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
}

export function PDFPageThumbnails({
  file,
  onOrderChange,
  onSelectionChange,
  selectable = true,
  reorderable = true,
  deletable = false,
}: PDFPageThumbnailsProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    const initialPages = Array.from({ length: numPages }, (_, i) => ({
      id: `page-${i + 1}`,
      originalIndex: i + 1,
    }));
    setPages(initialPages);
    if (onOrderChange) onOrderChange(initialPages.map((p) => p.originalIndex));
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        if (onOrderChange) onOrderChange(newArray.map((p) => p.originalIndex));
        return newArray;
      });
    }
  };

  const toggleSelect = (index: number) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedPages(newSelected);
    if (onSelectionChange) onSelectionChange(Array.from(newSelected));
  };

  const handleDelete = (index: number) => {
    const newPages = pages.filter((p) => p.originalIndex !== index);
    setPages(newPages);
    if (onOrderChange) onOrderChange(newPages.map((p) => p.originalIndex));
  };

  return (
    <div className="w-full">
      <Document file={file} onLoadSuccess={onDocumentLoadSuccess} loading={null}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={pages} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {pages.map((page) => (
                <SortablePageItem
                  key={page.id}
                  page={page}
                  file={file}
                  selected={selectedPages.has(page.originalIndex)}
                  onToggleSelect={toggleSelect}
                  onDelete={handleDelete}
                  selectable={selectable}
                  reorderable={reorderable}
                  deletable={deletable}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </Document>
    </div>
  );
}
