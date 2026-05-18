# DocuFlow — Dossche Mills

Document review application for purchase orders processed by an external OCR service.

## Structure

```
docuflow/
├── apps/
│   ├── web/       # React + Vite + TypeScript frontend (port 5173)
│   └── api/       # Fastify + TypeScript backend (port 3001)
├── packages/
│   └── types/     # Shared TypeScript types
└── pnpm-workspace.yaml
```

## Prerequisites

- Node.js >= 20
- pnpm >= 9

## Getting started

```bash
pnpm install
pnpm dev
```

API runs on `http://localhost:3001`, web on `http://localhost:5173`.

## API endpoints

| Method | Path                | Description          |
|--------|---------------------|----------------------|
| GET    | /api/documents      | List all documents   |
| GET    | /api/documents/:id  | Get document by ID   |
| GET    | /mock/:filename     | Serve mock PDF files |
