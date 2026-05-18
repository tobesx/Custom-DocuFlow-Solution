import "../lib/pdfWorker";
import { useState, useRef, useEffect } from "react";
import { Document, Page } from "react-pdf";

interface Props {
  url: string;
}

export function PdfPreview({ url }: Props) {
  const [containerWidth, setContainerWidth] = useState(400);
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
    <div ref={containerRef} className="w-full h-full overflow-auto bg-[#e8e8e8] flex justify-center py-6 px-4">
      <Document
        file={url}
        loading={
          <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
            Loading…
          </div>
        }
        error={
          <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
            Unable to load document.
          </div>
        }
      >
        <Page
          pageNumber={1}
          width={Math.min(containerWidth - 32, 520)}
          renderAnnotationLayer={false}
          renderTextLayer={false}
          className="shadow-md"
        />
      </Document>
    </div>
  );
}
