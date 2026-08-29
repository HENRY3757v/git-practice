import { describe, expect, it } from "vitest";
import type { EvidenceItem, FormulationInput } from "@shared/types";
import { classifyFormulation, routeQuestion, validateEvidence } from "./rag";

const evidence: EvidenceItem = {
  id: 1,
  documentId: 1,
  title: "Indian patent-law map",
  section: "Chapters II, III, IV and VI",
  content: "A source-grounded patent-law pointer.",
  intent: "ip",
  jurisdiction: "india",
  language: "en",
  sourceName: "The Patents Act, 1970",
  authority: "IP India",
  url: "https://ipindia.gov.in/pages/patents/chapter",
  versionLabel: "Official source page",
  effectiveDate: "Verify current amendments",
  verificationStatus: "verified",
};

const formulation: FormulationInput = {
  productName: "Classical Ashwagandha Churna",
  ingredients: "Ashwagandha root powder",
  dosageForm: "Powder",
  intendedUse: "Traditional wellness use",
  manufacturingProcess: "Milling and sieving",
  claims: "Classical Ayurvedic preparation",
  classicalReference: "yes",
  newIngredient: "no",
  biologicalResource: "yes",
  targetMarket: "india",
};

describe("routeQuestion", () => {
  it("routes ABS questions to India when the question mentions an Indian biological resource", () => {
    const result = routeQuestion("Does this use a biological resource sourced from India for access and benefit sharing?");
    expect(result.intent).toBe("abs");
    expect(result.jurisdiction).toBe("india");
    expect(result.detectedLanguage).toBe("en");
  });

  it("detects Bengali and routes a prior-art question", () => {
    const result = routeQuestion("এই ফর্মুলেশনটি কি আগে কোথাও নথিভুক্ত হয়েছে? prior art");
    expect(result.intent).toBe("prior_art");
    expect(result.detectedLanguage).toBe("bn");
  });
});

describe("classifyFormulation", () => {
  it("uses the classical reference and new-ingredient answers as a high-confidence signal", () => {
    const result = classifyFormulation(formulation);
    expect(result.category).toBe("Classical / Generic Medicine");
    expect(result.confidence).toBe("high");
    expect(result.checks.length).toBeGreaterThan(0);
  });

  it("keeps uncertain answers at low confidence", () => {
    const result = classifyFormulation({ ...formulation, classicalReference: "unknown", newIngredient: "unknown" });
    expect(result.confidence).toBe("low");
  });
});

describe("validateEvidence", () => {
  it("accepts evidence with provenance and section metadata", () => {
    expect(validateEvidence([evidence])).toBe(true);
  });

  it("rejects incomplete evidence so the assistant can abstain", () => {
    expect(validateEvidence([{ ...evidence, section: null }])).toBe(false);
    expect(validateEvidence([])).toBe(false);
  });
});

describe("routing safety", () => {
  it("does not silently assume India when jurisdiction is unknown", () => {
    const result = routeQuestion("What are the patent options for an Ayurvedic formulation?");
    expect(result.jurisdiction).toBe("unknown");
    expect(result.intent).toBe("ip");
  });

  it("respects an explicit international jurisdiction", () => {
    const result = routeQuestion("Can I seek international patent protection for this formulation?", "international");
    expect(result.jurisdiction).toBe("international");
    expect(result.intent).toBe("ip");
  });

  it("detects Bengali regulatory language", () => {
    const result = routeQuestion("এই পণ্যটি বিক্রি করার জন্য কী নিয়ম মানতে হবে?");
    expect(result.intent).toBe("regulatory");
    expect(result.detectedLanguage).toBe("bn");
  });
});

describe("classification safety", () => {
  it("does not overstate an ambiguous formulation", () => {
    const result = classifyFormulation({
      ...formulation,
      productName: "Herbal Blend",
      ingredients: "Several herbs",
      dosageForm: "Unknown",
      intendedUse: "Wellness",
      manufacturingProcess: "Unknown",
      claims: "General wellness",
      classicalReference: "unknown",
      newIngredient: "unknown",
    });
    expect(result.confidence).toBe("low");
    expect(result.explanation).toContain("not a legal determination");
  });
});
