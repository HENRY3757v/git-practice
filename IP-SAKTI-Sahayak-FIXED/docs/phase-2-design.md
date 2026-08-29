# IP-SAKTI Sahayak — Phase 2 Design

## Design intent

IP-SAKTI Sahayak is designed as an evidence desk rather than a generic chatbot. Its central interaction is a commercialization review: a user asks a question, the system routes it by intent and jurisdiction, retrieves source passages, generates a constrained explanation, and shows the provenance and limits of that explanation.

> **Product promise:** Do not just answer. Show why.

The interface therefore treats uncertainty, source age, jurisdiction, and expert escalation as first-class product signals. The assistant provides **legal information**, never a legal conclusion or legal advice.

## 1. Domain model

The relational model uses eight product tables around the scaffold's authenticated `users` table. Foreign keys are represented as stable integer identifiers in the prototype schema; the application layer keeps the relationships explicit and avoids storing document bytes in the database.

| Entity | Purpose | Key fields | Relationship |
|---|---|---|---|
| `users` | Authenticated identity and role | `id`, `openId`, `role` | One user can own many queries, classifications, and escalation requests. |
| `source_documents` | Provenance-level record for an authoritative source | `name`, `authority`, `url`, `category`, `jurisdiction`, `versionLabel`, `effectiveDate`, `verificationStatus`, `isActive` | One source document has many indexed knowledge records. |
| `knowledge_records` | Searchable evidence passage | `documentId`, `title`, `section`, `content`, `keywords`, `intent`, `jurisdiction`, `language`, `isActive` | Each record belongs to one source document and is retrieved for a query. |
| `conversations` | A saved workspace thread | `userId`, `title`, `language`, `jurisdiction` | One conversation contains many query-history records. |
| `query_history` | Immutable record of a routed question and answer | `question`, `intent`, `jurisdiction`, `answer`, `confidence`, `evidenceJson`, `routingJson` | Links the user-visible response to its evidence trail. |
| `classification_records` | Provisional formulation classification | `productName`, `inputJson`, `category`, `confidence`, `explanation` | May link to a query and authenticated user. |
| `escalation_requests` | Human-review handoff | `question`, `contact`, `contextJson`, `status` | May link to the originating query and user. |
| `audit_events` | Security and stewardship trail | `action`, `entityType`, `entityId`, `metadataJson`, `createdAt` | Records sensitive actions such as asking, classifying, escalating, or adding sources. |

### Data lifecycle

A user question is validated at the procedure boundary, routed into an `Intent` and `UserJurisdiction`, matched against active knowledge records, passed to the server-side model only with the selected evidence, and then persisted as `query_history`. The answer carries the selected evidence objects so the UI can render citation cards without reconstructing provenance from generated text.

A source can exist without being used for a confident answer. `verificationStatus` distinguishes `verified`, `needs_review`, and `unverified`; retrieval excludes `unverified` records and confidence scoring degrades when metadata is incomplete or a source still needs review.

## 2. Shared evidence contract

The client and server share the following conceptual contract.

| Field | Required | Meaning | Safety rule |
|---|---:|---|---|
| `id` / `documentId` | Yes | Stable record identifiers | Never use generated citation labels as a substitute for IDs. |
| `sourceName` | Yes | Human-readable source title | Must link to the original source URL. |
| `authority` | Yes | Issuing institution | Show in every citation card. |
| `url` | Yes | Public source link | Open in a new tab; do not imply that the URL alone proves current applicability. |
| `section` | Yes for confident output | Chapter, section, page, or source-page locator | Missing section metadata prevents high-confidence output. |
| `versionLabel` | Recommended | Edition, filename cue, or portal version | Display beside the source title. |
| `effectiveDate` | Recommended | Effective date or verification caveat | Prefer an explicit “verify current amendments” note when the source is old or unclear. |
| `verificationStatus` | Yes | Provenance state | `unverified` content is excluded from confident retrieval. |
| `jurisdiction` | Yes | India, international, or both | Retrieval must match the selected jurisdiction or a source marked `both`. |
| `intent` | Yes | IP, regulatory, ABS, prior art, or general | Intent score boosts matching records but does not replace evidence review. |
| `content` | Yes | Short evidence passage | The LLM prompt receives only selected passages and their metadata. |

### Response contract

`GroundedAnswer` contains a plain-language `answer`, four named sections (`ip`, `regulatory`, `abs`, `prior_art`), a `confidence` value, an `abstained` flag, the localized disclaimer, and the exact `evidence` array used for the response. The four sections remain visible even when the user asks a narrower question because the commercialization journey should expose adjacent dependencies such as ABS and prior art.

Confidence is deliberately conservative:

