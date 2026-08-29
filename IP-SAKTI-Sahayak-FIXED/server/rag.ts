import { invokeLLM, listLLMModels } from "./_core/llm";
import { getKnowledgeRecords, seedCorpus } from "./db";
import type {
  AppLanguage,
  ClassificationResult,
  Confidence,
  EvidenceItem,
  FormulationInput,
  GroundedAnswer,
  Intent,
  RoutingResult,
  UserJurisdiction,
} from "@shared/types";

const DISCLAIMER: Record<AppLanguage, string> = {
  en: "Information only — not legal advice. Verify current rules with the relevant authority or qualified professional before acting.",
  hi: "यह केवल सूचना है — कानूनी सलाह नहीं। कार्रवाई करने से पहले संबंधित प्राधिकरण या योग्य पेशेवर से वर्तमान नियमों की पुष्टि करें।",
  bn: "এটি শুধুমাত্র তথ্য — আইনি পরামর্শ নয়। কোনো পদক্ষেপের আগে সংশ্লিষ্ট কর্তৃপক্ষ বা যোগ্য পেশাদারের সঙ্গে বর্তমান নিয়ম যাচাই করুন।",
};

/**
 * Curated prototype sources. These are intentionally limited to official/public
 * authority anchors. The assistant must never imply that this list is a complete
 * legal corpus.
 */
const FALLBACK_SOURCES = [
  {
    name: "The Patents Act, 1970",
    authority: "Office of the Controller General of Patents, Designs & Trade Marks (IP India)",
    url: "https://ipindia.gov.in/acts/patent-act-1970",
    category: "ip" as const,
    jurisdiction: "india" as const,
    versionLabel: "e-Version incorporating amendments till 01-08-2024",
    effectiveDate: "IP India page updated in 2026; verify the latest amendment position before acting",
    verificationStatus: "verified" as const,
    description: "Official IP India text covering the Patents Act, including non-patentable subject matter, applications, examination, anticipation and patent rights.",
  },
  {
    name: "Drugs and Cosmetics Act, 1940 and Rules, 1945 — Traditional Drugs",
    authority: "Central Drugs Standard Control Organisation (CDSCO), Government of India",
    url: "https://www.cdsco.gov.in/opencms/opencms/en/Traditional_Drugs/",
    category: "regulatory" as const,
    jurisdiction: "india" as const,
    versionLabel: "Official Traditional Drugs reference page",
    effectiveDate: "Verify current rules, amendments and notifications",
    verificationStatus: "verified" as const,
    description: "Official CDSCO reference for Ayurvedic, Siddha and Unani drugs and the relevant statutory framework.",
  },
  {
    name: "Ministry of Ayush official portal",
    authority: "Ministry of Ayush, Government of India",
    url: "https://ayush.gov.in/",
    category: "regulatory" as const,
    jurisdiction: "india" as const,
    versionLabel: "Official ministry portal",
    effectiveDate: "Use the latest applicable notification or rule for a specific regulatory claim",
    verificationStatus: "needs_review" as const,
    description: "Authority landing page for AYUSH information and current ministry notices. Specific regulatory conclusions should use the applicable underlying notification or rule.",
  },
  {
    name: "Ayush in India 2024",
    authority: "Ministry of Ayush, Government of India",
    url: "https://ayush.gov.in/assets/pdf/whatsnew/Approved-Ayush-in-India-2024-Single.pdf",
    category: "standards" as const,
    jurisdiction: "india" as const,
    versionLabel: "Official 2024 publication",
    effectiveDate: "Publication context: 2024; verify later notifications",
    verificationStatus: "verified" as const,
    description: "Official ministry publication describing AYUSH drug quality, licensing infrastructure, pharmacopoeial standards and Ayurveda Aahara context.",
  },
  {
    name: "Food Safety and Standards (Ayurveda Aahara) Regulations, 2022",
    authority: "Food Safety and Standards Authority of India (FSSAI)",
    url: "https://fssai.gov.in/upload/notifications/2022/05/62789a20b54bdGazette_Notification_Ayurveda_Aahara_09_05_2022.pdf",
    category: "regulatory" as const,
    jurisdiction: "india" as const,
    versionLabel: "Gazette notification dated 05-05-2022",
    effectiveDate: "Check current FSSAI amendments/orders; FSSAI also published later Ayurveda Aahara orders",
    verificationStatus: "verified" as const,
    description: "Official FSSAI Gazette defining Ayurveda Aahara and its exclusions, categories and general requirements.",
  },
  {
    name: "Access and Benefit Sharing",
    authority: "National Biodiversity Authority, Government of India",
    url: "https://nbaindia.org/uploaded/pdf/ABS_Factsheets_1.pdf",
    category: "abs" as const,
    jurisdiction: "india" as const,
    versionLabel: "Official ABS factsheet",
    effectiveDate: "Verify current biodiversity law, rules and notifications before acting",
    verificationStatus: "verified" as const,
    description: "Official NBA factsheet explaining access-and-benefit-sharing concepts and the relationship with biological resources and associated traditional knowledge.",
  },
  {
    name: "About the Traditional Knowledge Digital Library",
    authority: "World Intellectual Property Organization (information courtesy of CSIR)",
    url: "https://www.wipo.int/meetings/en/2011/wipo_tkdl_del_11/about_tkdl.html",
    category: "prior_art" as const,
    jurisdiction: "both" as const,
    versionLabel: "WIPO information page",
    effectiveDate: "Historical WIPO reference; use as a pointer and verify current access arrangements",
    verificationStatus: "verified" as const,
    description: "Public WIPO overview of TKDL, its documentation role, and use by certain patent offices; not an open TKDL search database for this prototype.",
  },
  {
    name: "PCT — The International Patent System",
    authority: "World Intellectual Property Organization",
    url: "https://www.wipo.int/en/web/pct-system/",
    category: "ip" as const,
    jurisdiction: "international" as const,
    versionLabel: "Official WIPO PCT system page",
    effectiveDate: "Verify current PCT fees, participating offices and national-phase requirements",
    verificationStatus: "verified" as const,
    description: "Official WIPO international patent-system pointer. Country-specific requirements still require the relevant national or regional office.",
  },
];

