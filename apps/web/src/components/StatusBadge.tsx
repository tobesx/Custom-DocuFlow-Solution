import type { DocumentStatus } from "@docuflow/types";

const config: Record<DocumentStatus, { label: string; className: string }> = {
  pending:   { label: "In wachtrij", className: "bg-yellow-100 text-yellow-800" },
  in_review: { label: "In review",   className: "bg-blue-100 text-blue-800" },
  approved:  { label: "Goedgekeurd", className: "bg-green-100 text-green-800" },
  exported:  { label: "Geëxporteerd", className: "bg-gray-100 text-gray-600" },
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