| Level | Prototype condition | UI treatment |
|---|---|---|
| High | At least two evidence items, complete provenance metadata, and all selected sources verified | Green confidence pill; answer can summarize the evidence but still includes the disclaimer. |
| Medium | Evidence exists but includes a source needing review or a narrower evidence set | Amber confidence pill; surface a verification caveat. |
| Low | Evidence is absent or citation metadata is incomplete | Rose warning; safe abstention text and expert-review pathway. |

The citation validator checks `sourceName`, `authority`, `url`, `title`, `content`, `section`, and verification state before allowing a response to be treated as grounded. The validator is intentionally strict: a fluent answer without locatable provenance is not considered a successful answer.

## 3. Routing model

Routing has two independent axes.

| Axis | Values | Prototype behavior |
|---|---|---|
| Intent | IP, regulatory, ABS, prior art, general | Keyword and phrase signals provide deterministic routing; the selected intent receives a retrieval boost. |
| Jurisdiction | India, international, both, unknown | User selection wins; otherwise language and question signals infer a cautious default, with India as the initial review context. |

The system detects Bengali and Devanagari script at the boundary, while the model receives a normalized evidence prompt and is asked to return the response in English, Hindi, or Bengali. Citations remain attached to original source records and are not translated into invented source names.

## 4. Editorial interface system

The visual system uses a cream paper field, high-contrast near-black ink, a large Bodoni-style display face, DM Serif Text for supporting editorial copy, and Manrope for metadata and controls. Thin rules, small uppercase labels, rounded evidence cards, and generous whitespace create an editorial research-desk atmosphere rather than a conventional SaaS dashboard.

The layout is asymmetric by design. A persistent dark sidebar anchors the workspace on desktop, while the main canvas uses a wide headline and a two-column interaction split: question on the left, evidence trail on the right. At mobile widths, the sidebar becomes a compact sticky header and the two-column layout stacks without hiding the evidence trail.

| Surface | Role | Content |
|---|---|---|
| Ask Sahayak | Primary journey | Chat input, language, jurisdiction, suggested prompts, structured answer, four evidence sections, citations. |
| Formulation class | Product facts | Ten-field dossier, six-category provisional output, checks, confidence, and limitation note. |
| ABS helper | Dependency screening | Dedicated prompt context and ABS section in every returned answer. |
| Prior art / TKDL | Evidence pointer | Dedicated prompt context, public TKDL explanation, and restriction-aware wording. |
| Query history | Continuity | Authenticated saved questions, routing labels, confidence, and answer preview. |
| Expert review | Human handoff | Validated question, contact route, context, status, and review-protocol explanation. |
| Admin sources | Stewardship | Source list with verification state plus a protected add-source flow. |

### Interaction principles

The design uses micro-interactions only where they clarify state: active navigation, hover elevation on evidence cards, focus rings, compact loading indicators, and responsive stacking. It respects reduced-motion preferences. Empty states explain what will happen next instead of presenting blank panels. Every action that could create durable data communicates whether the workspace is saved or remains a demo session.

## 5. Evidence corpus decisions

The initial corpus is intentionally small and transparent. It contains public source pointers and cautious passages for Indian patent law, CDSCO drug regulation, the Ministry of Ayush authority portal, WIPO's public TKDL overview, WIPO's PCT system, and the National Biodiversity Authority portal. Source-specific claims are restricted to what the reviewed page or document supports.

The prototype must not claim access to a proprietary or unrestricted TKDL search database. WIPO's public overview describes TKDL's role and access by certain patent offices, so the product labels the feature a **TKDL pointer** and directs users to further authorized verification rather than pretending to search a restricted system.[1]

The IP India page used for the patent-law map states that its e-Version incorporates amendments and is updated through 23 June 2017; the app therefore shows that source context and asks users to verify later amendments before acting.[2] CDSCO's public PDF is used as a regulatory anchor for Ayurvedic, Siddha, and Unani drug material, while the product avoids turning a source pointer into a licensing determination.[3]

## 6. Security and failure boundaries

The prototype keeps LLM credentials on the server, validates all procedure inputs with Zod, rate-limits assistant and escalation mutations, gates source-management procedures with the scaffold's admin role, and creates audit events for assistant, classification, escalation, and source actions. It stores contact data only in the escalation record needed for the requested human handoff.

The database may be unavailable in local or preview conditions. The assistant therefore has a deterministic fallback corpus and response path, but it still preserves the same evidence contract and refuses to present incomplete evidence as high confidence. This makes the demo inspectable without weakening the core safety behavior.

## References

[1]: https://www.wipo.int/meetings/en/2011/wipo_tkdl_del_11/about_tkdl.html "WIPO — About the Traditional Knowledge Digital Library"
[2]: https://ipindia.gov.in/pages/patents/chapter "IP India — The Patents Act, 1970"
[3]: https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/acts_rules/2016DrugsandCosmeticsAct1940Rules1945.pdf "CDSCO — The Drugs and Cosmetics Act, 1940 and Rules, 1945"
