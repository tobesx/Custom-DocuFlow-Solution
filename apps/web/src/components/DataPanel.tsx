import { useState, useRef, useEffect } from "react";
import { Pencil, Calendar, Undo2, Search } from "lucide-react";
import type { ExtractedData, BoundingBox } from "@docuflow/types";
import { useDocuFlowStore } from "../store/useDocuFlowStore";

function DataCard({ title, action, children }: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-4">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
        {action}
      </div>
      <div className="px-4 py-3">{children}</div>
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
      className={`flex items-center gap-2 border rounded-md px-3 py-1.5 transition-colors ${
        isActive ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white"
      }`}
      onMouseEnter={() => setActiveFieldKey(fieldKey)}
      onMouseLeave={() => setActiveFieldKey(null)}
    >
      {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
      <span className="text-xs text-gray-900">{value}</span>
    </div>
  );
}

// ── Order line correction types ───────────────

type Correction = { description: string; supplierReference: string };

const PRODUCT_CATALOG: Correction[] = [
  { description: "IJsbeker mini aardbeien VANGILS 36x80ml", supplierReference: "0024" },
  { description: "IJsbeker mini vanille VANGILS 36x80ml", supplierReference: "05152" },
  { description: "IJsbeker mini stracciatella VANGILS 36x80ml", supplierReference: "14522" },
  { description: "Black maxi stick VANGILS 12x120ml", supplierReference: "05071" },
  { description: "Coupe café glacé VANGILS 12x150ml", supplierReference: "0020" },
  { description: "Weekend bavarois aardbei VANGILS 24x140ml", supplierReference: "0618" },
  { description: "Coupe vanille luxe VANGILS 12x150ml", supplierReference: "00230" },
  { description: "Mousse suikervrij chocolade STEVIA 12x120ml", supplierReference: "03611" },
  { description: "IJsbeker banaan roomijs VANGILS 24x120ml", supplierReference: "07560" },
  { description: "IJsbeker citroen roomijs VANGILS 24x120ml", supplierReference: "07550" },
  { description: "IJsbeker pistache roomijs VANGILS 24x120ml", supplierReference: "07580" },
  { description: "IJsbeker mokka roomijs VANGILS 24x120ml", supplierReference: "07590" },
  { description: "IJsstaart vanille/mokka VANGILS 1500ml", supplierReference: "02370" },
  { description: "IJsbeker dame blanche roomijs VANGILS 24x120ml", supplierReference: "07610" },
  { description: "IJsbeker advocaat VANGILS 24x120ml", supplierReference: "07540" },
  { description: "IJsbeker aardbei roomijs VANGILS 24x120ml", supplierReference: "07520" },
  { description: "IJsbeker vanille STEVIA VANGILS 16x100ml", supplierReference: "03090" },
  { description: "IJsbeker chocolade STEVIA VANGILS 16x100ml", supplierReference: "03092" },
  { description: "IJsbeker dame blanche STEVIA VANGILS 16x100ml", supplierReference: "03093" },
  { description: "IJsbeker assorti STEVIA VANGILS 16x100ml", supplierReference: "03094" },
];

const POPUP_HEIGHT = 210; // search bar ~42px + max-h-36 list 144px + borders/padding

interface PopupPos { top: number; left: number; width: number; }

// ── Props ────────────────────────────────────

interface Props {
  extractedData: ExtractedData;
  boundingBoxes: BoundingBox[];
}