type SeedRecord = Omit<typeof import("../drizzle/schema").knowledgeRecords.$inferInsert, "documentId"> & { sourceName: string };

const FALLBACK_RECORDS: SeedRecord[] = [
  {
    sourceName: "The Patents Act, 1970",
    title: "Indian patent-law map",
    section: "Chapters II–VI; sections 3–24",
    content: "IP India publishes the Patents Act, 1970 in an e-Version that incorporates amendments through 01-08-2024. The official text covers inventions not patentable, patent applications, publication and examination, opposition and anticipation. A commercialization review should identify the exact applicable provision and verify the latest amendment position before relying on it.",
    keywords: "patent patents patentability novelty inventive step application examination prior art anticipation inventions not patentable India IP",
    intent: "ip",
    jurisdiction: "india",
    language: "en",
    isActive: true,
  },
  {
    sourceName: "Drugs and Cosmetics Act, 1940 and Rules, 1945 — Traditional Drugs",
    title: "Ayurvedic, Siddha and Unani regulatory anchor",
    section: "Section 3 and Traditional Drugs reference",
    content: "The CDSCO Traditional Drugs page explains the statutory definition of Ayurvedic, Siddha or Unani drugs and identifies the relevant technical advisory and government-analyst framework. Product classification, licensing, manufacturing and claims should be checked against the applicable current provisions and notifications.",
    keywords: "Ayurvedic Siddha Unani ASU drug medicine licensing manufacturing regulation CDSCO rules",
    intent: "regulatory",
    jurisdiction: "india",
    language: "en",
    isActive: true,
  },
  {
    sourceName: "Ministry of Ayush official portal",
    title: "AYUSH authority pointer",
    section: "Official portal",
    content: "The Ministry of Ayush official portal is an authority starting point for AYUSH information and current notices. The prototype does not infer product approval or marketability from a landing page alone; specific claims should be tied to the applicable official notification, rule or publication.",
    keywords: "AYUSH Ayurveda Ministry official regulation notification authority rules",
    intent: "regulatory",
    jurisdiction: "india",
    language: "en",
    isActive: true,
  },
  {
    sourceName: "Ayush in India 2024",
    title: "AYUSH quality and Ayurveda Aahara context",
    section: "AYUSH drug quality and Ayurveda Aahara",
    content: "The Ministry of Ayush publication describes quality-assurance infrastructure for AYUSH drugs, including licensing and pharmacopoeial standards, and notes the Ayurveda Aahara regulatory framework developed with FSSAI. Use the underlying current rules and notifications for a product-specific determination.",
    keywords: "AYUSH quality licensing pharmacopoeia Ayurveda Aahara standards drug testing manufacturing",
    intent: "regulatory",
    jurisdiction: "india",
    language: "en",
    isActive: true,
  },
  {
    sourceName: "Food Safety and Standards (Ayurveda Aahara) Regulations, 2022",
    title: "Ayurveda Aahara definition and exclusions",
    section: "Regulation 2 — Definitions",
    content: "The FSSAI Gazette defines Ayurveda Aahara as food prepared in accordance with recipes, ingredients or processes described in authoritative Ayurveda books listed in Schedule A. The regulation excludes specified Ayurvedic drugs or proprietary Ayurvedic medicines and medicinal products, cosmetics, certain herbs under the Drugs and Cosmetics framework, metals-based Ayurvedic drugs or medicines, bhasma or pishti, and other notified ingredients.",
    keywords: "Ayurveda Aahara food nutraceutical FSSAI regulation 2022 definition exclusions Schedule A Schedule B",
    intent: "regulatory",
    jurisdiction: "india",
    language: "en",
    isActive: true,
  },
  {
    sourceName: "Food Safety and Standards (Ayurveda Aahara) Regulations, 2022",
    title: "Ayurveda Aahara general requirements",
    section: "Regulation 3 — General requirements",
    content: "The FSSAI Gazette states that Food Business Operators must formulate Ayurveda Aahara in accordance with the categories and requirements specified in Schedule B. Product classification should therefore distinguish food products from Ayurvedic drugs, proprietary medicines and cosmetics before drawing a regulatory pathway.",
    keywords: "Ayurveda Aahara FBO food business operator Schedule B requirements category regulation",
    intent: "regulatory",
    jurisdiction: "india",
    language: "en",
    isActive: true,
  },
  {
    sourceName: "Access and Benefit Sharing",
    title: "ABS review flag for biological resources",
    section: "ABS factsheet — biological resources and associated knowledge",
    content: "The National Biodiversity Authority factsheet explains access-and-benefit-sharing in the context of genetic resources and associated traditional knowledge and describes the Biological Diversity Act framework for utilization of biological resources and associated knowledge from India. The assistant should flag an ABS review when a commercialization question involves relevant biological resources or associated knowledge and should not decide the user's legal obligation from the factsheet alone.",
    keywords: "ABS access benefit sharing biological resources genetic resources traditional knowledge biodiversity NBA India Nagoya",
    intent: "abs",
    jurisdiction: "india",
    language: "en",
    isActive: true,
  },
  {
    sourceName: "About the Traditional Knowledge Digital Library",
    title: "TKDL and prior-art pointer",
    section: "WIPO TKDL facts",
    content: "WIPO describes TKDL as a digitized documentation project for publicly available traditional knowledge related to Ayurveda, Unani, Siddha and Yoga. The public WIPO page explains its relevance to prior-art searches by certain patent offices. This prototype uses the page as a pointer and does not claim unrestricted access to a proprietary TKDL search interface.",
    keywords: "TKDL traditional knowledge prior art patent examiner Ayurveda Unani Siddha Yoga WIPO",
    intent: "prior_art",
    jurisdiction: "both",
    language: "en",
    isActive: true,
  },
  {
    sourceName: "PCT — The International Patent System",
    title: "International patent route pointer",
    section: "PCT system overview",
    content: "WIPO describes the PCT as an international treaty administered by WIPO that provides a procedure for seeking patent protection in multiple countries through a single international application. The PCT route does not replace country-specific requirements, which must be checked with the relevant national or regional office.",
    keywords: "international patent PCT WIPO filing countries national phase global patent protection treaty",
    intent: "ip",
    jurisdiction: "international",
    language: "en",
    isActive: true,
  },
];

