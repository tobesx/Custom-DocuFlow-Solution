import "../lib/pdfWorker";
import { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page } from "react-pdf";
import { Minimize2 } from "lucide-react";

interface Transform {
  x: number;
  y: number;
  scale: number;
}

interface Props {
  url: string;
}

export function PdfPreview({ url }: Props) {
  const [baseWidth, setBaseWidth] = useState(400);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBaseWidth(
        Math.max(200, Math.min(width - 32, (height - 48) / 1.414))
      );
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
      <div
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: "0 0",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          padding: "24px 16px",
        }}
      >
        <Document
          file={url}
          loading={
            <div className="flex items-center justify-center w-full h-32 text-gray-400 text-sm">
              Loading…
            </div>
          }
          error={
            <div className="flex items-center justify-center w-full h-32 text-gray-400 text-sm">
              Unable to load document.
            </div>
          }
        >
          <Page
            pageNumber={1}
            width={baseWidth}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            className="shadow-md"
          />
        </Document>
      </div>

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
