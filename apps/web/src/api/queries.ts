import { useQuery } from "@tanstack/react-query";
import type { Document, DocumentStatus, ExtractedData } from "@docuflow/types";
import { apiFetch } from "./client";

export type DocumentSummary = {
  id: string;
  status: DocumentStatus;
  createdAt: string;
  extractedData: ExtractedData;
};

export function useDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: () => apiFetch<DocumentSummary[]>("/api/documents"),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ["documents", id],
    queryFn: () => apiFetch<Document>(`/api/documents/${id}`),
    enabled: !!id,
  });
}