let corpusSeeded = false;

export async function ensureSeedCorpus() {
  if (corpusSeeded) return;
  await seedCorpus(FALLBACK_SOURCES, FALLBACK_RECORDS);
  corpusSeeded = true;
}

const tokenise = (value: string) =>
  value
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(/\s+/)
    .filter(token => token.length > 1);

const hasAny = (value: string, terms: string[]) => terms.some(term => value.includes(term));

const INTENT_TERMS: Record<Exclude<Intent, "general">, string[]> = {
  abs: [
    "abs", "access and benefit", "benefit sharing", "biodiversity", "biological resource", "biological material", "genetic resource", "traditional knowledge",
    "জীববৈচিত্র", "জৈব সম্পদ", "জৈব উপাদান", "লাভ ভাগাভাগি", "অ্যাক্সেস", "benefit sharing",
    "जैव विविधता", "जैविक संसाधन", "जैविक सामग्री", "लाभ साझा", "लाभ-साझाकरण", "जैव संसाधन",
  ],
  prior_art: [
    "prior art", "tkdl", "traditional knowledge", "already known", "documented", "novelty search", "earlier disclosure",
    "পূর্ববর্তী শিল্প", "আগে নথিভুক্ত", "আগে জানা", "টিকেডিএল", "পূর্ব জ্ঞান",
    "पूर्व कला", "पहले से ज्ञात", "दस्तावेजीकृत", "पूर्व कला खोज", "टीकेडीएल",
  ],
  regulatory: [
    "sell", "commercialize", "commercialise", "license", "licence", "manufacture", "label", "regulation", "regulatory", "ayurvedic medicine", "cosmetic", "nutraceutical", "food", "approval", "license", "licensing",
    "বিক্রি", "বাণিজ্যিক", "লাইসেন্স", "নিয়ম", "নিয়ম", "নিয়ন্ত্রক", "ঔষধ", "ওষুধ", "খাদ্য", "প্রসাধনী", "অনুমোদন",
    "बेचना", "व्यावसायिक", "लाइसेंस", "नियम", "विनियमन", "औषधि", "खाद्य", "कॉस्मेटिक", "अनुमोदन",
  ],
  ip: [
    "patent", "protect", "ip", "intellectual property", "novelty", "inventive step", "trademark", "copyright", "design", "geographical indication", "trade secret",
    "পেটেন্ট", "মেধাস্বত্ব", "বৌদ্ধিক সম্পত্তি", "নতুনত্ব", "ট্রেডমার্ক", "কপিরাইট", "ডিজাইন",
    "पेटेंट", "बौद्धिक संपदा", "नवीनता", "ट्रेडमार्क", "कॉपीराइट", "डिजाइन",
  ],
};

