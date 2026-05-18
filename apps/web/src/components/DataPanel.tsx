import { Pencil, Calendar } from "lucide-react";
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

interface Props {
  extractedData: ExtractedData;
  boundingBoxes: BoundingBox[];
}

export function DataPanel({ extractedData }: Props) {
  const { customer, reference, deliveryDate, orderLines } = extractedData;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
          {orderLines.map((line, i) => {
            const fieldKey = `orderLines[${i}]`;
            return (
              <OrderLineRow key={i} fieldKey={fieldKey} line={line} />
            );
          })}
        </div>
      </DataCard>
    </div>
  );
}

function OrderLineRow({
  fieldKey,
  line,
}: {
  fieldKey: string;
  line: { description: string; supplierReference: string; quantity: number };
}) {
  const { activeFieldKey, setActiveFieldKey } = useDocuFlowStore();
  const isActive = activeFieldKey === fieldKey;

  return (
    <div
      className={`flex items-center px-4 py-3 border-b border-gray-100 last:border-0 transition-colors cursor-default ${
        isActive ? "bg-blue-50" : "hover:bg-gray-50"
      }`}
      onMouseEnter={() => setActiveFieldKey(fieldKey)}
      onMouseLeave={() => setActiveFieldKey(null)}
    >
      <div className="flex-1 min-w-0 pr-6">
        <p className="text-sm text-gray-900 truncate">{line.description}</p>
        <p className="text-xs text-gray-400 mt-0.5">{line.supplierReference}</p>
      </div>
      <span className="text-sm text-gray-900 shrink-0">{line.quantity}</span>
    </div>
  );
}
