import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import type { AppLanguage, ClassificationResult, Confidence, FormulationInput, GroundedAnswer, Intent, UserJurisdiction } from "@shared/types";
import { ArrowUpRight, Check, ChevronRight, CircleAlert, Clock3, FileCheck2, FileText, Globe2, Info, Leaf, Loader2, LockKeyhole, Search, Send, ShieldCheck, Sparkles, Sprout, Waypoints } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Streamdown } from "streamdown";

const languageCopy: Record<AppLanguage, Record<string, string>> = {
  en: {
    ask: "Ask Sahayak",
    title: "Evidence before assurance.",
    intro: "A calm, source-grounded desk for bringing an Ayurvedic formulation from idea to responsible commercialization.",
    question: "Your question",
    jurisdiction: "Jurisdiction",
    send: "Send question",
    disclaimer: "Legal information only. Not legal advice.",
    answer: "Grounded answer",
    sources: "Sources",
    noAnswer: "Your answer will appear here with an evidence trail.",
    confidence: "Confidence",
  },
  hi: {
    ask: "सहायक से पूछें",
    title: "आश्वासन से पहले प्रमाण।",
    intro: "आयुर्वेदिक फॉर्मूलेशन को विचार से जिम्मेदार व्यावसायीकरण तक ले जाने के लिए एक स्रोत-आधारित डेस्क।",
    question: "आपका प्रश्न",
    jurisdiction: "क्षेत्राधिकार",
    send: "प्रश्न भेजें",
    disclaimer: "केवल कानूनी जानकारी। कानूनी सलाह नहीं।",
    answer: "स्रोत-आधारित उत्तर",
    sources: "स्रोत",
    noAnswer: "आपका उत्तर यहां प्रमाण के साथ दिखाई देगा।",
    confidence: "विश्वसनीयता",
  },
  bn: {
    ask: "সহায়ককে জিজ্ঞেস করুন",
    title: "আশ্বাসের আগে প্রমাণ।",
    intro: "আয়ুর্বেদিক ফর্মুলেশনকে ধারণা থেকে দায়িত্বশীল বাণিজ্যিকীকরণে নিতে একটি source-grounded desk।",
    question: "আপনার প্রশ্ন",
    jurisdiction: "অধিক্ষেত্র",
    send: "প্রশ্ন পাঠান",
    disclaimer: "শুধুমাত্র আইনি তথ্য। আইনি পরামর্শ নয়।",
    answer: "Source-grounded উত্তর",
    sources: "উৎস",
    noAnswer: "আপনার উত্তর এখানে evidence trail সহ দেখা যাবে।",
    confidence: "Confidence",
  },
};

const jurisdictionLabels: Record<UserJurisdiction, string> = {
  india: "India",
  international: "International",
  both: "India + international",
  unknown: "Let Sahayak detect",
};

const confidenceTone: Record<Confidence, string> = {
  high: "border-emerald-900/15 bg-emerald-50 text-emerald-900",
  medium: "border-amber-900/15 bg-amber-50 text-amber-900",
  low: "border-rose-900/15 bg-rose-50 text-rose-900",
};

const intentLabels: Record<Intent, string> = {
  ip: "IP & patent pathway",
  regulatory: "Regulatory pathway",
  abs: "ABS review",
  prior_art: "Prior art / TKDL",
  general: "General orientation",
};

const routePills = [
  { label: "IP", icon: ShieldCheck, tone: "bg-[#e9eef8] text-[#2a456e]" },
  { label: "Regulatory", icon: FileCheck2, tone: "bg-[#f3e9d6] text-[#765323]" },
  { label: "ABS", icon: Sprout, tone: "bg-[#e3eee3] text-[#3c6846]" },
  { label: "Prior art", icon: Search, tone: "bg-[#eee6f3] text-[#654e79]" },
];

function AppHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  const { user } = useAuth();
  return (
    <header className="mb-8 flex flex-col gap-6 border-b border-ink/15 pb-7 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="mb-4 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-ink/50">
          <span className="h-px w-8 bg-ink/40" />
          {eyebrow}
        </div>
        <h1 className="display-title max-w-4xl text-5xl leading-[0.9] text-ink sm:text-6xl lg:text-8xl">{title}</h1>
        <p className="mt-5 max-w-2xl font-serif text-lg leading-relaxed text-ink/65 sm:text-xl">{intro}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3 self-start md:self-end">
        <div className="rounded-full border border-ink/15 bg-white/55 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/55">
          {user ? "Workspace saved" : "Demo workspace"}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-cream shadow-sm" title="IP-SAKTI">
          <span className="font-serif text-lg">IS</span>
        </div>
      </div>
    </header>
  );
}

