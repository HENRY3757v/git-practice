# Evidence source notes

## Official source review — refreshed 29 August 2026

- Indian Patents Act, 1970: https://ipindia.gov.in/acts/patent-act-1970
  - Official IP India text currently states that the e-Version incorporates amendments through 01-08-2024.
  - The page exposes chapters and sections covering inventions not patentable, applications, publication/examination, anticipation, opposition and patent rights.
  - The prototype displays the version/effective-date caveat and must still ask users to verify later amendments or notifications before acting.

- CDSCO Traditional Drugs: https://www.cdsco.gov.in/opencms/opencms/en/Traditional_Drugs/
  - Official CDSCO page covering Ayurvedic, Siddha and Unani drugs under the Drugs and Cosmetics Act, 1940 framework.
  - Specific licensing, manufacturing, labelling and claims questions must be grounded in the applicable current provision/notification rather than the landing page alone.

- Ministry of Ayush: https://ayush.gov.in/
  - Official ministry portal and current authority anchor.
  - The landing page is not sufficient evidence for a specific legal conclusion, so the prototype marks it needs_review and prefers underlying official notifications/publications.

- Ayush in India 2024: https://ayush.gov.in/assets/pdf/whatsnew/Approved-Ayush-in-India-2024-Single.pdf
  - Official Ministry of Ayush publication describing AYUSH quality/licensing infrastructure, pharmacopoeial standards and Ayurveda Aahara context.

- Food Safety and Standards (Ayurveda Aahara) Regulations, 2022:
  https://fssai.gov.in/upload/notifications/2022/05/62789a20b54bdGazette_Notification_Ayurveda_Aahara_09_05_2022.pdf
  - Official FSSAI Gazette notification dated 05-05-2022.
  - FSSAI has also published later Ayurveda Aahara orders, so the app must display the 2022 version context and direct users to current FSSAI updates when relevant.

- National Biodiversity Authority ABS factsheet:
  https://nbaindia.org/uploaded/pdf/ABS_Factsheets_1.pdf
  - Official NBA factsheet explaining access-and-benefit-sharing concepts and the Biological Diversity Act context for biological resources and associated traditional knowledge.
  - The prototype uses this as a screening/triage source, not as a complete legal determination.

- WIPO, About the Traditional Knowledge Digital Library:
  https://www.wipo.int/meetings/en/2011/wipo_tkdl_del_11/about_tkdl.html
  - Public WIPO overview of TKDL and its role in prior-art searches by certain patent offices.
  - The prototype must present a pointer/search pathway and limitation rather than claim unrestricted or proprietary TKDL access.

- WIPO, PCT — The International Patent System:
  https://www.wipo.int/en/web/pct-system/
  - Official WIPO international patent-system anchor.
  - The prototype must treat PCT as an international route pointer and still direct users to relevant national/regional requirements.

## Implementation implications

- Every seeded knowledge record includes source URL, authority, jurisdiction, section/locator, version/date context, and verification status.
- Unverified source content is excluded from retrieval.
- Needs-review sources can be used only with medium/limited confidence; they can never produce a high-confidence evidence state.
- Source citations are represented both at answer level and section level using evidence IDs such as [E1].
- The application must abstain when evidence is missing or incomplete.
- The system must not fabricate legal rules, approvals, deadlines, source content, expert review outcomes, or proprietary database access.
