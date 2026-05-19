import "../lib/pdfWorker";
import { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page } from "react-pdf";
import { Minimize2, ChevronLeft, ChevronRight } from "lucide-react";
import { useDocuFlowStore } from "../store/useDocuFlowStore";
import type { BoundingBox } from "@docuflow/types";

interface Transform {
  x: number;
  y: number;
  scale: number;
}

interface Props {
  url: string;
  boundingBoxes: BoundingBox[];
}

export function PdfViewer({ url, boundingBoxes }: Props) {
  const { activeFieldKey, setActiveFieldKey } = useDocuFlowStore();
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [containerSize, setContainerSize] = useState({ width: 600, height: 600 });
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const lastMouse = useRef({ x: 0, y: 0 });

  // baseWidth ensures the full page fits within the canvas area
  const baseWidth = Math.max(
    280,
    Math.min(
      containerSize.width - 64,
      (containerSize.height - 64) / 1.414
    )
  );

  // Measure canvas area (excludes pagination bar)
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // When activeFieldKey changes, switch to the page that has the matching bbox
  useEffect(() => {
    if (!activeFieldKey) return;
    const bbox = boundingBoxes.find((b) => b.fieldKey === activeFieldKey);
    if (bbox && bbox.page !== currentPage - 1) {
      setCurrentPage(bbox.page + 1);
      setTransform({ x: 0, y: 0, scale: 1 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFieldKey]);

  function goToPage(page: number) {
    setCurrentPage(page);
    setTransform({ x: 0, y: 0, scale: 1 });
  }

  // Wheel → zoom toward cursor
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setTransform((t) => {
      const newScale = Math.max(0.2, Math.min(6, t.scale * factor));
      const ratio = newScale / t.scale;
      return {
        scale: newScale,
        x: mouseX - ratio * (mouseX - t.x),
        y: mouseY - ratio * (mouseY - t.y),
      };
    });
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.bbox) return;
    setIsPanning(true);
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
  };
  const handleMouseUp = () => setIsPanning(false);
  const reset = () => setTransform({ x: 0, y: 0, scale: 1 });

  const pageBboxes = boundingBoxes.filter((b) => b.page === currentPage - 1);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-[#e8e8e8]">
      {/* PDF canvas */}
      <div
        ref={canvasRef}
        className="flex-1 overflow-hidden relative"
        style={{ cursor: isPanning ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: "0 0",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            padding: "32px 32px",
          }}
        >
          <Document
            file={url}
            onLoadSuccess={({ numPages: n }) => setNumPages(n)}
            loading={null}
            error={
              <div className="text-red-400 text-sm bg-white px-6 py-4 rounded shadow">
                Unable to load document.
              </div>
            }
          >
            <div className="relative shadow-lg">
              <Page
                pageNumber={currentPage}
                width={baseWidth}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
              {/* Bbox overlay */}
              <div
                className="absolute inset-0"
                style={{ pointerEvents: isPanning ? "none" : "auto" }}
              >
                {pageBboxes.map((bbox) => {
                  const isActive = activeFieldKey === bbox.fieldKey;
                  return (
                    <div
                      key={bbox.fieldKey}
                      data-bbox="true"
                      className={`absolute rounded-sm transition-colors ${
                        isActive
                          ? "bg-blue-400/30 ring-1 ring-blue-500"
                          : "hover:bg-blue-300/20 hover:ring-1 hover:ring-blue-400"
                      }`}
                      style={{
                        left: `${bbox.x * 100}%`,
                        top: `${bbox.y * 100}%`,
                        width: `${bbox.width * 100}%`,
                        height: `${bbox.height * 100}%`,
                        cursor: "default",
                      }}
                      onMouseEnter={() => setActiveFieldKey(bbox.fieldKey)}
                      onMouseLeave={() => setActiveFieldKey(null)}
                    >
                      {isActive && (
                        <span
                          className="absolute left-0 bg-[#1c2b3a] text-white text-[10px] font-medium px-1.5 py-0.5 rounded-sm whitespace-nowrap shadow-sm z-10"
                          style={{ bottom: "calc(100% + 2px)", pointerEvents: "none" }}
                        >
                          {bbox.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Document>
        </div>

        {/* Reset view button */}
        <button
          onClick={reset}
          className="absolute bottom-4 left-4 p-1.5 bg-white rounded border border-gray-200 shadow-sm text-gray-500 hover:text-gray-700 transition-colors"
          title="Reset view"
        >
          <Minimize2 size={14} />
        </button>
      </div>

      {/* Pagination bar — only shown for multi-page documents */}
      {numPages > 1 && (
        <div className="h-11 shrink-0 bg-white border-t border-gray-200 flex items-center justify-center gap-3">
          <button
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
            className="p-1 rounded text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-gray-600 tabular-nums select-none">
            {currentPage} / {numPages}
          </span>
          <button
            disabled={currentPage >= numPages}
            onClick={() => goToPage(currentPage + 1)}
            className="p-1 rounded text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
