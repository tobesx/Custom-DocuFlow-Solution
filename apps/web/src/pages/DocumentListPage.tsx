import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, ExternalLink } from "lucide-react";
import { useDocuments } from "../api/queries";
import { StatusBadge } from "../components/StatusBadge";
import { PdfPreview } from "../components/PdfPreview";
import { API_BASE } from "../api/client";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatHeaderDate(): string {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function DocumentListPage() {
  const navigate = useNavigate();
  const { data: documents, isLoading, refetch } = useDocuments();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (documents && documents.length > 0 && !selectedId) {
      setSelectedId(documents[0].id);
    }
  }, [documents, selectedId]);

  const pendingCount = documents?.filter((d) => d.status === "pending").length ?? 0;

  return (
    <div className="flex-1 bg-gray-100 p-5 overflow-hidden flex flex-col">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col flex-1 min-h-0">

        {/* Card header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-3 shrink-0">
          <div>
            <p className="text-xs text-gray-400">📅 {formatHeaderDate()}</p>
            <h1 className="text-xl font-semibold text-gray-900 mt-0.5">
              {getGreeting()}, Toby
            </h1>
          </div>
          <button
            onClick={() => refetch()}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors mt-1"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Banner */}
        <div className="px-6 pb-4 shrink-0">
          <p className="text-sm text-gray-700 flex items-center gap-1.5">
            You have{" "}
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-xs font-bold shrink-0">
              {pendingCount}
            </span>{" "}
            new documents that need to be reviewed.
          </p>
        </div>

        {/* Split panel */}
        <div className="flex flex-1 border-t border-gray-100 overflow-hidden">

          {/* Table panel */}
          <div className="flex flex-col border-r border-gray-100" style={{ width: "58%" }}>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Customer name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Created at
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-2 py-3 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-400 text-sm">
                        Loading…
                      </td>
                    </tr>
                  ) : (
                    documents?.map((doc) => (
                      <tr
                        key={doc.id}
                        onClick={() => setSelectedId(doc.id)}
                        className={`cursor-pointer transition-colors ${
                          selectedId === doc.id
                            ? "bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-3.5 text-gray-900 font-medium">
                          {doc.extractedData.customer.name}
                        </td>
                        <td className="px-6 py-3.5 text-gray-500">
                          {formatCreatedAt(doc.createdAt)}
                        </td>
                        <td className="px-6 py-3.5">
                          <StatusBadge status={doc.status} />
                        </td>
                        <td className="px-2 py-3.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/documents/${doc.id}`);
                            }}
                            className="p-1 text-gray-300 hover:text-gray-500 transition-colors"
                            title="Open full review"
                          >
                            <ExternalLink size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between shrink-0">
              <span className="text-xs text-gray-400">
                {documents?.length ?? 0} results
              </span>
              <button
                onClick={() => refetch()}
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          {/* PDF preview panel */}
          <div className="flex-1 overflow-hidden">
            {selectedId ? (
              <PdfPreview url={`${API_BASE}/api/documents/${selectedId}/pdf`} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm bg-gray-50">
                Select a document to preview
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
