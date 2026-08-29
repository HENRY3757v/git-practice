import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import type { AppLanguage, FormulationInput, UserJurisdiction } from "@shared/types";
import {
  createAuditEvent,
  createClassification,
  createConversation,
  createEscalation,
  createKnowledgeRecord,
  updateKnowledgeRecord,
  listKnowledgeRecordsAdmin,
  createQueryHistory,
  createSourceDocument,
  updateSourceDocument,
  listEscalations,
  listRecentQueries,
  listSourceDocuments,
} from "./db";
import { ensureSeedCorpus, generateGroundedAnswer, classifyFormulation, routeQuestion, retrieveEvidence } from "./rag";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 12;
const RATE_WINDOW_MS = 60_000;

function enforceRateLimit(req: { ip?: string; headers?: Record<string, unknown> }) {
  const key = req.ip || String(req.headers?.["x-forwarded-for"] ?? "prototype-client");
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return;
  }
  if (bucket.count >= RATE_LIMIT) {
    const waitSeconds = Math.ceil((bucket.resetAt - now) / 1000);
    throw new Error(`Rate limit reached. Try again in ${waitSeconds} seconds.`);
  }
  bucket.count += 1;
}

const jurisdictionInput = z.enum(["india", "international", "both", "unknown"]);
const languageInput = z.enum(["en", "hi", "bn"]);

