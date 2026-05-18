// ── Extracted Document Data ──────────────────

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
  vatNumber: string;
}

export interface Supplier {
  name: string;
  phone: string;
  address: string;
}

export interface OrderLine {
  articleNumber: string;
  supplierReference: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface ExtractedData {
  customer: Customer;
  supplier: Supplier;
  reference: string;
  deliveryDate: string;
  orderLines: OrderLine[];
  documentType: string;
}

// ── Bounding Boxes ───────────────────────────

export interface BoundingBox {
  fieldKey: string;
  label: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

// ── Document ─────────────────────────────────

export type DocumentStatus =
  | "pending"
  | "in_review"
  | "approved"
  | "exported";

export interface Document {
  id: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
  fileUrl: string;
  extractedData: ExtractedData;
  boundingBoxes: BoundingBox[];
}

// ── UI State (Zustand) ────────────────────────

export interface DocuFlowUIState {
  activeFieldKey: string | null;
  setActiveFieldKey: (key: string | null) => void;
}
