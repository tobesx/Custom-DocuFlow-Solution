import { useParams, useNavigate } from "react-router-dom";
import { useDocument } from "../api/queries";
import { StatusBadge } from "../components/StatusBadge";

export function DocumentReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: doc, isLoading, isError } = useDocument(id ?? "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Laden…
      </div>
    );
  }

  if (isError || !doc) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Document niet gevonden.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          ← Terug
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-900">
            {doc.extractedData.documentType} — {doc.extractedData.reference}
          </h1>
          <p className="text-sm text-gray-500">{doc.extractedData.customer.name}</p>
        </div>
        <StatusBadge status={doc.status} />
      </header>

      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        PDF viewer komt hier — stap 4
      </div>
    </div>
  );
}
