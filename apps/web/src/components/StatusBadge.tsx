import type { DocumentStatus } from "@docuflow/types";

const config: Record<DocumentStatus, { label: string; className: string }> = {
  pending:   { label: "PENDING",   className: "bg-orange-100 text-orange-500" },
  in_review: { label: "IN REVIEW", className: "bg-blue-100 text-blue-500" },
  approved:  { label: "APPROVED",  className: "bg-green-100 text-green-600" },
  exported:  { label: "EXPORTED",  className: "bg-gray-100 text-gray-500" },
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${className}`}>
      {label}
    </span>
  );
}
