import "../lib/pdfWorker";
import { useState, useRef, useEffect } from "react";
import { Document, Page } from "react-pdf";
import { useDocuFlowStore } from "../store/useDocuFlowStore";
import type { BoundingBox } from "@docuflow/types";

interface Props {
  url: string;
  boundingBoxes: BoundingBox[];
}

export function PdfViewer({ url, boundingBoxes }: Props) {
  const { activeFieldKey, setActiveFieldKey } = useDocuFlowStore();
  const [numPages, setNumPages] = useState(0);
  const [containerWidth, setContainerWidth] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <Document
        file={url}
        onLoadSuccess={({ numPages: n }) => setNumPages(n)}
        loading={
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
            PDF laden…
          </div>
        }
        error={
          <div className="flex items-center justify-center h-64 text-red-400 text-sm">
            PDF kon niet geladen worden.
          </div>
        }
      >
        {Array.from({ length: numPages }, (_, i) => (
          <div key={i} className="relative mb-2 shadow-sm">
            <Page
              pageNumber={i + 1}
              width={containerWidth}
              renderAnnotationLayer={false}
              renderTextLayer={false}
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
  );
}
