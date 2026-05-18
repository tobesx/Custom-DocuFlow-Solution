# DocuFlow — Claude Code Context

## What is this project?
DocuFlow is a document review frontend for Dossche Mills.
It allows users to review purchase orders (bestelbonnen) that have been processed by an external OCR service.
The frontend displays the document with bounding boxes overlaid on detected fields, alongside the extracted data.
Users can review, correct, and approve documents before they are exported to the ERP system.

## What is OUT of scope
- OCR processing (done by external party)
- Bounding box detection (done by external party)
- ERP integration (future phase)

## Architecture
- Monorepo with pnpm workspaces
- apps/web — React + Vite + TypeScript frontend
- apps/api — Fastify + TypeScript backend (BFF)
- packages/types — shared TypeScript types

## Key concepts
- `BoundingBox` — relative coordinates (0–1) for x, y, width, height. Page is 0-indexed.
- `fieldKey` — dot-notation string linking a bounding box to a data field (e.g. "customer.name", "orderLines[0]")
- `activeFieldKey` — Zustand global state for two-way hover sync between bounding boxes and data fields
- `DocumentStatus` — pending → in_review → approved → exported

## Tech stack
- Frontend: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Zustand, TanStack Query
- Backend: Fastify, TypeScript, Prisma, PostgreSQL
- Hosting: Railway (frontend + backend + PostgreSQL + MinIO)
- Package manager: pnpm

## Coding conventions
- Use TypeScript strictly — no `any`
- All shared types live in `packages/types`
- API routes are prefixed with `/api`
- Components go in `apps/web/src/components/`
- Use Tailwind for all styling — no custom CSS files unless absolutely necessary
- Use shadcn/ui components where possible

## Current status
PoC phase. Mock data is used instead of a real database.
The mock PDF and extracted data represent a real purchase order format from a previous project.
