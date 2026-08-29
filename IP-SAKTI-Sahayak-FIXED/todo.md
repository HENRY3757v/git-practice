# Project TODO

- [x] Establish the IP-SAKTI Sahayak editorial visual system: cream canvas, high-contrast typography, Didone serif display type, lighter serif subheads, geometric rules, spaced sans-serif metadata, generous whitespace, and asymmetrical responsive layout.
- [x] Build the authenticated dashboard shell with navigation for Ask, Formulation Classifier, ABS Helper, Prior-Art/TKDL Pointer, Query History, and Expert Review.
- [x] Implement English, Hindi, and Bengali interface language switching with localized labels, helper text, disclaimers, and response presentation.
- [x] Add query intake with intent routing for IP, regulatory, ABS, and prior art, plus jurisdiction routing for India, international, both, and unknown.
- [x] Add targeted formulation questionnaire and six-category classification: classical/generic medicine, patent-or-proprietary medicine, new/non-classical drug, phytopharmaceutical, Ayurveda-aahar/nutraceutical, and cosmetic.
- [x] Add authoritative-source data model for documents, source metadata, sections, versions, dates, jurisdictions, authorities, and indexed knowledge records.
- [x] Implement evidence retrieval over the curated corpus with deterministic lexical/vector-style scoring suitable for the prototype.
- [x] Integrate server-side LLM orchestration for structured source-grounded answers, multilingual responses, classification, confidence, and abstention.
- [x] Implement exact citation cards showing source name, section, authority, version/date, and URL where available.
- [x] Add distinct ABS guidance and prior-art/TKDL pointer sections with permission-aware limitations and no fabricated proprietary access.
- [x] Add confidence levels and safe abstention when authoritative evidence is insufficient or the query is out of scope.
- [x] Display legal-information-only disclaimer consistently and prevent the UI from presenting legal advice.
- [x] Persist conversations, query history, classifications, source records, indexed knowledge records, escalation requests, and audit events in the database.
- [x] Implement human expert-review request workflow with user details, question context, retrieved evidence, AI response, status, and admin review queue.
- [x] Add backend-only secret handling, input validation, request rate limiting, authentication, role-based admin procedures, and audit logging.
- [x] Add admin knowledge-source management for creating, editing, activating, and versioning source records and knowledge chunks.
- [x] Seed a transparent prototype corpus of authoritative public references without fabricating sources, claims, reviews, or TKDL access.
- [x] Create the complete demo journey: commercialization question → routing → formulation questions → classification → evidence retrieval → cited structured answer → confidence → escalation.
- [x] Add Vitest coverage for routing, classification, retrieval, citation validation, abstention, persistence, authorization, and escalation behavior.
- [x] Run type checks, tests, and production build; verify the responsive UI at desktop and mobile widths.
- [x] Create the final checkpoint and provide the hosted preview plus project version to the user.
- [x] Prepare the SIH presentation content and slide deck covering problem, users, solution, architecture, RAG/citation workflow, demo journey, security, impact, roadmap, and limitations.

## Phase 2 design deliverables

- [x] Document the domain model and relationships for source documents, knowledge records, conversations, query history, classifications, escalations, and audit events.
- [x] Document the evidence contract for provenance, section metadata, version/date, verification state, confidence, citations, and safe abstention.
- [x] Document the editorial interface system, navigation hierarchy, responsive behavior, multilingual presentation, and legal-information disclaimer treatment.

## Admin management follow-up

- [x] Add admin UI for editing existing source records, including version/effective-date metadata updates and save flows.
- [x] Implement admin update/toggle procedures and UI for knowledge chunks (edit content/section/keywords, activate/deactivate).
- [x] Add persistence/tests for admin knowledge management flows covering source updates, source activation, chunk updates, and chunk activation state.

## Admin wiring verification

- [x] Wire `AdminSourceRow` into `AdminPage` so admins can edit existing sources and save version/effective-date changes.
- [x] Fetch `sources.adminKnowledgeList` in `AdminPage` and render `AdminKnowledgeRow` with edit and activation actions.
- [x] Add Vitest coverage for successful source updates, source activation toggles, knowledge-chunk updates, and knowledge-chunk activation toggles.
