import type { Document } from "@docuflow/types";

export const MOCK_DOCUMENT: Document = {
  id: "doc_001",
  status: "pending",
  createdAt: "2025-10-05T09:14:00Z",
  updatedAt: "2025-10-05T09:14:00Z",
  fileUrl: "/mock/bestelbon_fribona_252128.pdf",
  extractedData: {
    documentType: "Bestelbon",
    reference: "252128",
    deliveryDate: "2025-10-06",
    customer: {
      name: "Fribona nv-sa",
      email: "info@fribona.be",
      phone: "0032 (0)50 83 30 90",
      address: "Vliegweg 23, 8020 Oostkamp, België",
      vatNumber: "BE 0405.186.123",
    },
    supplier: {
      name: "Van Gils Distributie",
      phone: "014/655608",
      address: "Elzenstraat 53, 2381 Weelde",
    },
    orderLines: [
      { articleNumber: "30170", supplierReference: "05152", description: "TRIOSTAR 9x55ml - 8x9x55ml/karton", quantity: 10, unit: "OV", price: 14.49 },
      { articleNumber: "30178", supplierReference: "00180", description: "COUPE DAME-BLANCHE 12x150ml", quantity: 98, unit: "OV", price: 6.13 },
      { articleNumber: "30179", supplierReference: "00210", description: "COUPE STRACCIATELLA 12x150ml", quantity: 17, unit: "OV", price: 7.09 },
      { articleNumber: "30361", supplierReference: "05041", description: "CHOCO PRALINE NOOT 22x90ml", quantity: 10, unit: "OV", price: 7.73 },
      { articleNumber: "30617", supplierReference: "03090", description: "POTJE VANILLE SUIKERVRIJ VAN GILS 16x100ml", quantity: 7, unit: "OV", price: 8.2438 },
      { articleNumber: "30916", supplierReference: "07510", description: "BEKER VANILLE ROOMIJS 24x120ml", quantity: 5, unit: "OV", price: 6.867 },
    ],
  },
  boundingBoxes: [
    { fieldKey: "customer.name",      label: "Customer name",    page: 0, x: 0.1804, y: 0.1017, width: 0.1219, height: 0.0088 },
    { fieldKey: "customer.address",   label: "Customer address", page: 0, x: 0.1789, y: 0.1171, width: 0.1837, height: 0.0240 },
    { fieldKey: "customer.phone",     label: "Customer phone",   page: 0, x: 0.1905, y: 0.1461, width: 0.1206, height: 0.0085 },
    { fieldKey: "customer.email",     label: "Customer email",   page: 0, x: 0.1801, y: 0.1601, width: 0.0995, height: 0.0081 },
    { fieldKey: "customer.vatNumber", label: "VAT number",       page: 0, x: 0.2256, y: 0.1966, width: 0.0762, height: 0.0053 },
    { fieldKey: "reference",          label: "Reference",        page: 0, x: 0.6003, y: 0.2520, width: 0.0772, height: 0.0126 },
    { fieldKey: "deliveryDate",       label: "Delivery date",    page: 0, x: 0.2928, y: 0.2862, width: 0.0747, height: 0.0082 },
    { fieldKey: "orderLines[0]",      label: "Order line 1",     page: 0, x: 0.0437, y: 0.3303, width: 0.8224, height: 0.0085 },
    { fieldKey: "orderLines[1]",      label: "Order line 2",     page: 0, x: 0.0437, y: 0.3428, width: 0.8223, height: 0.0086 },
    { fieldKey: "orderLines[2]",      label: "Order line 3",     page: 0, x: 0.0437, y: 0.3557, width: 0.8223, height: 0.0086 },
    { fieldKey: "orderLines[3]",      label: "Order line 4",     page: 0, x: 0.0437, y: 0.3682, width: 0.8223, height: 0.0086 },
    { fieldKey: "orderLines[4]",      label: "Order line 5",     page: 0, x: 0.0437, y: 0.3810, width: 0.8225, height: 0.0086 },
    { fieldKey: "orderLines[5]",      label: "Order line 6",     page: 0, x: 0.0437, y: 0.3935, width: 0.8223, height: 0.0086 },
  ],
};

export const MOCK_DOCUMENT_LIST: Pick<Document, "id" | "status" | "createdAt" | "extractedData">[] = [
  {
    id: "doc_001",
    status: "pending",
    createdAt: "2025-10-05T09:14:00Z",
    extractedData: { ...MOCK_DOCUMENT.extractedData },
  },
  {
    id: "doc_002",
    status: "in_review",
    createdAt: "2025-10-04T14:32:00Z",
    extractedData: {
      ...MOCK_DOCUMENT.extractedData,
      reference: "252097",
      customer: { ...MOCK_DOCUMENT.extractedData.customer, name: "Colruyt Group NV" },
    },
  },
  {
    id: "doc_003",
    status: "approved",
    createdAt: "2025-10-03T08:55:00Z",
    extractedData: {
      ...MOCK_DOCUMENT.extractedData,
      reference: "251984",
      customer: { ...MOCK_DOCUMENT.extractedData.customer, name: "Delhaize Belgium" },
    },
  },
];
