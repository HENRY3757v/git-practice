import { and, desc, eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  auditEvents,
  classificationRecords,
  conversations,
  escalationRequests,
  InsertUser,
  knowledgeRecords,
  queryHistory,
  sourceDocuments,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getKnowledgeRecords(search?: string) {
  const db = await getDb();
  if (!db) return [];
  const filters = [eq(knowledgeRecords.isActive, true), eq(sourceDocuments.isActive, true)];
  if (search?.trim()) {
    const term = `%${search.trim()}%`;
    filters.push(or(
      like(knowledgeRecords.content, term),
      like(knowledgeRecords.title, term),
      like(knowledgeRecords.keywords, term),
      like(sourceDocuments.name, term),
    ) as any);
  }
  return db
    .select({
      id: knowledgeRecords.id,
      documentId: knowledgeRecords.documentId,
      title: knowledgeRecords.title,
      section: knowledgeRecords.section,
      content: knowledgeRecords.content,
      keywords: knowledgeRecords.keywords,
      intent: knowledgeRecords.intent,
      jurisdiction: knowledgeRecords.jurisdiction,
      language: knowledgeRecords.language,
      sourceName: sourceDocuments.name,
      authority: sourceDocuments.authority,
      url: sourceDocuments.url,
      versionLabel: sourceDocuments.versionLabel,
      effectiveDate: sourceDocuments.effectiveDate,
      verificationStatus: sourceDocuments.verificationStatus,
    })
    .from(knowledgeRecords)
    .innerJoin(sourceDocuments, eq(knowledgeRecords.documentId, sourceDocuments.id))
    .where(and(...filters));
}

export async function listSourceDocuments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sourceDocuments).orderBy(desc(sourceDocuments.updatedAt));
}

export async function createSourceDocument(input: typeof sourceDocuments.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(sourceDocuments).values(input);
  return result[0]?.insertId ? Number(result[0].insertId) : undefined;
}

export async function updateSourceDocument(id: number, input: Partial<typeof sourceDocuments.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(sourceDocuments).set(input).where(eq(sourceDocuments.id, id));
}

export async function createKnowledgeRecord(input: typeof knowledgeRecords.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(knowledgeRecords).values(input);
  return result[0]?.insertId ? Number(result[0].insertId) : undefined;
}

export async function updateKnowledgeRecord(id: number, input: Partial<typeof knowledgeRecords.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(knowledgeRecords).set(input).where(eq(knowledgeRecords.id, id));
}

export async function listKnowledgeRecordsAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: knowledgeRecords.id,
      documentId: knowledgeRecords.documentId,
      title: knowledgeRecords.title,
      section: knowledgeRecords.section,
      content: knowledgeRecords.content,
      keywords: knowledgeRecords.keywords,
      intent: knowledgeRecords.intent,
      jurisdiction: knowledgeRecords.jurisdiction,
      language: knowledgeRecords.language,
      isActive: knowledgeRecords.isActive,
      sourceName: sourceDocuments.name,
    })
    .from(knowledgeRecords)
    .innerJoin(sourceDocuments, eq(knowledgeRecords.documentId, sourceDocuments.id))
    .orderBy(desc(knowledgeRecords.updatedAt));
}

export async function createConversation(input: typeof conversations.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(conversations).values(input);
  return result[0]?.insertId ? Number(result[0].insertId) : undefined;
}

export async function createQueryHistory(input: typeof queryHistory.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(queryHistory).values(input);
  return result[0]?.insertId ? Number(result[0].insertId) : undefined;
}

export async function listRecentQueries(userId?: number) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(queryHistory).orderBy(desc(queryHistory.createdAt)).limit(20);
  return userId === undefined ? query : query.where(eq(queryHistory.userId, userId));
}

export async function createClassification(input: typeof classificationRecords.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(classificationRecords).values(input);
  return result[0]?.insertId ? Number(result[0].insertId) : undefined;
}

export async function createEscalation(input: typeof escalationRequests.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(escalationRequests).values(input);
  return result[0]?.insertId ? Number(result[0].insertId) : undefined;
}

export async function listEscalations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(escalationRequests).orderBy(desc(escalationRequests.createdAt)).limit(50);
}

export async function createAuditEvent(input: typeof auditEvents.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditEvents).values(input);
}

export async function seedCorpus(
  sources: Array<typeof sourceDocuments.$inferInsert>,
  records: Array<Omit<typeof knowledgeRecords.$inferInsert, "documentId"> & { sourceName: string }>,
) {
  const db = await getDb();
  if (!db) return;
  const sourceIds = new Map<string, number>();
  const existingSources = await db.select({ id: sourceDocuments.id, name: sourceDocuments.name }).from(sourceDocuments);
  for (const source of existingSources) sourceIds.set(source.name, source.id);

  for (const source of sources) {
    if (sourceIds.has(source.name)) continue;
    const result = await db.insert(sourceDocuments).values(source);
    if (result[0]?.insertId) sourceIds.set(source.name, Number(result[0].insertId));
  }

  const existingRecords = await db.select({ id: knowledgeRecords.id, documentId: knowledgeRecords.documentId, title: knowledgeRecords.title }).from(knowledgeRecords);
  const existingRecordKeys = new Set(existingRecords.map(record => `${record.documentId}:${record.title}`));

  for (const record of records) {
    const documentId = sourceIds.get(record.sourceName);
    if (!documentId) continue;
    const key = `${documentId}:${record.title}`;
    if (existingRecordKeys.has(key)) continue;
    const { sourceName, ...knowledge } = record;
    await db.insert(knowledgeRecords).values({ ...knowledge, documentId });
    existingRecordKeys.add(key);
  }
}
