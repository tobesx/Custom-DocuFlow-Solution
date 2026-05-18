import type { ExtractedData, BoundingBox } from "@docuflow/types";
import { useDocuFlowStore } from "../store/useDocuFlowStore";

function DataCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-4">
      <div className="px-5 py-3.5 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

interface FieldRowProps {
  fieldKey: string;
  label: string;
  value: string | number;
}

function FieldRow({ fieldKey, label, value }: FieldRowProps) {
  const { activeFieldKey, setActiveFieldKey } = useDocuFlowStore();
  const isActive = activeFieldKey === fieldKey;

  return (
    <div
      className={`py-2 -mx-5 px-5 transition-colors cursor-default rounded ${
        isActive ? "bg-blue-50" : "hover:bg-gray-50"
      }`}
      onMouseEnter={() => setActiveFieldKey(fieldKey)}
      onMouseLeave={() => setActiveFieldKey(null)}
    >
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  );
}

interface Props {
  extractedData: ExtractedData;
  boundingBoxes: BoundingBox[];
}

export function DataPanel({ extractedData }: Props) {
  const { activeFieldKey, setActiveFieldKey } = useDocuFlowStore();
  const { customer, supplier, reference, deliveryDate, documentType, orderLines } = extractedData;

  return (
    <div className="p-4">
      <DataCard title="Customer">
        <p className="font-semibold text-gray-900 mb-3">{customer.name}</p>
        <FieldRow fieldKey="customer.email" label="Email" value={customer.email} />
        <FieldRow fieldKey="customer.phone" label="Phone" value={customer.phone} />
        <FieldRow fieldKey="customer.address" label="Address" value={customer.address} />
        <FieldRow fieldKey="customer.vatNumber" label="VAT number" value={customer.vatNumber} />
      </DataCard>

      <DataCard title="Supplier">
        <FieldRow fieldKey="supplier.name" label="Name" value={supplier.name} />
        <FieldRow fieldKey="supplier.phone" label="Phone" value={supplier.phone} />
        <FieldRow fieldKey="supplier.address" label="Address" value={supplier.address} />
      </DataCard>

      <DataCard title="Order details">
        <FieldRow fieldKey="reference" label="Reference" value={reference} />
        <FieldRow fieldKey="deliveryDate" label="Delivery date" value={deliveryDate} />
        <FieldRow fieldKey="documentType" label="Document type" value={documentType} />
      </DataCard>

      <DataCard title="Order lines">
        <div className="flex text-xs font-medium text-gray-400 pb-2 mb-1 border-b border-gray-100">
          <span className="flex-1">Product</span>
          <span>Quantity</span>
        </div>
        {orderLines.map((line, i) => {
          const fieldKey = `orderLines[${i}]`;
          const isActive = activeFieldKey === fieldKey;
          return (
            <div
              key={i}
              className={`flex items-center py-3 border-b border-gray-50 last:border-0 -mx-5 px-5 transition-colors cursor-default ${
                isActive ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
              onMouseEnter={() => setActiveFieldKey(fieldKey)}
              onMouseLeave={() => setActiveFieldKey(null)}
            >
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm text-gray-900 truncate">{line.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">{line.supplierReference}</p>
              </div>
              <span className="text-sm font-medium text-gray-700 shrink-0">{line.quantity}</span>
            </div>
          );
        })}
      </DataCard>
    </div>
  );
}
