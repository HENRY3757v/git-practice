export type AppLanguage = "en" | "hi" | "bn";
export type UserJurisdiction = "india" | "international" | "both" | "unknown";
export type Intent = "ip" | "regulatory" | "abs" | "prior_art" | "general";
export type Confidence = "high" | "medium" | "low";

export type EvidenceItem = {
  id: number;
  documentId: number;
  title: string;
  section: string | null;
  content: string;
  keywords?: string;
  intent: Intent;
  jurisdiction: "india" | "international" | "both";
  language: string;
  sourceName: string;
  authority: string;
  url: string;
  versionLabel: string | null;
  effectiveDate: string | null;
  verificationStatus: "verified" | "needs_review" | "unverified";
};

export type RoutingResult = {
  intent: Intent;
  jurisdiction: UserJurisdiction;
  detectedLanguage: AppLanguage;
  rationale: string;
};

export type GroundedAnswer = {
  answer: string;
  confidence: Confidence;
  abstained: boolean;
  disclaimer: string;
  sections: Array<{
    key: "ip" | "regulatory" | "abs" | "prior_art";
    title: string;
    body: string;
    evidenceIds: number[];
  }>;
  evidence: EvidenceItem[];
};

export type FormulationInput = {
  productName: string;
  ingredients: string;
  dosageForm: string;
  intendedUse: string;
  manufacturingProcess: string;
  claims: string;
  classicalReference: "yes" | "no" | "unknown";
  newIngredient: "yes" | "no" | "unknown";
  biologicalResource: "yes" | "no" | "unknown";
  targetMarket: "india" | "international" | "both";
};

export type ClassificationResult = {
  category:
    | "Classical / Generic Medicine"
    | "Patent-or-Proprietary Medicine"
    | "New / Non-classical Drug"
    | "Phytopharmaceutical"
    | "Ayurveda-Aahar / Nutraceutical"
    | "Cosmetic";
  confidence: Confidence;
  explanation: string;
  checks: string[];
};
