import { useParams, useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
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
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
      {/* Sub-header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 shrink-0">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          ← Back
        </button>
        <h1 className="flex-1 text-lg font-semibold text-gray-900 truncate">
          {doc.extractedData.customer.name}
        </h1>
        <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded transition-colors">
          <Save size={14} />
          Save
        </button>
      </div>

      {/* Split panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF panel */}
        <div className="flex-1 overflow-hidden">
          <PdfViewer url={pdfUrl} boundingBoxes={doc.boundingBoxes} />
        </div>

        {/* Data panel — wider, ~40% */}
        <div
          className="overflow-y-auto bg-gray-100 border-l border-gray-200 shrink-0"
          style={{ width: "min(46%, 580px)", minWidth: "380px" }}
        >
          <DataPanel extractedData={doc.extractedData} boundingBoxes={doc.boundingBoxes} />
        </div>
      </div>
    </div>
  );
}
