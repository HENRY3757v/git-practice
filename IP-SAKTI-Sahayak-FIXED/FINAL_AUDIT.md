# IP-SAKTI Sahayak — Final Fix/Audit Report

Date: 29 August 2026

## What was fixed

### 1. Evidence corpus refreshed
- Updated the Indian Patents Act source to the current IP India Act page and refreshed its version context.
- Replaced the older CDSCO PDF anchor with the current CDSCO Traditional Drugs reference page.
- Added official Ministry of Ayush publication context.
- Added the official FSSAI Ayurveda Aahara Regulations, 2022 source.
- Added the official National Biodiversity Authority ABS factsheet.
- Kept WIPO TKDL and WIPO PCT as the international/prior-art anchors.

### 2. Retrieval improvements
The prototype still uses transparent deterministic retrieval, but scoring is stronger:
- query token overlap
- keyword matching
- intent boost
- jurisdiction boost
- verified-source boost
- phrase matching
- multilingual intent vocabulary
- stricter jurisdiction handling

The project does not claim to have a proprietary vector database or unrestricted TKDL access.

### 3. Jurisdiction safety
The previous router could silently default an unspecified query to India. It now returns `unknown` when no jurisdiction is stated and only infers India/international when the question contains corresponding signals.

Explicit user-selected jurisdiction still takes precedence.

### 4. Multilingual routing
Added common Hindi and Bengali terms for IP, regulatory, ABS and prior-art intent detection, while preserving English detection.

### 5. Citation traceability
Grounded sections now carry evidence IDs. The LLM contract requests `[E1]`, `[E2]` style evidence references and the UI renders clickable evidence chips for each section.

If the model omits citations, the server supplies deterministic evidence references rather than returning an uncited structured answer.

### 6. Seed reliability
Corpus seeding is now idempotent at the source/record level. Existing databases are no longer treated as permanently complete just because one source already exists; missing new sources and records can be added on later startup.

### 7. Formulation classification
The classifier now uses scored signals from:
- product/use language
- dosage/product description
- classical-reference answer
- new-ingredient/process answer
- claims
- biological-resource flag
- target market

Ambiguous cases are explicitly kept at low confidence and the output remains a provisional classification, not a legal determination.

### 8. Test coverage
Added tests for:
- no silent India default when jurisdiction is unknown
- explicit international routing
- Bengali regulatory routing
- ambiguous classification safety

## Validation performed

- TypeScript transpilation/syntax validation completed successfully for all changed TypeScript/TSX files.
- The repository could not run the full `pnpm check`, `pnpm test`, or `pnpm build` commands in this isolated environment because pnpm/dependencies were not installed and the environment could not download pnpm from the npm registry.
- No dependency was added, so the checked-in lockfile remains unchanged.

## Important deployment note

Before publishing the changed project in Manus, run:

```text
pnpm install
pnpm check
pnpm test
pnpm build
```

Then perform the hosted smoke tests for IP, Regulatory, ABS and Prior Art/TKDL, including India, International, English, Hindi and Bengali flows.

## Safety / evidence boundary

The application is intentionally source-grounded and does not claim to provide legal advice, a patentability opinion, a licensing decision, or unrestricted proprietary TKDL access. If evidence is insufficient, the assistant should abstain and offer expert review.
