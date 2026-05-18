import { useParams, useNavigate } from "react-router-dom";
import { useDocument } from "../api/queries";
import { StatusBadge } from "../components/StatusBadge";
import { PdfViewer } from "../components/PdfViewer";
import { DataPanel } from "../components/DataPanel";
import { API_BASE } from "../api/client";

export function DocumentReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: doc, isLoading, isError } = useDocument(id ?? "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1 text-gray-400">
        Loading…
      </div>
    );
  }

  if (isError || !doc) {
    return (
      <div className="flex items-center justify-center flex-1 text-red-500">
        Document not found.
      </div>
    );
  }

  const pdfUrl = `${API_BASE}/api/documents/${doc.id}/pdf`;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 shrink-0">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          ← Back
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-gray-900 truncate">
            {doc.extractedData.documentType} — {doc.extractedData.reference}
          </h1>
          <p className="text-xs text-gray-400">{doc.extractedData.customer.name}</p>
        </div>
        <StatusBadge status={doc.status} />
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
          <PdfViewer url={pdfUrl} boundingBoxes={doc.boundingBoxes} />
        </div>
        <div className="w-96 shrink-0 overflow-y-auto bg-white border-l border-gray-200">
          <DataPanel extractedData={doc.extractedData} boundingBoxes={doc.boundingBoxes} />
        </div>
      </div>
    </div>
  );
}
