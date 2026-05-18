import "../lib/pdfWorker";
import { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page } from "react-pdf";
import { Minimize2 } from "lucide-react";
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
  const [baseWidth, setBaseWidth] = useState(600);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastMouse = useRef({ x: 0, y: 0 });

  // Measure container for initial PDF width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setBaseWidth(Math.max(300, entry.contentRect.width - 80));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Wheel → zoom toward cursor
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current!.getBoundingClientRect();
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
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan on left-click on the container background (not on bbox elements)
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

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden relative bg-[#e8e8e8]"
      style={{ cursor: isPanning ? "grabbing" : "grab" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Transformable content */}
      <div
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: "0 0",
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "32px 40px",
          gap: "16px",
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
          {Array.from({ length: numPages }, (_, i) => (
            <div key={i} className="relative shadow-lg">
              <Page
                pageNumber={i + 1}
                width={baseWidth}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
              {/* Bbox overlay — pointer-events off while panning */}
              <div
                className="absolute inset-0"
                style={{ pointerEvents: isPanning ? "none" : "auto" }}
              >
                {boundingBoxes
                  .filter((b) => b.page === i)
                  .map((bbox) => {
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
          ))}
        </Document>
      </div>

      {/* Reset button */}
      <button
        onClick={reset}
        className="absolute bottom-4 left-4 p-1.5 bg-white rounded border border-gray-200 shadow-sm text-gray-500 hover:text-gray-700 transition-colors"
        title="Reset view"
      >
        <Minimize2 size={14} />
      </button>
    </div>
  );
}