const formulationSchema = z.object({
  productName: z.string().trim().min(2).max(255),
  ingredients: z.string().trim().min(2).max(2000),
  dosageForm: z.string().trim().min(2).max(255),
  intendedUse: z.string().trim().min(2).max(1000),
  manufacturingProcess: z.string().trim().min(2).max(2000),
  claims: z.string().trim().min(2).max(2000),
  classicalReference: z.enum(["yes", "no", "unknown"]),
  newIngredient: z.enum(["yes", "no", "unknown"]),
  biologicalResource: z.enum(["yes", "no", "unknown"]),
  targetMarket: z.enum(["india", "international", "both"]),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  assistant: router({
    ask: publicProcedure
      .input(z.object({
        question: z.string().trim().min(3).max(4000),
        language: languageInput.default("en"),
        jurisdiction: jurisdictionInput.default("unknown"),
        conversationId: z.number().int().positive().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        enforceRateLimit(ctx.req);
        const routing = routeQuestion(input.question, input.jurisdiction as UserJurisdiction);
        const evidence = await retrieveEvidence(input.question, routing);
        const grounded = await generateGroundedAnswer(input.question, routing, evidence, input.language as AppLanguage);
        let conversationId = input.conversationId;
        if (!conversationId) {
          conversationId = await createConversation({
            userId: ctx.user?.id,
            title: input.question.slice(0, 120),
            language: input.language,
            jurisdiction: routing.jurisdiction,
          });
        }
        const queryId = await createQueryHistory({
          conversationId,
          userId: ctx.user?.id,
          question: input.question,
          language: input.language,
          intent: routing.intent,
          jurisdiction: routing.jurisdiction,
          answer: grounded.answer,
          confidence: grounded.confidence,
          evidenceJson: JSON.stringify(grounded.evidence),
          routingJson: JSON.stringify(routing),
        });
        await createAuditEvent({
          userId: ctx.user?.id,
          action: "assistant.ask",
          entityType: "query",
          entityId: queryId,
          metadataJson: JSON.stringify({ intent: routing.intent, jurisdiction: routing.jurisdiction, evidenceCount: evidence.length }),
        });
        return { ...grounded, routing, queryId, conversationId };
      }),

    classify: publicProcedure
      .input(formulationSchema)
      .mutation(async ({ ctx, input }) => {
        enforceRateLimit(ctx.req);
        const result = classifyFormulation(input as FormulationInput);
        const recordId = await createClassification({
          userId: ctx.user?.id,
          productName: input.productName,
          inputJson: JSON.stringify(input),
          category: result.category,
          confidence: result.confidence,
          explanation: result.explanation,
        });
        await createAuditEvent({
          userId: ctx.user?.id,
          action: "assistant.classify",
          entityType: "classification",
          entityId: recordId,
          metadataJson: JSON.stringify({ category: result.category, targetMarket: input.targetMarket }),
        });
        return { ...result, recordId };
      }),

    quickRoute: publicProcedure
      .input(z.object({ question: z.string().trim().min(3).max(4000), jurisdiction: jurisdictionInput.default("unknown") }))
      .query(({ input }) => routeQuestion(input.question, input.jurisdiction as UserJurisdiction)),
  }),

  history: router({
    list: protectedProcedure.query(({ ctx }) => listRecentQueries(ctx.user.id)),
  }),

  escalation: router({
    create: publicProcedure
      .input(z.object({
        question: z.string().trim().min(3).max(4000),
        contact: z.string().trim().min(3).max(255),
        queryId: z.number().int().positive().optional(),
        context: z.string().max(12000).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        enforceRateLimit(ctx.req);
        const id = await createEscalation({
          userId: ctx.user?.id,
          queryId: input.queryId,
          question: input.question,
          contact: input.contact,
          contextJson: input.context ? JSON.stringify({ context: input.context }) : undefined,
          status: "new",
        });
        await createAuditEvent({
          userId: ctx.user?.id,
          action: "escalation.create",
          entityType: "escalation",
          entityId: id,
          metadataJson: JSON.stringify({ hasContext: Boolean(input.context) }),
        });
        return { success: true, id };
      }),
  }),

  sources: router({
    list: publicProcedure.query(async () => {
      await ensureSeedCorpus();
      return listSourceDocuments();
    }),
    adminList: adminProcedure.query(async () => {
      await ensureSeedCorpus();
      return listSourceDocuments();
    }),
    adminCreate: adminProcedure
      .input(z.object({
        name: z.string().trim().min(2).max(255),
        authority: z.string().trim().min(2).max(255),
        url: z.string().url().max(2000),
        category: z.enum(["ip", "regulatory", "abs", "prior_art", "standards"]),
        jurisdiction: z.enum(["india", "international", "both"]),
        versionLabel: z.string().max(120).optional(),
        effectiveDate: z.string().max(120).optional(),
        description: z.string().max(4000).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await createSourceDocument({ ...input, verificationStatus: "needs_review", isActive: true });
        await createAuditEvent({
          userId: ctx.user.id,
          action: "source.create",
          entityType: "source_document",
          entityId: id,
          metadataJson: JSON.stringify({ verificationStatus: "needs_review" }),
        });
        return { success: true, id };
      }),
    adminUpdate: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        name: z.string().trim().min(2).max(255).optional(),
        authority: z.string().trim().min(2).max(255).optional(),
        url: z.string().url().max(2000).optional(),
        versionLabel: z.string().max(120).optional(),
        effectiveDate: z.string().max(120).optional(),
        verificationStatus: z.enum(["verified", "needs_review", "unverified"]).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...changes } = input;
        await updateSourceDocument(id, changes);
        await createAuditEvent({
          userId: ctx.user.id,
          action: "source.update",
          entityType: "source_document",
          entityId: id,
          metadataJson: JSON.stringify(changes),
        });
        return { success: true, id };
      }),
    adminKnowledgeList: adminProcedure.query(async () => {
      await ensureSeedCorpus();
      return listKnowledgeRecordsAdmin();
    }),
    adminUpdateKnowledge: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        title: z.string().trim().min(2).max(255).optional(),
        section: z.string().max(255).optional(),
        content: z.string().trim().min(20).max(12000).optional(),
        keywords: z.string().max(2000).optional(),
        intent: z.enum(["ip", "regulatory", "abs", "prior_art", "general"]).optional(),
        jurisdiction: z.enum(["india", "international", "both"]).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...changes } = input;
        await updateKnowledgeRecord(id, changes);
        await createAuditEvent({
          userId: ctx.user.id,
          action: "knowledge.update",
          entityType: "knowledge_record",
          entityId: id,
          metadataJson: JSON.stringify(changes),
        });
        return { success: true, id };
      }),
    adminAddKnowledge: adminProcedure
      .input(z.object({
        documentId: z.number().int().positive(),
        title: z.string().trim().min(2).max(255),
        section: z.string().max(255).optional(),
        content: z.string().trim().min(20).max(12000),
        keywords: z.string().max(2000).optional(),
        intent: z.enum(["ip", "regulatory", "abs", "prior_art", "general"]),
        jurisdiction: z.enum(["india", "international", "both"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await createKnowledgeRecord({ ...input, isActive: true, language: "en" });
        await createAuditEvent({
          userId: ctx.user.id,
          action: "knowledge.create",
          entityType: "knowledge_record",
          entityId: id,
        });
        return { success: true, id };
      }),
  }),

  admin: router({
    escalations: adminProcedure.query(() => listEscalations()),
  }),
});

export type AppRouter = typeof appRouter;