export function DataPanel({ extractedData }: Props) {
  const { customer, reference, deliveryDate, orderLines } = extractedData;
  const [corrections, setCorrections] = useState<Record<number, Correction>>({});
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [popupPos, setPopupPos] = useState<PopupPos | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const popupRef = useRef<HTMLDivElement>(null);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // Close popup on outside click
  useEffect(() => {
    if (selectedIdx === null) return;
    function onMouseDown(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setSelectedIdx(null);
        setPopupPos(null);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [selectedIdx]);

  function handleToggle(idx: number, e: React.MouseEvent<HTMLDivElement>) {
    if (selectedIdx === idx) {
      setSelectedIdx(null);
      setPopupPos(null);
      setSearchQuery("");
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Open downward if enough room, otherwise flip upward
    let top =
      spaceBelow >= POPUP_HEIGHT || spaceBelow >= spaceAbove
        ? rect.bottom + 4
        : rect.top - POPUP_HEIGHT - 4;

    // Clamp vertically so popup never leaves viewport
    top = Math.max(8, Math.min(top, window.innerHeight - POPUP_HEIGHT - 8));

    // Clamp horizontally
    const left = Math.max(
      8,
      Math.min(rect.left, window.innerWidth - rect.width - 8)
    );

    setSelectedIdx(idx);
    setSearchQuery("");
    setPopupPos({ top, left, width: rect.width });
  }

  function handleCorrect(idx: number, product: Correction) {
    setCorrections((prev) => ({ ...prev, [idx]: product }));
    setSelectedIdx(null);
    setPopupPos(null);
    setSearchQuery("");
  }

  function handleRevert(idx: number) {
    setCorrections((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  }

  const filteredProducts = PRODUCT_CATALOG.filter(
    (p) =>
      searchQuery.trim() === "" ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplierReference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="p-4">
        {/* Customer */}
        <DataCard
          title="Customer"
          action={
            <button className="p-1.5 rounded border border-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
              <Pencil size={12} />
            </button>
          }
        >
          <p className="font-semibold text-gray-900 text-sm mb-1">{customer.name}</p>
          <p className="text-xs text-gray-600 mb-0.5">{customer.email}</p>
          <p className="text-xs text-gray-600">VAT Number: {customer.vatNumber}</p>
        </DataCard>

        {/* Order details */}
        <DataCard title="Order details">
          <div className="mb-3">
            <p className="font-semibold text-gray-900 text-xs mb-1.5">Delivery date</p>
            <InputField
              fieldKey="deliveryDate"
              value={formatDate(deliveryDate)}
              icon={<Calendar size={13} />}
            />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-xs mb-1.5">Reference</p>
            <InputField fieldKey="reference" value={reference} />
          </div>
        </DataCard>

        {/* Order lines */}
        <DataCard title="Order lines">
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <div className="flex items-center px-4 py-2 bg-gray-50 border-b border-gray-200">
              <span className="flex-1 text-[11px] font-bold text-gray-700">Product</span>
              <span className="text-[11px] font-bold text-gray-700">Quantity</span>
            </div>
            {orderLines.map((line, i) => (
              <OrderLineRow
                key={i}
                fieldKey={`orderLines[${i}]`}
                line={line}
                correction={corrections[i] ?? null}
                isSelected={selectedIdx === i}
                onToggle={(e) => handleToggle(i, e)}
                onRevert={() => handleRevert(i)}
              />
            ))}
          </div>
        </DataCard>
      </div>

      {/* Inline fixed popup */}
      {selectedIdx !== null && popupPos && (
        <div
          ref={popupRef}
          style={{
            position: "fixed",
            top: popupPos.top,
            left: popupPos.left,
            width: popupPos.width,
            zIndex: 50,
          }}
          className="bg-white border border-gray-200 rounded-md shadow-xl overflow-hidden"
        >
          {/* Search */}
          <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
            <Search size={12} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search product or reference…"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-xs outline-none placeholder:text-gray-400 bg-transparent"
            />
          </div>
          {/* Product list — ~3 items visible, scroll for more */}
          <div className="overflow-y-auto max-h-36 divide-y divide-gray-100">
            {filteredProducts.length === 0 ? (
              <p className="text-xs text-gray-400 px-4 py-3">No results.</p>
            ) : (
              filteredProducts.map((product) => {
                const isCurrent =
                  corrections[selectedIdx]?.supplierReference === product.supplierReference;
                return (
                  <button
                    key={product.supplierReference}
                    className={`w-full text-left px-4 py-2.5 transition-colors flex items-center gap-3 ${
                      isCurrent ? "bg-amber-50" : "hover:bg-gray-50"
                    }`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleCorrect(selectedIdx, product)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-900">{product.description}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{product.supplierReference}</p>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-medium text-amber-700 shrink-0">Selected</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
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
  onToggle: (e: React.MouseEvent<HTMLDivElement>) => void;
  onRevert: () => void;
}) {
  const { activeFieldKey, setActiveFieldKey } = useDocuFlowStore();
  const isActive = activeFieldKey === fieldKey;
  const isCorrected = correction !== null;
  const display = correction ?? line;
  const rowRef = useRef<HTMLDivElement>(null);

  // Scroll into view when activated from PDF viewer hover
  useEffect(() => {
    if (isActive) {
      rowRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isActive]);

  return (
    <div
      ref={rowRef}
      className={`border-b border-gray-100 last:border-0 transition-colors cursor-pointer ${
        isActive ? "bg-blue-50" : isSelected ? "bg-amber-50" : "hover:bg-gray-50"
      }`}
      onMouseEnter={() => setActiveFieldKey(fieldKey)}
      onMouseLeave={() => setActiveFieldKey(null)}
      onClick={onToggle}
    >
      <div className="flex items-center px-4 py-2.5">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="text-xs text-gray-900 truncate">{display.description}</p>
            {isCorrected && (
              <span className="shrink-0 text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full leading-none">
                Modified
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">{display.supplierReference}</p>
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
              <Undo2 size={12} />
            </button>
          )}
          <span className="text-xs text-gray-900 min-w-[2rem] text-right">{line.quantity}</span>
        </div>
      </div>
    </div>
  );
}