const JURISDICTION_TERMS = {
  india: ["india", "indian", "bharat", "ভারত", "ভারতে", "ভারতের", "ভারতীয়", "ভারতীয়", "भारत", "भारत में", "भारत के", "भारतीय"],
  international: ["international", "global", "outside india", "other country", "foreign", "pct", "worldwide", "বিদেশ", "আন্তর্জাতিক", "অন্য দেশ", "अंतरराष्ट्रीय", "विदेश", "दूसरे देश"],
};

export function routeQuestion(question: string, selectedJurisdiction: UserJurisdiction = "unknown"): RoutingResult {
  const normalized = question.toLocaleLowerCase();
  const bengali = /[\u0980-\u09ff]/.test(question);
  const hindi = /[\u0900-\u097f]/.test(question);
  const detectedLanguage: AppLanguage = bengali ? "bn" : hindi ? "hi" : "en";

  const intentScores = (Object.keys(INTENT_TERMS) as Array<Exclude<Intent, "general">>).map(intent => ({
    intent,
    score: INTENT_TERMS[intent].reduce((score, term) => score + (normalized.includes(term) ? 1 : 0), 0),
  }));
  intentScores.sort((a, b) => b.score - a.score);
  const intent: Intent = intentScores[0]?.score > 0 ? intentScores[0].intent : "general";

  const mentionsIndia = hasAny(normalized, JURISDICTION_TERMS.india);
  const mentionsInternational = hasAny(normalized, JURISDICTION_TERMS.international);
  let jurisdiction: UserJurisdiction = selectedJurisdiction;
  if (jurisdiction === "unknown") {
    jurisdiction = mentionsIndia && mentionsInternational
      ? "both"
      : mentionsInternational
        ? "international"
        : mentionsIndia
          ? "india"
          : "unknown";
  }

  return {
    intent,
    jurisdiction,
    detectedLanguage,
    rationale: `${intent === "general" ? "No single specialist intent was dominant" : `Matched ${intent} vocabulary`} · ${jurisdiction} jurisdiction · ${detectedLanguage} language`,
  };
}

