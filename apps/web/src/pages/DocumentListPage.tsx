import { useNavigate } from "react-router-dom";
import { useDocuments } from "../api/queries";
import { StatusBadge } from "../components/StatusBadge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function DocumentListPage() {
  const navigate = useNavigate();
  const { data: documents, isLoading, isError } = useDocuments();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Laden…
      </div>
    );
  }

  if (isError || !documents) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        Fout bij laden van documenten.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">DocuFlow</h1>
          <p className="text-sm text-gray-500">Dossche Mills — Documenten</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Referentie</th>
                <th className="px-6 py-3">Klant</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Datum</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  onClick={() => navigate(`/documents/${doc.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {doc.extractedData.reference}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {doc.extractedData.customer.name}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {doc.extractedData.documentType}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {formatDate(doc.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={doc.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
