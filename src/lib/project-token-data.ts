import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { createDatabase } from "@/db";
import { projectIngestToken } from "@/db/schema";
import { requireWorkspaceContext } from "@/lib/session";

export interface ProjectTokenSummary {
  readonly created: string;
  readonly expires: string;
  readonly id: string;
  readonly lastUsed: string;
  readonly name: string;
  readonly prefix: string;
  readonly status: "active" | "expired" | "revoked";
}

/** Return non-secret token metadata only; hashes and raw token values never leave the database. */
export async function getProjectTokenSummaries(
  projectId: string,
): Promise<readonly ProjectTokenSummary[]> {
  const context = await requireWorkspaceContext();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required to read project credentials.");
  const rows = await createDatabase(databaseUrl)
    .select({
      createdAt: projectIngestToken.createdAt,
      expiresAt: projectIngestToken.expiresAt,
      id: projectIngestToken.id,
      lastUsedAt: projectIngestToken.lastUsedAt,
      name: projectIngestToken.name,
      prefix: projectIngestToken.tokenPrefix,
      revokedAt: projectIngestToken.revokedAt,
    })
    .from(projectIngestToken)
    .where(
      and(
        eq(projectIngestToken.organizationId, context.organization.id),
        eq(projectIngestToken.projectId, projectId),
      ),
    )
    .orderBy(desc(projectIngestToken.createdAt))
    .limit(20);

  const now = Date.now();
  return rows.map((row) => ({
    created: absoluteDate(row.createdAt),
    expires: row.expiresAt ? absoluteDate(row.expiresAt) : "No expiry",
    id: row.id,
    lastUsed: row.lastUsedAt ? relativeTime(row.lastUsedAt) : "Never used",
    name: row.name,
    prefix: `${row.prefix}…`,
    status:
      row.revokedAt !== null
        ? "revoked"
        : row.expiresAt && row.expiresAt.getTime() <= now
          ? "expired"
          : "active",
  }));
}

function absoluteDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function relativeTime(date: Date): string {
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return absoluteDate(date);
}
