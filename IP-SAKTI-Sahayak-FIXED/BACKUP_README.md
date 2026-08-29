# IP-SAKTI Sahayak — Source Backup

This archive preserves the current IP-SAKTI Sahayak SIH 2026 prototype source tree. It contains application source code, configuration, database schema and migrations, RAG/LLM pipeline code, tests, documentation, and the presentation source. Existing project code and the original `README.md` are preserved unchanged; this backup guide is provided separately as `BACKUP_README.md`.

## Project structure

| Path | Purpose |
|---|---|
| `client/` | React frontend, routes, dashboard pages, reusable UI components, and browser entry files. |
| `server/` | Express/tRPC backend, database helpers, RAG pipeline, LLM orchestration, storage helpers, and Vitest tests. |
| `shared/` | Shared TypeScript contracts, constants, and error types used by the client and server. |
| `drizzle/` | MySQL/TiDB schema, relations, generated migrations, and migration metadata. |
| `docs/` | Phase 2 architecture/evidence-contract documentation and SIH presentation narrative. |
| `presentation/` | Editable HTML slide sources and presentation state for the SIH deck. |
| `scripts/` | Project maintenance scripts created during implementation. |
| `patches/` | Package patches used by the scaffold. |
| `source_notes.md` | Verified public-source research notes used to curate the prototype corpus. |
| `todo.md` | Project implementation backlog and completion history. |

The fixed archive intentionally excludes generated dependencies (`node_modules/`), build output (`dist/`), VCS internals (`.git/`), runtime logs (`.manus-logs/`), and platform checkpoint internals (`.manus/`). These are reproducible or environment-specific and are not application source.

## Technologies used

The prototype uses React 19, TypeScript, Vite, Tailwind CSS 4, shadcn-style Radix UI components, Wouter, TanStack Query, tRPC 11, Express 4, Drizzle ORM, MySQL/TiDB, Vitest, and the Manus runtime integrations for authentication, storage, and server-side LLM access. The presentation is maintained as editable HTML slide sources in `presentation/`.

## Install dependencies

Use Node.js 22 or a compatible modern Node.js release and pnpm. From the project root, run:

```bash
pnpm install
```

Do not commit or place production credentials in source files. The hosted Manus environment injects configured secrets and environment variables separately.

## Required environment variables

The full-stack template expects the following values. Runtime/platform-provided values are listed for completeness; their actual secrets must remain in the platform secret manager or local uncommitted environment configuration.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL/TiDB connection string. |
| `JWT_SECRET` | Session-cookie signing secret. |
| `VITE_APP_ID` | Manus OAuth application ID. |
| `OAUTH_SERVER_URL` | OAuth backend base URL. |
| `VITE_OAUTH_PORTAL_URL` | Frontend login portal URL. |
| `OWNER_OPEN_ID` | Owner identity used for admin promotion. |
| `OWNER_NAME` | Owner display name. |
| `BUILT_IN_FORGE_API_URL` | Server-side Manus built-in API gateway for LLM and related services. |
| `BUILT_IN_FORGE_API_KEY` | Server-only bearer credential for built-in APIs. |
| `VITE_FRONTEND_FORGE_API_URL` | Frontend-safe built-in API URL where required by the scaffold. |
| `VITE_FRONTEND_FORGE_API_KEY` | Frontend-safe built-in API credential supplied by the platform. |
| `VITE_ANALYTICS_ENDPOINT` | Optional analytics endpoint used by the browser entry file. |
| `VITE_ANALYTICS_WEBSITE_ID` | Analytics website identifier. |
| `VITE_APP_LOGO` | Optional platform-managed application logo. |
| `VITE_APP_TITLE` | Platform-managed application title. |

The server reads the supported runtime environment through `server/_core/env.ts`. Never hardcode credentials, OAuth cookies, database credentials, or LLM keys in the application.

## Run the frontend and backend

This scaffold serves the React frontend through the same development process as the Express backend. Start both together from the project root:

```bash
pnpm dev
```

The managed development server exposes the browser preview and serves tRPC under `/api/trpc`. For a production-like local run, build first and then start the bundled server:

```bash
pnpm build
pnpm start
```

Useful validation commands are:

```bash
pnpm check
pnpm test
```

## Run the RAG pipeline

The RAG implementation is in `server/rag.ts`. It performs intent and jurisdiction routing, formulation classification, deterministic retrieval over indexed knowledge records, citation-integrity checks, confidence scoring, safe abstention, and server-side LLM orchestration. The server procedures that call it are in `server/routers.ts`; database accessors are in `server/db.ts`.

The normal application path exercises the pipeline through the typed `ask` and `classify` procedures. The authoritative prototype corpus is seeded through `ensureSeedCorpus()` and is composed from public-source metadata and indexed passages. Admin users can add or update source metadata and indexed chunks through the `/admin` workspace. The pipeline does not claim unrestricted access to TKDL or other proprietary databases.

## Database and vector-database setup

The database is MySQL/TiDB, configured through `DATABASE_URL`. The schema is defined in `drizzle/schema.ts`, with generated SQL under `drizzle/`. To generate a new migration after a schema change, run:

```bash
pnpm drizzle-kit generate
```

Review the generated SQL and apply it through the project’s managed database migration workflow. For the existing prototype, the checked-in migrations create the users, source-document, knowledge-record, conversation, query-history, classification, escalation, and audit-event structures.

The current prototype does not require a separate vector database. Retrieval is intentionally transparent and deterministic: it scores indexed knowledge records using normalized multilingual lexical terms, keywords, intent, jurisdiction, verified-source status, and phrase matches. The evidence contract is structured so a future semantic/vector layer can be added without removing provenance and citation requirements. A future semantic/vector retrieval layer can be added without changing the evidence contract, provided provenance and citation integrity remain mandatory.

## Deployment instructions

The project is configured for the Manus managed full-stack runtime with Autoscale hosting. Create or update the project checkpoint after reviewing code, tests, and build output; the project’s configured auto-publish workflow publishes successful checkpoints. Ensure the required environment variables are configured in the platform secret manager, especially `DATABASE_URL`, `JWT_SECRET`, OAuth values, and the server-only built-in API key.

For a deployment readiness check, run:

```bash
pnpm check
pnpm test
pnpm build
```

The bundled server is produced at `dist/index.js` and the browser assets at `dist/public/`. Do not deploy `node_modules/`, `.git/`, runtime logs, or local secret files.

## Evidence and legal-information boundary

IP-SAKTI Sahayak presents source-grounded legal and regulatory information for triage. It is not legal advice, a patentability opinion, a licensing decision, or unrestricted access to a proprietary traditional-knowledge database. When evidence is missing or insufficient, the application is designed to surface that limitation and offer an expert-review path rather than fabricate an answer.

## Backup verification

The companion `BACKUP_FILE_MANIFEST.txt` lists every file included in the ZIP. The archive is extract-tested before delivery, and representative frontend, backend, schema, RAG, test, documentation, and presentation files are checked for presence after extraction.
