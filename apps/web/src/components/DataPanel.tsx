import { useState } from "react";
import { Pencil, Calendar, Undo2 } from "lucide-react";
import type { ExtractedData, BoundingBox } from "@docuflow/types";
import { useDocuFlowStore } from "../store/useDocuFlowStore";

function DataCard({ title, action, children }: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-4">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-base">{title}</h3>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function InputField({ fieldKey, value, icon }: {
  fieldKey: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  const { activeFieldKey, setActiveFieldKey } = useDocuFlowStore();
  const isActive = activeFieldKey === fieldKey;

  return (
    <div
      className={`flex items-center gap-2 border rounded-md px-3 py-2 transition-colors ${
        isActive ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white"
      }`}
      onMouseEnter={() => setActiveFieldKey(fieldKey)}
      onMouseLeave={() => setActiveFieldKey(null)}
    >
      {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}

// ── Order line correction types ───────────────

type Correction = { description: string; supplierReference: string };

const MOCK_PRODUCTS: Correction[] = [
  { description: "Tarwebloem T55", supplierReference: "TW-T55-001" },
  { description: "Roggebloem Type 130", supplierReference: "RG-130-002" },
  { description: "Speltbloem fijn", supplierReference: "SP-BL-003" },
  { description: "Volkorenmeel tarwe", supplierReference: "VK-ML-004" },
  { description: "Maizena premium", supplierReference: "MZ-NT-005" },
  { description: "Rijstmeel gluten-free", supplierReference: "RJ-ML-006" },
  { description: "Glutenvrije bakmix", supplierReference: "GV-MX-007" },
  { description: "Patisseriemeel fijn", supplierReference: "PT-ML-008" },
];

// ── Props ────────────────────────────────────

interface Props {
  extractedData: ExtractedData;
  boundingBoxes: BoundingBox[];
}

export function DataPanel({ extractedData }: Props) {
  const { customer, reference, deliveryDate, orderLines } = extractedData;
  const [corrections, setCorrections] = useState<Record<number, Correction>>({});
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function handleCorrect(idx: number, product: Correction) {
    setCorrections((prev) => ({ ...prev, [idx]: product }));
    setSelectedIdx(null);
  }

  function handleRevert(idx: number) {
    setCorrections((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  }

  function toggleRow(idx: number) {
    setSelectedIdx((prev) => (prev === idx ? null : idx));
  }

  return (
    <div className="p-4">
      {/* Customer */}
      <DataCard
        title="Customer"
        action={
          <button className="p-1.5 rounded border border-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
            <Pencil size={13} />
          </button>
        }
      >
        <p className="font-semibold text-gray-900 mb-1">{customer.name}</p>
        <p className="text-sm text-gray-600 mb-0.5">{customer.email}</p>
        <p className="text-sm text-gray-600">VAT Number: {customer.vatNumber}</p>
      </DataCard>

      {/* Order details */}
      <DataCard title="Order details">
        <div className="mb-4">
          <p className="font-semibold text-gray-900 text-sm mb-2">Delivery date</p>
          <InputField
            fieldKey="deliveryDate"
            value={formatDate(deliveryDate)}
            icon={<Calendar size={14} />}
          />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm mb-2">Reference</p>
          <InputField fieldKey="reference" value={reference} />
        </div>
      </DataCard>

      {/* Order lines */}
      <DataCard title="Order lines">
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="flex items-center px-4 py-2.5 bg-gray-50 border-b border-gray-200">
            <span className="flex-1 text-xs font-bold text-gray-700">Product</span>
            <span className="text-xs font-bold text-gray-700">Quantity</span>
          </div>
          {orderLines.map((line, i) => (
            <OrderLineRow
              key={i}
              fieldKey={`orderLines[${i}]`}
              line={line}
              correction={corrections[i] ?? null}
              isSelected={selectedIdx === i}
              onToggle={() => toggleRow(i)}
              onRevert={() => handleRevert(i)}
            />
          ))}
        </div>

        {/* Product picker — shown below table when a row is selected */}
        {selectedIdx !== null && (
          <div className="mt-3 border border-amber-200 rounded-md overflow-hidden bg-white">
            <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">
                Choose product for line {selectedIdx + 1}
              </span>
              <button
                className="text-xs text-amber-600 hover:text-amber-800 transition-colors"
                onClick={() => setSelectedIdx(null)}
              >
                Close
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
              {MOCK_PRODUCTS.map((product) => {
                const isCurrent =
                  corrections[selectedIdx]?.supplierReference === product.supplierReference;
                return (
                  <button
                    key={product.supplierReference}
                    className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 ${
                      isCurrent ? "bg-amber-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleCorrect(selectedIdx, product)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{product.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{product.supplierReference}</p>
                    </div>
                    {isCurrent && (
                      <span className="text-xs font-medium text-amber-700 shrink-0">Selected</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </DataCard>
    </div>
  );
}

function OrderLineRow({
  fieldKey,
  line,
  correction,
  isSelected,
  onToggle,
  onRevert,
}: {
  fieldKey: string;
  line: { description: string; supplierReference: string; quantity: number };
  correction: Correction | null;
  isSelected: boolean;
  onToggle: () => void;
  onRevert: () => void;
}) {
  const { activeFieldKey, setActiveFieldKey } = useDocuFlowStore();
  const isActive = activeFieldKey === fieldKey;
  const isCorrected = correction !== null;
  const display = correction ?? line;

  return (
    <div
      className={`border-b border-gray-100 last:border-0 transition-colors cursor-pointer ${
        isActive ? "bg-blue-50" : isSelected ? "bg-amber-50" : "hover:bg-gray-50"
      }`}
      onMouseEnter={() => setActiveFieldKey(fieldKey)}
      onMouseLeave={() => setActiveFieldKey(null)}
      onClick={onToggle}
    >
      <div className="flex items-center px-4 py-3">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="text-sm text-gray-900 truncate">{display.description}</p>
            {isCorrected && (
              <span className="shrink-0 text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full leading-none">
                Modified
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{display.supplierReference}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isCorrected && (
            <button
              className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onRevert();
              }}
              title="Revert to OCR result"
            >
              <Undo2 size={13} />
            </button>
          )}
          <span className="text-sm text-gray-900 min-w-[2rem] text-right">{line.quantity}</span>
        </div>
      </div>
    </div>
  );
}
