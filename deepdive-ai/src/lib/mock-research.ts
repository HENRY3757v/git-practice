export type ResearchItem = { id: string; query: string; summary: string; date: string; sources: number; saved: boolean; topic: string };

export const researchItems: ResearchItem[] = [
  { id: "energy", query: "How is long-duration energy storage changing grid economics?", summary: "Cost declines, capacity markets, and new chemistries are reshaping the business case for multi-day storage.", date: "Today, 10:42", sources: 12, saved: true, topic: "Energy" },
  { id: "agents", query: "What are the most credible enterprise use cases for AI agents?", summary: "Early value concentrates in bounded workflows with clear escalation paths and measurable outcomes.", date: "Yesterday", sources: 9, saved: false, topic: "Technology" },
  { id: "supply", query: "Map the semiconductor supply chain risks through 2028", summary: "Advanced packaging, specialized materials, and geographic concentration remain the most persistent constraints.", date: "Sep 28", sources: 17, saved: true, topic: "Markets" },
  { id: "cities", query: "Which policies measurably reduce urban heat exposure?", summary: "Tree canopy, reflective surfaces, and targeted cooling access show the strongest combined evidence.", date: "Sep 24", sources: 14, saved: true, topic: "Climate" },
];

const sourceBank = [
  { title: "Evidence synthesis and emerging research priorities", domain: "nature.com", snippet: "A cross-disciplinary review of recent findings, limitations, and areas where evidence remains contested.", type: "Journal" },
  { title: "Market outlook: structural changes through 2030", domain: "iea.org", snippet: "Scenario-based analysis highlights adoption curves, policy constraints, and major economic sensitivities.", type: "Report" },
  { title: "What decision-makers should know now", domain: "hbr.org", snippet: "Practitioner interviews reveal where implementation is producing value and where expectations exceed reality.", type: "Analysis" },
  { title: "Global indicators and comparative dataset", domain: "worldbank.org", snippet: "Comparable indicators provide context across regions, income groups, and recent reporting periods.", type: "Dataset" },
];

export function makeResearch(query: string) {
  const normalized = query.toLowerCase();
  const angle = normalized.includes("ai") ? "adoption, governance, and measurable operational value" : normalized.includes("climate") || normalized.includes("energy") ? "economics, policy support, and deployment constraints" : "market signals, implementation evidence, and unresolved trade-offs";
  return {
    overview: `Available sample evidence suggests that ${query.replace(/[?.]+$/, "").toLowerCase()} is best understood through ${angle}. The direction of change is clearer than its pace: outcomes vary considerably by region, organizational readiness, and the quality of execution.`,
    findings: [
      { title: "Momentum is real, but uneven", body: "Leading indicators show sustained activity, while adoption and outcomes remain highly concentrated among well-resourced early movers.", confidence: "High confidence" },
      { title: "Economics depend on context", body: "Headline averages obscure large differences in infrastructure, regulation, implementation cost, and time to value.", confidence: "Moderate confidence" },
      { title: "Execution is the binding constraint", body: "Across the sample material, organizational capability and integration quality explain more variance than access alone.", confidence: "High confidence" },
    ],
    sources: sourceBank,
  };
}
