import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/** Core user table backing the scaffold auth flow. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const sourceDocuments = mysqlTable("source_documents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  authority: varchar("authority", { length: 255 }).notNull(),
  url: text("url").notNull(),
  category: mysqlEnum("category", ["ip", "regulatory", "abs", "prior_art", "standards"]).notNull(),
  jurisdiction: mysqlEnum("jurisdiction", ["india", "international", "both"]).notNull(),
  country: varchar("country", { length: 120 }),
  versionLabel: varchar("versionLabel", { length: 120 }),
  effectiveDate: varchar("effectiveDate", { length: 120 }),
  verificationStatus: mysqlEnum("verificationStatus", ["verified", "needs_review", "unverified"]).default("needs_review").notNull(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const knowledgeRecords = mysqlTable("knowledge_records", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  section: varchar("section", { length: 255 }),
  content: text("content").notNull(),
  keywords: text("keywords"),
  intent: mysqlEnum("intent", ["ip", "regulatory", "abs", "prior_art", "general"]).notNull(),
  jurisdiction: mysqlEnum("jurisdiction", ["india", "international", "both"]).notNull(),
  language: varchar("language", { length: 16 }).default("en").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  title: varchar("title", { length: 255 }).notNull(),
  language: varchar("language", { length: 16 }).default("en").notNull(),
  jurisdiction: mysqlEnum("jurisdiction", ["india", "international", "both", "unknown"]).default("india").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const queryHistory = mysqlTable("query_history", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId"),
  userId: int("userId"),
  question: text("question").notNull(),
  language: varchar("language", { length: 16 }).default("en").notNull(),
  intent: mysqlEnum("intent", ["ip", "regulatory", "abs", "prior_art", "general"]).notNull(),
  jurisdiction: mysqlEnum("jurisdiction", ["india", "international", "both", "unknown"]).notNull(),
  answer: text("answer").notNull(),
  confidence: mysqlEnum("confidence", ["high", "medium", "low"]).notNull(),
  evidenceJson: text("evidenceJson"),
  routingJson: text("routingJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const classificationRecords = mysqlTable("classification_records", {
  id: int("id").autoincrement().primaryKey(),
  queryId: int("queryId"),
  userId: int("userId"),
  productName: varchar("productName", { length: 255 }).notNull(),
  inputJson: text("inputJson").notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  confidence: mysqlEnum("confidence", ["high", "medium", "low"]).notNull(),
  explanation: text("explanation").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const escalationRequests = mysqlTable("escalation_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  queryId: int("queryId"),
  question: text("question").notNull(),
  contact: varchar("contact", { length: 255 }).notNull(),
  contextJson: text("contextJson"),
  status: mysqlEnum("status", ["new", "in_review", "resolved"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const auditEvents = mysqlTable("audit_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 120 }).notNull(),
  entityType: varchar("entityType", { length: 120 }).notNull(),
  entityId: int("entityId"),
  metadataJson: text("metadataJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SourceDocument = typeof sourceDocuments.$inferSelect;
export type KnowledgeRecord = typeof knowledgeRecords.$inferSelect;
export type QueryHistory = typeof queryHistory.$inferSelect;
export type ClassificationRecord = typeof classificationRecords.$inferSelect;
export type EscalationRequest = typeof escalationRequests.$inferSelect;
