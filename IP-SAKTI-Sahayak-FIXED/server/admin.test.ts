import { describe, expect, it, vi } from "vitest";

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return {
    ...actual,
    updateSourceDocument: vi.fn().mockResolvedValue(undefined),
    updateKnowledgeRecord: vi.fn().mockResolvedValue(undefined),
    createAuditEvent: vi.fn().mockResolvedValue(undefined),
  };
});

import { appRouter } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";

type UserRole = "user" | "admin";

function createContext(role: UserRole): TrpcContext {
  return {
    user: {
      id: role === "admin" ? 2 : 1,
      openId: `${role}-test-user`,
      email: `${role}@example.com`,
      name: role === "admin" ? "Admin Test" : "User Test",
      loginMethod: "test",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin source and knowledge management", () => {
  it("rejects source edits from non-admin users", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.sources.adminUpdate({ id: 1, verificationStatus: "verified" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects knowledge chunk edits from non-admin users", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.sources.adminUpdateKnowledge({ id: 1, isActive: false })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("validates source URLs before an admin mutation can run", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    await expect(caller.sources.adminCreate({
      name: "Example source",
      authority: "Example authority",
      url: "not-a-url",
      category: "regulatory",
      jurisdiction: "india",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("persists a source verification and activation update", async () => {
    const update = vi.mocked(db.updateSourceDocument);
    const audit = vi.mocked(db.createAuditEvent);
    update.mockClear();
    audit.mockClear();
    const caller = appRouter.createCaller(createContext("admin"));

    await expect(caller.sources.adminUpdate({ id: 7, versionLabel: "2026 review", effectiveDate: "2026-08-29", verificationStatus: "verified", isActive: true })).resolves.toEqual({ success: true, id: 7 });
    expect(update).toHaveBeenCalledWith(7, { versionLabel: "2026 review", effectiveDate: "2026-08-29", verificationStatus: "verified", isActive: true });
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ action: "source.update", entityId: 7 }));
  });

  it("persists a knowledge chunk content and activation update", async () => {
    const update = vi.mocked(db.updateKnowledgeRecord);
    const audit = vi.mocked(db.createAuditEvent);
    update.mockClear();
    audit.mockClear();
    const caller = appRouter.createCaller(createContext("admin"));

    await expect(caller.sources.adminUpdateKnowledge({ id: 11, title: "Revised locator", section: "Section 3", content: "Verified passage content with enough detail for the indexed evidence record.", keywords: "ABS, biodiversity", isActive: false })).resolves.toEqual({ success: true, id: 11 });
    expect(update).toHaveBeenCalledWith(11, { title: "Revised locator", section: "Section 3", content: "Verified passage content with enough detail for the indexed evidence record.", keywords: "ABS, biodiversity", isActive: false });
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ action: "knowledge.update", entityId: 11 }));
  });
});