function matchesJurisdiction(record: EvidenceItem, jurisdiction: UserJurisdiction) {
  if (jurisdiction === "unknown") return true;
  if (jurisdiction === "both") return record.jurisdiction === "both" || record.jurisdiction === "india" || record.jurisdiction === "international";
  return record.jurisdiction === jurisdiction || record.jurisdiction === "both";
}

function phraseBoost(query: string, searchable: string) {
  const phrases = [
    "prior art",
    "traditional knowledge",
    "access and benefit sharing",
    "biological resource",
    "ayurveda aahara",
    "patent application",
    "patent protection",
    "drug regulation",
  ];
  return phrases.reduce((score, phrase) => score + (query.includes(phrase) && searchable.includes(phrase) ? 4 : 0), 0);
}

export async function retrieveEvidence(question: string, routing: RoutingResult, limit = 6): Promise<EvidenceItem[]> {
  await ensureSeedCorpus();
  const stored = await getKnowledgeRecords();
  const records: EvidenceItem[] = stored.length > 0 ? stored : FALLBACK_RECORDS.map((record, index) => {
    const source = FALLBACK_SOURCES.find(item => item.name === record.sourceName)!;
    return {
      id: index + 1,
      documentId: index + 1,
      title: record.title,
      section: record.section ?? null,
      content: record.content,
      keywords: record.keywords ?? "",
      intent: record.intent,
      jurisdiction: record.jurisdiction,
      language: record.language,
      sourceName: source.name,
      authority: source.authority,
      url: source.url,
      versionLabel: source.versionLabel,
      effectiveDate: source.effectiveDate,
      verificationStatus: source.verificationStatus,
    };
  });

  const normalizedQuestion = question.toLocaleLowerCase();
  const queryTokens = new Set(tokenise(question));
  return records
    .filter(record => record.verificationStatus !== "unverified" && matchesJurisdiction(record, routing.jurisdiction))
    .map(record => {
      const searchableText = `${record.title} ${record.content} ${record.keywords ?? ""} ${record.sourceName} ${record.intent} ${record.jurisdiction}`.toLocaleLowerCase();
      const searchableTokens = tokenise(searchableText);
      const overlap = searchableTokens.reduce((score, token) => score + (queryTokens.has(token) ? 1 : 0), 0);
      const intentBoost = record.intent === routing.intent ? 7 : routing.intent === "general" ? 0 : -1;
      const jurisdictionBoost = record.jurisdiction === routing.jurisdiction ? 3 : record.jurisdiction === "both" ? 2 : 0;
      const verifiedBoost = record.verificationStatus === "verified" ? 2 : 0;
      const phrase = phraseBoost(normalizedQuestion, searchableText);
      return { record, score: overlap + intentBoost + jurisdictionBoost + verifiedBoost + phrase };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(limit, 8)))
    .map(item => item.record);
}

