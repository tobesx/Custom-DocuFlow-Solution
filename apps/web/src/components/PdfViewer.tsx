import "../lib/pdfWorker";
import { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page } from "react-pdf";
import { ZoomIn, ZoomOut, Minimize2 } from "lucide-react";
import { useDocuFlowStore } from "../store/useDocuFlowStore";
import type { BoundingBox } from "@docuflow/types";

interface Props {
  url: string;
  boundingBoxes: BoundingBox[];
}

export function PdfViewer({ url, boundingBoxes }: Props) {
  const { activeFieldKey, setActiveFieldKey } = useDocuFlowStore();
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [containerSize, setContainerSize] = useState({ width: 600, height: 800 });
  const [pageAspect, setPageAspect] = useState(0.707); // A4 portrait default
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
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

  const fitWidth = Math.min(
    containerSize.width - 48,
    (containerSize.height - 80) * pageAspect
  );
  const pageWidth = Math.max(200, Math.round(fitWidth * zoom));

  const zoomIn = useCallback(() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2))), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(0.25, +(z - 0.25).toFixed(2))), []);
  const resetZoom = useCallback(() => setZoom(1), []);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Zoom toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 bg-white border-b border-gray-100 shrink-0">
        <button
          onClick={zoomOut}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
          title="Zoom out"
        >
          <ZoomOut size={15} />
        </button>
        <span className="text-xs text-gray-500 w-10 text-center select-none">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={zoomIn}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
          title="Zoom in"
        >
          <ZoomIn size={15} />
        </button>
      </div>

      {/* Scrollable PDF area */}
      <div ref={containerRef} className="flex-1 overflow-auto bg-[#e8e8e8] relative">
        <div className="flex flex-col items-center py-6 px-6 gap-4">
          <Document
            file={url}
            onLoadSuccess={({ numPages: n }) => setNumPages(n)}
            loading={
              <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                Loading…
              </div>
            }
            error={
              <div className="flex items-center justify-center h-64 text-red-400 text-sm">
                Unable to load document.
              </div>
            }
          >
            {Array.from({ length: numPages }, (_, i) => (
              <div key={i} className="relative shadow-lg mb-4">
                <Page
                  pageNumber={i + 1}
                  width={pageWidth}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  onRenderSuccess={({ width, height }) => {
                    if (i === 0) setPageAspect(width / height);
                  }}
                />
                <div className="absolute inset-0">
                  {boundingBoxes
                    .filter((b) => b.page === i)
                    .map((bbox) => {
                      const isActive = activeFieldKey === bbox.fieldKey;
                      return (
                        <div
                          key={bbox.fieldKey}
                          title={bbox.label}
                          className={`absolute cursor-pointer transition-colors rounded-sm ${
                            isActive
                              ? "bg-blue-400/30 ring-1 ring-blue-500"
                              : "hover:bg-blue-300/20 hover:ring-1 hover:ring-blue-400"
                          }`}
                          style={{
                            left: `${bbox.x * 100}%`,
                            top: `${bbox.y * 100}%`,
                            width: `${bbox.width * 100}%`,
                            height: `${bbox.height * 100}%`,
                          }}
                          onMouseEnter={() => setActiveFieldKey(bbox.fieldKey)}
                          onMouseLeave={() => setActiveFieldKey(null)}
                        />
                      );
                    })}
                </div>
              </div>
            ))}
          </Document>
        </div>

        {/* Reset button — bottom left, like Retool */}
        <button
          onClick={resetZoom}
          className="absolute bottom-4 left-4 p-1.5 bg-white rounded border border-gray-200 shadow-sm text-gray-500 hover:text-gray-700 transition-colors"
          title="Reset zoom"
        >
          <Minimize2 size={14} />
        </button>
      </div>
    </div>
  );
}
