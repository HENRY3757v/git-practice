# SIH 2026 — IP-SAKTI Sahayak

## Slide 1 — IP-SAKTI Sahayak
**Evidence before assurance.**

A multilingual, evidence-led assistant for the responsible commercialization of Ayurvedic formulations.

**Team pitch:** Move from formulation idea to an auditable next step across IP, regulation, ABS, and prior art.

## Slide 2 — The problem
Ayurvedic innovators must make several linked decisions at once: what the formulation is, which regulatory path may apply, whether biological-resource obligations are triggered, whether the proposed claim is genuinely new, and when a specialist should review the dossier.

The current journey is fragmented across portals, PDFs, technical vocabulary, and informal interpretation. A fluent but uncited AI answer can increase risk instead of reducing it.

## Slide 3 — Who needs it
**Primary users:** Ayurveda startups, formulation researchers, MSMEs, university innovation cells, and incubators.

**Moment of need:** Before filing, licensing, launch, export, or making a new product claim.

**Design goal:** Give a first-pass map without pretending to replace a patent agent, regulatory professional, biodiversity authority, or other qualified expert.

## Slide 4 — The solution
IP-SAKTI Sahayak is a guided evidence desk with five moves:

1. Ask in English, Hindi, Bengali, or a mix.
2. Route the question by intent and jurisdiction.
3. Classify the formulation with targeted questions.
4. Retrieve curated authoritative passages.
5. Return structured guidance, citation cards, confidence, limits, and a human-review handoff.

## Slide 5 — The commercialization journey
**Question → Route → Classify → Retrieve → Explain → Escalate.**

The main Ask workspace covers IP and regulation while keeping ABS and prior-art/TKDL as distinct evidence sections. The classifier captures product facts, claims, ingredients, process, classical reference, biological-resource use, and target market.

## Slide 6 — RAG and evidence contract
Each indexed passage carries source name, issuing authority, public URL, section or locator, version/date context, intent, jurisdiction, language, and verification status.

Retrieval uses deterministic lexical scoring for a transparent prototype. The server-side LLM receives selected evidence only and returns a structured response. Incomplete provenance cannot receive high confidence.

## Slide 7 — Safety by design
The assistant uses a legal-information-only disclaimer and safe abstention when evidence is absent or incomplete. It distinguishes a public TKDL pointer from restricted database access and does not fabricate proprietary search results.

Security controls include authentication, admin-only source stewardship, Zod validation, backend-only secrets, rate limiting, and audit events for assistant, classification, escalation, and source actions.

## Slide 8 — Technical architecture
**Frontend:** React 19, Tailwind 4, responsive dashboard shell, multilingual controls, evidence cards, and accessible interaction states.

**Contract layer:** tRPC procedures provide typed question, classification, history, escalation, and admin-source workflows.

**Backend:** Express, Drizzle ORM, MySQL/TiDB schema, server-side LLM gateway, deterministic retrieval, source seeding, and audit persistence.

**Data model:** users, source documents, knowledge records, conversations, query history, classifications, escalation requests, and audit events.

## Slide 9 — Demo and impact
A founder can ask whether an Ayurvedic formulation using an Indian plant ingredient can be commercialized. The prototype detects IP plus regulatory and ABS implications, retrieves the Indian patent-law and public biodiversity pointers, explains what needs verification, and offers expert review.

**Expected impact:** Faster first-pass triage, better provenance discipline, clearer escalation, and a reusable knowledge layer for incubators and innovation cells.

## Slide 10 — Roadmap and limitations
**Now:** Prototype with curated public references, transparent citations, multilingual UI, persistent history, and admin corpus stewardship.

**Next:** Verified ingestion pipelines, stronger semantic retrieval, expert queue operations, jurisdiction-specific checklists, document upload and extraction, and evaluation against real anonymized dossiers.

**Limitation:** The prototype is an evidence-navigation and triage layer. It is not legal advice, a licensing decision, a patentability opinion, or an unrestricted TKDL search service.

## Closing line
**Make the next decision more defensible.**