export function validateEvidence(evidence: EvidenceItem[]) {
  return evidence.length > 0 && evidence.every(item => Boolean(
    item.sourceName && item.authority && item.url && item.title && item.content && item.section !== null && item.verificationStatus !== "unverified",
  ));
}

const confidenceFor = (evidence: EvidenceItem[]) => {
  if (validateEvidence(evidence) && evidence.length >= 2 && evidence.every(item => item.verificationStatus === "verified")) return "high" as const;
  if (validateEvidence(evidence)) return "medium" as const;
  return "low" as const;
};

function defaultSectionEvidence(evidence: EvidenceItem[], key: GroundedAnswer["sections"][number]["key"]) {
  const intentMatches = evidence.filter(item => item.intent === key || (key === "ip" && item.intent === "prior_art"));
  const chosen = (intentMatches.length > 0 ? intentMatches : evidence).slice(0, 2);
  return chosen.map(item => item.id);
}

function fallbackAnswer(question: string, routing: RoutingResult, evidence: EvidenceItem[], language: AppLanguage): GroundedAnswer {
  const confidence = confidenceFor(evidence);
  const abstained = evidence.length === 0;
  const lowEvidence = "The available curated evidence is not sufficient for a reliable answer. Please consult the relevant authority or a qualified IP/regulatory professional for the next step.";
  const sections: GroundedAnswer["sections"] = [
    {
      key: "ip",
      title: "IP considerations",
      body: abstained ? lowEvidence : "Start with a claim-level novelty and inventive-step review against the applicable patent-law provisions and prior-art sources. The retrieved material is a research starting point, not a patentability opinion.",
      evidenceIds: defaultSectionEvidence(evidence, "ip"),
    },
    {
      key: "regulatory",
      title: "Regulatory considerations",
      body: abstained ? lowEvidence : "Confirm the product category, manufacturing pathway, labeling, claims, and target market against the current AYUSH, drug-regulatory and, where relevant, food-regulatory materials. A product cannot be classified from its name alone.",
      evidenceIds: defaultSectionEvidence(evidence, "regulatory"),
    },
    {
      key: "abs",
      title: "ABS review",
      body: "If biological resources sourced from India or associated traditional knowledge are involved, flag an access-and-benefit-sharing review. This assistant does not determine whether a filing, approval, intimation, or benefit-sharing obligation applies.",
      evidenceIds: defaultSectionEvidence(evidence, "abs"),
    },
    {
      key: "prior_art",
      title: "Prior-art / TKDL pointer",
      body: "Use the public TKDL description and relevant patent-search pathways as pointers. This prototype does not have proprietary or unrestricted TKDL search access and cannot certify that a formulation is new or unknown.",
      evidenceIds: defaultSectionEvidence(evidence, "prior_art"),
    },
  ];

  const languageLead = language === "hi" ? "यह एक evidence-led प्रारंभिक review है।" : language === "bn" ? "এটি একটি evidence-led প্রাথমিক review।" : "This is an evidence-led preliminary review.";
  return {
    answer: `${languageLead}\n\nQuestion routed as **${routing.intent}** for **${routing.jurisdiction}**. ${abstained ? lowEvidence : "The guidance below is limited to the retrieved source passages."}`,
    confidence,
    abstained,
    disclaimer: DISCLAIMER[language],
    sections,
    evidence,
  };
}

function asText(content: unknown) {
  return typeof content === "string" ? content : "";
}

