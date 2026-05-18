import type { ExtractedData, BoundingBox } from "@docuflow/types";
import { useDocuFlowStore } from "../store/useDocuFlowStore";

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
      className={`flex gap-3 px-4 py-2 rounded-md cursor-default transition-colors ${
        isActive ? "bg-blue-50 ring-1 ring-inset ring-blue-200" : "hover:bg-gray-50"
      }`}
      onMouseEnter={() => setActiveFieldKey(fieldKey)}
      onMouseLeave={() => setActiveFieldKey(null)}
    >
      <span className="text-xs text-gray-400 w-36 shrink-0 pt-0.5 leading-5">{label}</span>
      <span className="text-sm text-gray-900 leading-5">{value}</span>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="px-4 pt-5 pb-1">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
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
    <div className="py-2">
      <SectionHeader title="Document" />
      <FieldRow fieldKey="reference" label="Referentie" value={reference} />
      <FieldRow fieldKey="deliveryDate" label="Leveringsdatum" value={deliveryDate} />
      <FieldRow fieldKey="documentType" label="Type" value={documentType} />

      <SectionHeader title="Klant" />
      <FieldRow fieldKey="customer.name" label="Naam" value={customer.name} />
      <FieldRow fieldKey="customer.email" label="E-mail" value={customer.email} />
      <FieldRow fieldKey="customer.phone" label="Telefoon" value={customer.phone} />
      <FieldRow fieldKey="customer.address" label="Adres" value={customer.address} />
      <FieldRow fieldKey="customer.vatNumber" label="BTW-nummer" value={customer.vatNumber} />

      <SectionHeader title="Leverancier" />
      <FieldRow fieldKey="supplier.name" label="Naam" value={supplier.name} />
      <FieldRow fieldKey="supplier.phone" label="Telefoon" value={supplier.phone} />
      <FieldRow fieldKey="supplier.address" label="Adres" value={supplier.address} />

      <SectionHeader title="Bestelregels" />
      <div className="mx-4 mt-1 rounded-md border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-400 text-left">
              <th className="px-3 py-2 font-medium">Art.nr</th>
              <th className="px-3 py-2 font-medium">Omschrijving</th>
              <th className="px-3 py-2 font-medium text-right">Aantal</th>
              <th className="px-3 py-2 font-medium text-right">Prijs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orderLines.map((line, i) => {
              const fieldKey = `orderLines[${i}]`;
              const isActive = activeFieldKey === fieldKey;
              return (
                <tr
                  key={i}
                  className={`transition-colors cursor-default ${
                    isActive ? "bg-blue-50 ring-1 ring-inset ring-blue-200" : "hover:bg-gray-50"
                  }`}
                  onMouseEnter={() => setActiveFieldKey(fieldKey)}
                  onMouseLeave={() => setActiveFieldKey(null)}
                >
                  <td className="px-3 py-2 text-gray-500">{line.articleNumber}</td>
                  <td className="px-3 py-2 text-gray-900">{line.description}</td>
                  <td className="px-3 py-2 text-gray-700 text-right">{line.quantity} {line.unit}</td>
                  <td className="px-3 py-2 text-gray-700 text-right">€ {line.price.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