function EvidenceCard({ item, index }: { item: GroundedAnswer["evidence"][number]; index: number }) {
  return (
    <a href={item.url} target="_blank" rel="noreferrer" className="group block rounded-2xl border border-ink/12 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:border-ink/30 hover:bg-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream-deep font-mono text-[11px] text-ink/70">0{index + 1}</span>
          <div className="min-w-0">
            <p className="font-serif text-base leading-tight text-ink">{item.sourceName}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/45">{item.authority}</p>
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-ink/35 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
      </div>
      <div className="mt-4 border-t border-ink/10 pt-3">
        <p className="text-xs font-semibold text-ink/75">{item.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-ink/60">{item.section || "Source page"}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.12em] text-ink/45">
          {item.versionLabel && <span>{item.versionLabel}</span>}
          {item.effectiveDate && <span>· {item.effectiveDate}</span>}
          <span>· {item.verificationStatus.replace("_", " ")}</span>
        </div>
      </div>
    </a>
  );
}

function GroundedResponse({ response, copy }: { response: GroundedAnswer & { routing: { intent: Intent; jurisdiction: UserJurisdiction; detectedLanguage: AppLanguage; rationale: string }; queryId?: number }; copy: Record<string, string> }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/15 pb-4">
        <div>
          <p className="editorial-kicker">{copy.answer}</p>
          <p className="mt-1 text-xs text-ink/55">Routed to {intentLabels[response.routing.intent]} · {jurisdictionLabels[response.routing.jurisdiction]}</p>
        </div>
        <span className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${confidenceTone[response.confidence]}`}>
          {copy.confidence}: {response.confidence}
        </span>
      </div>

      {response.abstained && (
        <div className="flex gap-3 rounded-2xl border border-rose-900/15 bg-rose-50 p-4 text-sm leading-relaxed text-rose-950">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Safe abstention activated: authoritative evidence was insufficient for a reliable response.</span>
        </div>
      )}

      <div className="rounded-2xl bg-ink p-5 text-cream sm:p-6">
        <Streamdown>{response.answer}</Streamdown>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {response.sections.map(section => (
          <div key={section.key} className="rounded-2xl border border-ink/12 bg-white/75 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-ink/60" />
              <h3 className="font-serif text-lg text-ink">{section.title}</h3>
            </div>
            <p className="text-sm leading-relaxed text-ink/65">{section.body}</p>
            {section.evidenceIds.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2" aria-label="Supporting evidence">
                {section.evidenceIds.map(evidenceId => {
                  const evidenceIndex = response.evidence.findIndex(item => item.id === evidenceId);
                  const evidence = response.evidence[evidenceIndex];
                  if (!evidence) return null;
                  return (
                    <a
                      key={`${section.key}-${evidenceId}`}
                      href={evidence.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-ink/15 bg-cream-deep px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/65 transition hover:border-ink/30 hover:text-ink"
                      title={`${evidence.sourceName} — ${evidence.section || "Source page"}`}
                    >
                      E{evidenceIndex + 1}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 border-y border-ink/12 py-4 text-xs leading-relaxed text-ink/55">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink/45" />
        <span>{response.disclaimer}</span>
      </div>

      <div>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="editorial-kicker">{copy.sources}</p>
            <p className="mt-1 text-xs text-ink/50">Every card links back to the source record used for this response.</p>
          </div>
          <span className="font-mono text-xs text-ink/40">{response.evidence.length.toString().padStart(2, "0")} records</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {response.evidence.map((item, index) => <EvidenceCard key={`${item.id}-${index}`} item={item} index={index} />)}
        </div>
      </div>
    </div>
  );
}

export function AskWorkspace({ focusIntent }: { focusIntent?: "abs" | "prior_art" } = {}) {
  const [language, setLanguage] = useState<AppLanguage>("en");
  const [jurisdiction, setJurisdiction] = useState<UserJurisdiction>("india");
  const [messages, setMessages] = useState<Message[]>([]);
  const [latestResponse, setLatestResponse] = useState<(GroundedAnswer & { routing: { intent: Intent; jurisdiction: UserJurisdiction; detectedLanguage: AppLanguage; rationale: string }; queryId?: number }) | null>(null);
  const copy = languageCopy[language];
  const askMutation = trpc.assistant.ask.useMutation({
    onSuccess: (result) => {
      setLatestResponse(result);
      setMessages(previous => [...previous, { role: "assistant", content: result.answer }]);
    },
    onError: (error) => {
      setMessages(previous => [...previous, { role: "assistant", content: `I couldn't complete this evidence search. ${error.message}` }]);
    },
  });

  const promptSuggestions = focusIntent === "abs"
    ? ["Does my formulation need an ABS review if it uses an Indian biological resource?", "What should I document before contacting the biodiversity authority?"]
    : focusIntent === "prior_art"
      ? ["How can I check whether an Ayurvedic formulation is already known?", "What is the TKDL pointer for a prior-art review?"]
      : ["I have an Ayurvedic herbal formulation and want to commercialize it in India. What IP and regulatory considerations should I check?", "Can I patent a new Ayurvedic formulation with an Indian plant ingredient?", "How should I separate a cosmetic claim from a medicine claim?"];

  const handleSend = (content: string) => {
    setMessages(previous => [...previous, { role: "user", content }]);
    askMutation.mutate({ question: content, language, jurisdiction });
  };

  return (
    <div className="space-y-8">
      <AppHeader eyebrow={focusIntent === "abs" ? "Access & benefit sharing" : focusIntent === "prior_art" ? "Traditional knowledge desk" : "Ayurveda / IP / regulation"} title={focusIntent === "abs" ? "Make the hidden dependency visible." : focusIntent === "prior_art" ? "Search the memory before you claim the new." : copy.title} intro={focusIntent === "abs" ? "A source-linked screening flow for biological resources, provenance, and the questions that should move to an expert review." : focusIntent === "prior_art" ? "A transparent prior-art pointer that distinguishes public evidence from restricted TKDL access." : copy.intro} />

      {!focusIntent && (
        <div className="grid gap-3 md:grid-cols-4">
          {routePills.map(({ label, icon: Icon, tone }) => (
            <div key={label} className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${tone}`}>
              <Icon className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em]">{label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(380px,0.82fr)]">
        <section className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="editorial-kicker">01 · {copy.question}</p>
              <p className="mt-1 text-xs text-ink/50">Ask in English, Hindi, Bengali, or a mix of languages.</p>
            </div>
            <div className="flex gap-2">
              <Select value={language} onValueChange={value => setLanguage(value as AppLanguage)}>
                <SelectTrigger className="h-9 w-[118px] rounded-full border-ink/15 bg-white/65 text-xs">
                  <Globe2 className="mr-1 h-3.5 w-3.5 text-ink/45" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिन्दी</SelectItem>
                  <SelectItem value="bn">বাংলা</SelectItem>
                </SelectContent>
              </Select>
              <Select value={jurisdiction} onValueChange={value => setJurisdiction(value as UserJurisdiction)}>
                <SelectTrigger className="h-9 w-[156px] rounded-full border-ink/15 bg-white/65 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="india">India</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                  <SelectItem value="both">India + international</SelectItem>
                  <SelectItem value="unknown">Let Sahayak detect</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <AIChatBox
            messages={messages}
            onSendMessage={handleSend}
            isLoading={askMutation.isPending}
            height="min(66vh, 660px)"
            className="editorial-chat"
            placeholder={focusIntent === "abs" ? "Describe the biological resource or traditional knowledge involved…" : focusIntent === "prior_art" ? "Describe the formulation or prior-art concern…" : "Ask about IP, regulation, ABS, or prior art…"}
            emptyStateMessage={focusIntent === "abs" ? "Start an ABS screening conversation" : focusIntent === "prior_art" ? "Start a prior-art pointer conversation" : "Start an evidence-led commercialization review"}
            suggestedPrompts={promptSuggestions}
          />
          <div className="mt-3 flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.14em] text-ink/40">
            <span className="flex items-center gap-2"><LockKeyhole className="h-3 w-3" /> Secrets stay server-side</span>
            <span>Rate-limited prototype endpoint</span>
          </div>
        </section>

        <section className="min-w-0">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="editorial-kicker">02 · Evidence trail</p>
              <p className="mt-1 text-xs text-ink/50">Structured answer, confidence, and citation cards.</p>
            </div>
            <Waypoints className="h-5 w-5 text-ink/25" />
          </div>
          <div className="min-h-[540px] rounded-3xl border border-ink/12 bg-white/45 p-5 sm:p-6">
            {latestResponse ? <GroundedResponse response={latestResponse} copy={copy} /> : (
              <div className="flex min-h-[510px] flex-col justify-between">
                <div className="max-w-sm">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-cream"><Sparkles className="h-5 w-5" /></div>
                  <h2 className="font-serif text-3xl leading-tight text-ink">{copy.noAnswer}</h2>
                  <p className="mt-4 text-sm leading-relaxed text-ink/55">Sahayak routes the question, retrieves matching source passages, and marks the limits of what the evidence can support.</p>
                </div>
                <div className="space-y-3 text-xs text-ink/50">
                  <div className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-cream-deep font-mono">1</span> Intent + jurisdiction routing</div>
                  <div className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-cream-deep font-mono">2</span> Curated source retrieval</div>
                  <div className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-cream-deep font-mono">3</span> Grounded answer + safe abstention</div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const initialForm: FormulationInput = {
  productName: "",
  ingredients: "",
  dosageForm: "",
  intendedUse: "",
  manufacturingProcess: "",
  claims: "",
  classicalReference: "unknown",
  newIngredient: "unknown",
  biologicalResource: "unknown",
  targetMarket: "india",
};

function FormField({ label, value, onChange, placeholder, multiline = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; multiline?: boolean }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/55">{label}</Label>
      {multiline ? <Textarea value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="min-h-24 rounded-xl border-ink/15 bg-white/70 text-sm" /> : <Input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="h-11 rounded-xl border-ink/15 bg-white/70 text-sm" />}
    </div>
  );
}

export function ClassifierPage() {
  const [form, setForm] = useState<FormulationInput>(initialForm);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const mutation = trpc.assistant.classify.useMutation({ onSuccess: setResult });
  const update = (key: keyof FormulationInput, value: string) => setForm(previous => ({ ...previous, [key]: value } as FormulationInput));
  return (
    <div className="space-y-8">
      <AppHeader eyebrow="Formulation intelligence" title="Name the category before the claim." intro="A targeted questionnaire for turning product facts into a provisional category, with the uncertainty left visible." />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="editorial-card border-ink/12 bg-white/45">
          <CardHeader><p className="editorial-kicker">01 · Product dossier</p><CardTitle className="font-serif text-3xl font-normal">Tell us what exists.</CardTitle></CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <FormField label="Product name" value={form.productName} onChange={value => update("productName", value)} placeholder="e.g. Ashwagandha botanical blend" />
            <FormField label="Dosage form" value={form.dosageForm} onChange={value => update("dosageForm", value)} placeholder="Tablet, oil, powder, beverage…" />
            <FormField label="Ingredients" value={form.ingredients} onChange={value => update("ingredients", value)} placeholder="List key ingredients and proportions" multiline />
            <FormField label="Intended use" value={form.intendedUse} onChange={value => update("intendedUse", value)} placeholder="What is the product intended to do?" multiline />
            <FormField label="Manufacturing process" value={form.manufacturingProcess} onChange={value => update("manufacturingProcess", value)} placeholder="Extraction, blending, fermentation…" multiline />
            <FormField label="Claims / packaging language" value={form.claims} onChange={value => update("claims", value)} placeholder="What will you say on label or marketing?" multiline />
            <QuestionSelect label="Classical reference available?" value={form.classicalReference} onChange={value => update("classicalReference", value)} />
            <QuestionSelect label="New ingredient or process?" value={form.newIngredient} onChange={value => update("newIngredient", value)} />
            <QuestionSelect label="External biological resource?" value={form.biologicalResource} onChange={value => update("biologicalResource", value)} />
            <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/55">Target market</Label><Select value={form.targetMarket} onValueChange={value => update("targetMarket", value)}><SelectTrigger className="h-11 rounded-xl border-ink/15 bg-white/70 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="india">India</SelectItem><SelectItem value="international">International</SelectItem><SelectItem value="both">Both</SelectItem></SelectContent></Select></div>
            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-4 border-t border-ink/12 pt-5"><p className="max-w-md text-xs leading-relaxed text-ink/50">This is a provisional research classification, not a licensing or legal determination.</p><Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="rounded-full bg-ink px-6 text-cream hover:bg-ink/85">{mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ClipboardIcon />} Classify formulation</Button></div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <div className="rounded-3xl bg-ink p-6 text-cream"><p className="editorial-kicker text-cream/50">Six working categories</p><div className="mt-5 space-y-2">{["Classical / Generic Medicine", "Patent-or-Proprietary Medicine", "New / Non-classical Drug", "Phytopharmaceutical", "Ayurveda-Aahar / Nutraceutical", "Cosmetic"].map((item, index) => <div key={item} className="flex items-center gap-3 border-b border-cream/10 py-3 text-sm"><span className="font-mono text-xs text-cream/40">0{index + 1}</span><span>{item}</span></div>)}</div></div>
          {result ? <Card className="editorial-card border-ink/12 bg-white/70"><CardHeader><p className="editorial-kicker">Classification output</p><CardTitle className="font-serif text-2xl font-normal">{result.category}</CardTitle></CardHeader><CardContent><div className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${confidenceTone[result.confidence]}`}>{result.confidence} confidence</div><p className="mt-4 text-sm leading-relaxed text-ink/65">{result.explanation}</p><Separator className="my-4 bg-ink/10" /><p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Checks run</p><div className="mt-3 space-y-2">{result.checks.map(check => <div key={check} className="flex gap-2 text-sm text-ink/65"><Check className="mt-0.5 h-4 w-4 text-emerald-700" />{check}</div>)}</div></CardContent></Card> : <div className="rounded-3xl border border-dashed border-ink/20 p-6 text-sm leading-relaxed text-ink/50">Complete the dossier to see the provisional category and the checks behind it.</div>}
        </div>
      </div>
    </div>
  );
}

function ClipboardIcon() { return <ClipboardCheckIcon />; }
function ClipboardCheckIcon() { return <FileCheck2 className="mr-2 h-4 w-4" />; }
function QuestionSelect({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/55">{label}</Label><Select value={value} onValueChange={onChange}><SelectTrigger className="h-11 rounded-xl border-ink/15 bg-white/70 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem><SelectItem value="unknown">Unknown</SelectItem></SelectContent></Select></div>;
}
function CategorySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/55">Category</Label><Select value={value} onValueChange={onChange}><SelectTrigger className="h-11 rounded-xl border-ink/15 bg-white/70 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ip">IP</SelectItem><SelectItem value="regulatory">Regulatory</SelectItem><SelectItem value="abs">ABS</SelectItem><SelectItem value="prior_art">Prior art</SelectItem><SelectItem value="standards">Standards</SelectItem></SelectContent></Select></div>;
}
function JurisdictionSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/55">Jurisdiction</Label><Select value={value} onValueChange={onChange}><SelectTrigger className="h-11 rounded-xl border-ink/15 bg-white/70 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="india">India</SelectItem><SelectItem value="international">International</SelectItem><SelectItem value="both">Both</SelectItem></SelectContent></Select></div>;
}

export function HistoryPage() {
  const { user } = useAuth();
  const history = trpc.history.list.useQuery(undefined, { enabled: Boolean(user) });
  return <div className="space-y-8"><AppHeader eyebrow="Your evidence log" title="Keep the trail intact." intro="Saved questions and answers make follow-up review more precise. Sign in to persist your workspace across sessions." />{!user ? <div className="rounded-3xl border border-ink/12 bg-white/55 p-8 text-center"><Clock3 className="mx-auto h-7 w-7 text-ink/35" /><h2 className="mt-4 font-serif text-3xl text-ink">Your history is private to your workspace.</h2><p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink/55">Sign in to save query history and return to a source-grounded trail later.</p><Button onClick={() => startLogin()} className="mt-6 rounded-full bg-ink text-cream hover:bg-ink/85">Sign in</Button></div> : <div className="space-y-3">{history.isLoading ? <Loader2 className="h-6 w-6 animate-spin text-ink/50" /> : history.data?.length ? history.data.map(item => <div key={item.id} className="grid gap-4 rounded-2xl border border-ink/12 bg-white/65 p-5 md:grid-cols-[140px_1fr_auto] md:items-center"><div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink/45">{new Date(item.createdAt).toLocaleDateString()}<br />{item.intent} · {item.jurisdiction}</div><div><p className="font-serif text-lg text-ink">{item.question}</p><p className="mt-1 line-clamp-2 text-sm text-ink/55">{item.answer}</p></div><span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${confidenceTone[item.confidence]}`}>{item.confidence}</span></div>) : <div className="rounded-3xl border border-dashed border-ink/20 p-8 text-sm text-ink/50">No saved questions yet. Ask Sahayak to start your evidence log.</div>}</div>}</div>;
}

export function ExpertReviewPage() {
  const [question, setQuestion] = useState("");
  const [contact, setContact] = useState("");
  const [context, setContext] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const mutation = trpc.escalation.create.useMutation({ onSuccess: () => setSubmitted(true) });
  return <div className="space-y-8"><AppHeader eyebrow="Human in the loop" title="Know when to ask for another pair of eyes." intro="Send a question, the context behind it, and a safe contact route to an expert-review queue." /><div className="grid gap-6 lg:grid-cols-[1fr_380px]"><Card className="editorial-card border-ink/12 bg-white/50"><CardHeader><p className="editorial-kicker">Request expert review</p><CardTitle className="font-serif text-3xl font-normal">Escalate with context.</CardTitle></CardHeader><CardContent className="space-y-5">{submitted ? <div className="rounded-2xl border border-emerald-900/15 bg-emerald-50 p-5 text-emerald-950"><Check className="h-5 w-5" /><h3 className="mt-3 font-serif text-2xl">Request received.</h3><p className="mt-2 text-sm leading-relaxed">Your request is in the review queue. Keep your reference details ready for follow-up.</p></div> : <><FormField label="Question for the expert" value={question} onChange={setQuestion} placeholder="What needs a human determination?" multiline /><FormField label="Contact route" value={contact} onChange={setContact} placeholder="Email or phone number" /><FormField label="Context and evidence" value={context} onChange={setContext} placeholder="Add product facts, retrieved sources, or the decision you are considering" multiline /><div className="flex items-center justify-between gap-4 border-t border-ink/12 pt-5"><p className="text-xs text-ink/50">Only submit the minimum contact information needed for follow-up.</p><Button onClick={() => mutation.mutate({ question, contact, context })} disabled={mutation.isPending || question.length < 3 || contact.length < 3} className="rounded-full bg-ink text-cream hover:bg-ink/85">{mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Send request</Button></div></>}</CardContent></Card><div className="rounded-3xl bg-[#e5d5b8] p-6"><p className="editorial-kicker text-ink/55">Review queue protocol</p><div className="mt-6 space-y-5">{["Question and contact are validated", "Relevant context is preserved", "Admin review status is recorded"].map((item, index) => <div key={item} className="flex gap-3"><span className="font-mono text-xs text-ink/45">0{index + 1}</span><p className="text-sm leading-relaxed text-ink/70">{item}</p></div>)}</div><div className="mt-8 border-t border-ink/15 pt-4 text-xs leading-relaxed text-ink/55">This prototype does not promise a response time or a legal conclusion. It creates a structured handoff for human review.</div></div></div></div>;
}

function AdminSourceRow({ source, onUpdate }: { source: { id: number; name: string; authority: string; url: string; versionLabel: string | null; effectiveDate: string | null; verificationStatus: "verified" | "needs_review" | "unverified"; isActive: boolean; category: string; jurisdiction: string; description: string | null }; onUpdate: (input: { id: number; name?: string; authority?: string; url?: string; versionLabel?: string; effectiveDate?: string; verificationStatus?: "verified" | "needs_review" | "unverified"; isActive?: boolean }) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: source.name, authority: source.authority, url: source.url, versionLabel: source.versionLabel ?? "", effectiveDate: source.effectiveDate ?? "" });
  return <div className="rounded-2xl border border-ink/12 bg-white/65 p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0">{editing ? <div className="grid gap-2 sm:grid-cols-2"><Input value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} className="h-9 rounded-lg border-ink/15 bg-white" /><Input value={draft.authority} onChange={event => setDraft({ ...draft, authority: event.target.value })} className="h-9 rounded-lg border-ink/15 bg-white" /></div> : <><p className="font-serif text-xl text-ink">{source.name}</p><p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink/45">{source.authority} · {source.category} · {source.jurisdiction}</p></>}</div><div className="flex flex-wrap items-center gap-2"><Badge variant="outline" className="rounded-full border-ink/15 text-[10px] uppercase tracking-[0.12em]">{source.verificationStatus}</Badge><Button size="sm" variant="outline" onClick={() => onUpdate({ id: source.id, verificationStatus: source.verificationStatus === "verified" ? "needs_review" : "verified" })} className="h-8 rounded-full border-ink/15 bg-transparent text-[10px] uppercase tracking-[0.12em]">{source.verificationStatus === "verified" ? "Review again" : "Verify"}</Button><Button size="sm" variant="outline" onClick={() => onUpdate({ id: source.id, isActive: !source.isActive })} className="h-8 rounded-full border-ink/15 bg-transparent text-[10px] uppercase tracking-[0.12em]">{source.isActive ? "Deactivate" : "Activate"}</Button>{editing ? <Button size="sm" onClick={() => { onUpdate({ id: source.id, ...draft }); setEditing(false); }} className="h-8 rounded-full bg-ink text-[10px] uppercase tracking-[0.12em] text-cream hover:bg-ink/85">Save</Button> : <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="h-8 rounded-full border-ink/15 bg-transparent text-[10px] uppercase tracking-[0.12em]">Edit</Button>}</div></div>{editing ? <div className="mt-4 grid gap-2 sm:grid-cols-2"><Input value={draft.url} onChange={event => setDraft({ ...draft, url: event.target.value })} className="h-9 rounded-lg border-ink/15 bg-white" placeholder="Source URL" /><Input value={draft.versionLabel} onChange={event => setDraft({ ...draft, versionLabel: event.target.value })} className="h-9 rounded-lg border-ink/15 bg-white" placeholder="Version / edition" /><Input value={draft.effectiveDate} onChange={event => setDraft({ ...draft, effectiveDate: event.target.value })} className="h-9 rounded-lg border-ink/15 bg-white sm:col-span-2" placeholder="Effective date / verification caveat" /></div> : <><a className="mt-4 block break-all text-xs text-ink/55 underline decoration-ink/20 underline-offset-4" href={source.url} target="_blank" rel="noreferrer">{source.url}</a><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-ink/45"><span>{source.versionLabel || "Version not set"}</span><span>{source.effectiveDate || "Current status not set"}</span><span>{source.isActive ? "Active in retrieval" : "Inactive"}</span></div><p className="mt-3 text-xs leading-relaxed text-ink/55">{source.description}</p></>}</div>;
}

function AdminKnowledgeRow({ record, onUpdate }: { record: { id: number; sourceName: string; title: string; section: string | null; content: string; keywords: string | null; intent: string; jurisdiction: string; isActive: boolean }; onUpdate: (input: { id: number; title?: string; section?: string; content?: string; keywords?: string; isActive?: boolean }) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: record.title, section: record.section ?? "", content: record.content, keywords: record.keywords ?? "" });
  return <div className="rounded-2xl border border-ink/12 bg-white/65 p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45">{record.sourceName} · {record.intent} · {record.jurisdiction}</p>{editing ? <Input value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} className="mt-2 h-9 rounded-lg border-ink/15 bg-white" /> : <p className="mt-2 font-serif text-xl text-ink">{record.title}</p>}</div><div className="flex flex-wrap gap-2"><Badge variant="outline" className="rounded-full border-ink/15 text-[10px] uppercase tracking-[0.12em]">{record.isActive ? "active" : "inactive"}</Badge><Button size="sm" variant="outline" onClick={() => onUpdate({ id: record.id, isActive: !record.isActive })} className="h-8 rounded-full border-ink/15 bg-transparent text-[10px] uppercase tracking-[0.12em]">{record.isActive ? "Deactivate" : "Activate"}</Button>{editing ? <Button size="sm" onClick={() => { onUpdate({ id: record.id, ...draft }); setEditing(false); }} className="h-8 rounded-full bg-ink text-[10px] uppercase tracking-[0.12em] text-cream hover:bg-ink/85">Save</Button> : <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="h-8 rounded-full border-ink/15 bg-transparent text-[10px] uppercase tracking-[0.12em]">Edit chunk</Button>}</div></div>{editing ? <div className="mt-4 space-y-2"><Input value={draft.section} onChange={event => setDraft({ ...draft, section: event.target.value })} className="h-9 rounded-lg border-ink/15 bg-white" placeholder="Section / locator" /><Textarea value={draft.content} onChange={event => setDraft({ ...draft, content: event.target.value })} className="min-h-28 rounded-lg border-ink/15 bg-white text-sm" /><Input value={draft.keywords} onChange={event => setDraft({ ...draft, keywords: event.target.value })} className="h-9 rounded-lg border-ink/15 bg-white" placeholder="Search keywords" /></div> : <><p className="mt-3 text-sm leading-relaxed text-ink/65">{record.content}</p><p className="mt-3 text-xs text-ink/45">{record.section || "No section locator"} · {record.keywords || "No keywords"}</p></>}</div>;
}

export function AdminPage() {
  const { user } = useAuth();
  const sources = trpc.sources.adminList.useQuery(undefined, { enabled: user?.role === "admin" });
  const knowledgeRecords = trpc.sources.adminKnowledgeList.useQuery(undefined, { enabled: user?.role === "admin" });
  const [form, setForm] = useState({ name: "", authority: "", url: "", category: "regulatory", jurisdiction: "india", versionLabel: "", effectiveDate: "" });
  const [knowledge, setKnowledge] = useState({ documentId: "", title: "", section: "", content: "", keywords: "", intent: "regulatory", jurisdiction: "india" });
  const mutation = trpc.sources.adminCreate.useMutation({ onSuccess: () => { setForm({ name: "", authority: "", url: "", category: "regulatory", jurisdiction: "india", versionLabel: "", effectiveDate: "" }); sources.refetch(); } });
  const updateMutation = trpc.sources.adminUpdate.useMutation({ onSuccess: () => sources.refetch() });
  const knowledgeMutation = trpc.sources.adminAddKnowledge.useMutation({ onSuccess: () => { setKnowledge({ documentId: "", title: "", section: "", content: "", keywords: "", intent: "regulatory", jurisdiction: "india" }); knowledgeRecords.refetch(); } });
  const knowledgeUpdateMutation = trpc.sources.adminUpdateKnowledge.useMutation({ onSuccess: () => knowledgeRecords.refetch() });
  if (!user || user.role !== "admin") return <div className="space-y-8"><AppHeader eyebrow="Knowledge stewardship" title="A quiet gate around the corpus." intro="Source management is reserved for authorized knowledge stewards." /><div className="rounded-3xl border border-ink/12 bg-white/55 p-8"><LockKeyhole className="h-7 w-7 text-ink/35" /><h2 className="mt-4 font-serif text-3xl text-ink">Admin access required.</h2><p className="mt-3 max-w-lg text-sm leading-relaxed text-ink/55">Sign in with an authorized admin account to review and add source metadata. New sources enter as “needs review”.</p></div></div>;
  return <div className="space-y-8"><AppHeader eyebrow="Knowledge stewardship" title="Curate what the assistant can say." intro="Every source enters with provenance, version context, and an explicit verification state." /><div className="grid gap-6 xl:grid-cols-[1fr_390px]"><div className="space-y-3">{sources.isLoading ? <Loader2 className="h-6 w-6 animate-spin text-ink/50" /> : sources.data?.map(source => <AdminSourceRow key={source.id} source={source} onUpdate={input => updateMutation.mutate(input)} />)}<div className="mt-10 space-y-3"><div className="flex items-end justify-between gap-3"><div><p className="editorial-kicker">Indexed passages</p><p className="mt-1 text-xs text-ink/50">Edit or deactivate chunks without deleting their audit trail.</p></div><Badge variant="outline" className="rounded-full border-ink/15 text-[10px] uppercase tracking-[0.12em]">{knowledgeRecords.data?.length ?? 0} records</Badge></div>{knowledgeRecords.isLoading ? <Loader2 className="h-6 w-6 animate-spin text-ink/50" /> : knowledgeRecords.data?.map(record => <AdminKnowledgeRow key={record.id} record={record} onUpdate={input => knowledgeUpdateMutation.mutate(input)} />)}</div></div><div className="space-y-5"><Card className="editorial-card h-fit border-ink/12 bg-white/55"><CardHeader><p className="editorial-kicker">Add source</p><CardTitle className="font-serif text-2xl font-normal">Extend the evidence desk.</CardTitle></CardHeader><CardContent className="space-y-4"><FormField label="Source name" value={form.name} onChange={value => setForm({ ...form, name: value })} placeholder="Official title" /><FormField label="Authority" value={form.authority} onChange={value => setForm({ ...form, authority: value })} placeholder="Issuing authority" /><FormField label="URL" value={form.url} onChange={value => setForm({ ...form, url: value })} placeholder="https://…" /><div className="grid gap-4 sm:grid-cols-2"><CategorySelect value={form.category} onChange={value => setForm({ ...form, category: value })} /><JurisdictionSelect value={form.jurisdiction} onChange={value => setForm({ ...form, jurisdiction: value })} /></div><div className="grid gap-4 sm:grid-cols-2"><FormField label="Version / edition" value={form.versionLabel} onChange={value => setForm({ ...form, versionLabel: value })} placeholder="e.g. 2016 PDF" /><FormField label="Effective date / caveat" value={form.effectiveDate} onChange={value => setForm({ ...form, effectiveDate: value })} placeholder="Verify current amendments" /></div><p className="text-xs leading-relaxed text-ink/50">New records are marked needs_review. Add a knowledge passage only after provenance is verified.</p><Button onClick={() => mutation.mutate(form as Parameters<typeof mutation.mutate>[0])} disabled={mutation.isPending || form.name.length < 2 || form.authority.length < 2 || !form.url.includes(".")} className="w-full rounded-full bg-ink text-cream hover:bg-ink/85">{mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />} Add source record</Button></CardContent></Card><Card className="editorial-card h-fit border-ink/12 bg-white/55"><CardHeader><p className="editorial-kicker">Index passage</p><CardTitle className="font-serif text-2xl font-normal">Add a searchable chunk.</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/55">Source document</Label><Select value={knowledge.documentId} onValueChange={value => setKnowledge({ ...knowledge, documentId: value })}><SelectTrigger className="h-11 rounded-xl border-ink/15 bg-white/70 text-sm"><SelectValue placeholder="Choose a source" /></SelectTrigger><SelectContent>{sources.data?.map(source => <SelectItem key={source.id} value={String(source.id)}>{source.name}</SelectItem>)}</SelectContent></Select></div><FormField label="Passage title" value={knowledge.title} onChange={value => setKnowledge({ ...knowledge, title: value })} placeholder="Short evidence label" /><FormField label="Section / locator" value={knowledge.section} onChange={value => setKnowledge({ ...knowledge, section: value })} placeholder="Chapter, section, page…" /><FormField label="Passage content" value={knowledge.content} onChange={value => setKnowledge({ ...knowledge, content: value })} placeholder="Paste only verified source-grounded text" multiline /><FormField label="Search keywords" value={knowledge.keywords} onChange={value => setKnowledge({ ...knowledge, keywords: value })} placeholder="patent, novelty, AYUSH…" /><Button onClick={() => knowledgeMutation.mutate({ ...knowledge, documentId: Number(knowledge.documentId) } as Parameters<typeof knowledgeMutation.mutate>[0])} disabled={knowledgeMutation.isPending || !knowledge.documentId || knowledge.title.length < 2 || knowledge.content.length < 20} className="w-full rounded-full bg-ink text-cream hover:bg-ink/85">{knowledgeMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileCheck2 className="mr-2 h-4 w-4" />} Index passage</Button></CardContent></Card></div></div></div>;
}

export function AppPage() {
  const [location] = useLocation();
  const page = useMemo(() => location, [location]);
  if (page === "/classifier") return <ClassifierPage />;
  if (page === "/abs") return <AskWorkspace focusIntent="abs" />;
  if (page === "/prior-art") return <AskWorkspace focusIntent="prior_art" />;
  if (page === "/history") return <HistoryPage />;
  if (page === "/expert-review") return <ExpertReviewPage />;
  if (page === "/admin") return <AdminPage />;
  return <AskWorkspace />;
}