function normalizeEvidenceIds(ids: unknown, evidence: EvidenceItem[], fallback: number[]) {
  const values = Array.isArray(ids) ? ids.filter(id => Number.isInteger(id) && Number(id) >= 1 && Number(id) <= evidence.length).map(Number) : [];
  return values.length > 0 ? Array.from(new Set(values)).slice(0, 4).map(index => evidence[index - 1]?.id).filter((id): id is number => typeof id === "number") : fallback;
}

export async function generateGroundedAnswer(question: string, routing: RoutingResult, evidence: EvidenceItem[], language: AppLanguage): Promise<GroundedAnswer> {
  const baseline = fallbackAnswer(question, routing, evidence, language);
  if (!validateEvidence(evidence)) return { ...baseline, abstained: true, confidence: "low" as const };

  try {
    const modelResponse = await listLLMModels();
    const model = modelResponse.data.find(item => item.id === "gpt-5-mini")?.id ?? modelResponse.data[0]?.id;
    if (!model) return baseline;

    const evidenceContext = evidence.map((item, index) => `[E${index + 1}] ${item.sourceName} — ${item.section ?? "Source page"}\n${item.content}\nURL: ${item.url}`).join("\n\n");
    const response = await invokeLLM({
      model,
      messages: [
        {
          role: "system",
          content: `You are IP-SAKTI Sahayak, an evidence-grounded research assistant for Ayurveda/IP commercialization. Answer ONLY from the supplied evidence. Never invent a rule, approval, deadline, source, TKDL access, or legal conclusion. Every substantive section must cite one or more supplied evidence IDs using the format [E1], [E2]. If the evidence is insufficient, say so and preserve the limitation. Return concise structured guidance in ${language === "hi" ? "Hindi" : language === "bn" ? "Bengali" : "English"}. The output is legal information, not legal advice.`,
        },
        {
          role: "user",
          content: `Question: ${question}\nRouted intent: ${routing.intent}\nJurisdiction: ${routing.jurisdiction}\n\nEvidence:\n${evidenceContext}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "grounded_answer",
          strict: true,
          schema: {
            type: "object",
            properties: {
              answer: { type: "string" },
              sections: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    key: { type: "string", enum: ["ip", "regulatory", "abs", "prior_art"] },
                    title: { type: "string" },
                    body: { type: "string" },
                    evidenceIds: { type: "array", items: { type: "integer" } },
                  },
                  required: ["key", "title", "body", "evidenceIds"],
                  additionalProperties: false,
                },
              },
            },
            required: ["answer", "sections"],
            additionalProperties: false,
          },
        },
      },
    });

    const text = asText(response.choices?.[0]?.message?.content);
    if (!text) return baseline;
    const parsed = JSON.parse(text) as {
      answer: string;
      sections: Array<{ key: string; title: string; body: string; evidenceIds?: unknown }>;
    };
    const allowedKeys = ["ip", "regulatory", "abs", "prior_art"] as const;
    const validSections = parsed.sections
      .filter(section => (allowedKeys as readonly string[]).includes(section.key))
      .map(section => {
        const key = section.key as GroundedAnswer["sections"][number]["key"];
        const fallbackIds = defaultSectionEvidence(evidence, key);
        return {
          key,
          title: section.title,
          body: section.body,
          evidenceIds: normalizeEvidenceIds(section.evidenceIds, evidence, fallbackIds),
        };
      });

    const answerHasCitation = /\[E\d+\]/i.test(parsed.answer || "");
    const answer = parsed.answer && answerHasCitation
      ? parsed.answer
      : `${parsed.answer || baseline.answer}\n\nEvidence: ${evidence.slice(0, 3).map((_, index) => `[E${index + 1}]`).join(" ")}`;

    return {
      ...baseline,
      answer,
      sections: validSections.length > 0 ? validSections : baseline.sections,
    };
  } catch (error) {
    console.warn("[RAG] LLM unavailable or response invalid; returning deterministic grounded response", error);
    return baseline;
  }
}

const categoryNames: ClassificationResult["category"][] = [
  "Classical / Generic Medicine",
  "Patent-or-Proprietary Medicine",
  "New / Non-classical Drug",
  "Phytopharmaceutical",
  "Ayurveda-Aahar / Nutraceutical",
  "Cosmetic",
];

export function classifyFormulation(input: FormulationInput): ClassificationResult {
  const combined = `${input.productName} ${input.ingredients} ${input.dosageForm} ${input.intendedUse} ${input.manufacturingProcess} ${input.claims}`.toLocaleLowerCase();
  const checks: string[] = [];
  const scores: Record<ClassificationResult["category"], number> = {
    "Classical / Generic Medicine": 0,
    "Patent-or-Proprietary Medicine": 1,
    "New / Non-classical Drug": 0,
    "Phytopharmaceutical": 0,
    "Ayurveda-Aahar / Nutraceutical": 0,
    "Cosmetic": 0,
  };

  if (hasAny(combined, ["cosmetic", "skin", "hair", "beauty", "personal care", "topical appearance", "প্রসাধনী", "त्वचा", "बाल", "कॉस्मेटिक"])) {
    scores["Cosmetic"] += 6;
    checks.push("Cosmetic or appearance-oriented language detected");
  }
  if (hasAny(combined, ["food", "beverage", "nutrition", "nutraceutical", "aahar", "wellness snack", "খাদ্য", "পানীয়", "পুষ্টি", "खाद्य", "पेय", "पोषण"])) {
    scores["Ayurveda-Aahar / Nutraceutical"] += 6;
    checks.push("Food, nutrition, or nutraceutical language detected");
  }
  if (hasAny(combined, ["phytopharmaceutical", "standardized botanical", "plant extract clinical", "phytochemical", "ফাইটোফার্মাসিউটিক্যাল"])) {
    scores["Phytopharmaceutical"] += 7;
    checks.push("Phytopharmaceutical marker detected");
  }
  if (input.classicalReference === "yes") {
    scores["Classical / Generic Medicine"] += 5;
    checks.push("Classical reference reported");
  }
  if (input.classicalReference === "no") scores["Patent-or-Proprietary Medicine"] += 2;
  if (input.newIngredient === "yes") {
    scores["New / Non-classical Drug"] += 6;
    checks.push("New ingredient or process reported");
  }
  if (input.newIngredient === "no") scores["Classical / Generic Medicine"] += 2;
  if (hasAny(combined, ["novel", "new molecule", "new ingredient", "synthetic active", "নতুন উপাদান", "नया घटक"])) {
    scores["New / Non-classical Drug"] += 3;
    checks.push("Novel/new-ingredient language detected");
  }
  if (input.biologicalResource === "yes") checks.push("Biological-resource involvement reported; ABS screening may be relevant");
  if (input.targetMarket !== "india") checks.push("International target market selected; country-specific rules require separate verification");

  const ranked = categoryNames
    .map(category => ({ category, score: scores[category] }))
    .sort((a, b) => b.score - a.score);
  const top = ranked[0];
  const second = ranked[1];
  let confidence: Confidence = "medium";
  if (top.score <= 1 || top.score === second.score) confidence = "low";
  else if (top.score >= 7 && top.score - second.score >= 2 && input.classicalReference !== "unknown" && input.newIngredient !== "unknown") confidence = "high";
  else if (input.classicalReference === "unknown" || input.newIngredient === "unknown") confidence = "low";

  if (checks.length === 0) checks.push("No decisive marker was found; proprietary formulation remains a provisional working label");
  const category = top.score > 1 ? top.category : "Patent-or-Proprietary Medicine";
  return {
    category,
    confidence,
    checks,
    explanation: `Provisional classification based on the submitted questionnaire. Verify the category against the current applicable AYUSH, drug, food or cosmetic requirements for the target market (${input.targetMarket}). This is not a legal determination.`,
  };
}

export { DISCLAIMER };
