"use server";

import { randomBytes, randomUUID } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createTransactionalDatabase } from "@/db";
import { project, projectIngestToken, qaMemory, qualityContract } from "@/db/schema";
import { requireWorkspaceContext } from "@/lib/session";
import { hashProjectToken } from "@/lib/project-tokens";

export interface ConnectProjectState {
  readonly message: string;
  readonly projectSlug?: string;
  readonly status: "error" | "idle" | "success";
  readonly token?: string;
}

export interface RotateProjectTokenState {
  readonly message: string;
  readonly status: "error" | "idle" | "success";
  readonly token?: string;
}

export async function connectProjectAction(
  _previousState: ConnectProjectState,
  formData: FormData,
): Promise<ConnectProjectState> {
  const context = await requireWorkspaceContext();
  if (context.viewer.role !== "Owner") {
    return { message: "Only organization owners can connect repositories.", status: "error" };
  }

  const name = field(formData, "name");
  const repository = field(formData, "repository");
  const branch = field(formData, "branch") || "main";
  if (!name || !repository) {
    return { message: "Project name and repository are required.", status: "error" };
  }

  const slug = slugify(name);
  if (!slug) return { message: "Use at least one letter or number in the name.", status: "error" };

  const token = `maru_${randomBytes(32).toString("base64url")}`;
  const tokenHash = hashProjectToken(token);
  const connection = getDatabase();

  try {
    await connection.database.transaction(async (transaction) => {
      const [createdProject] = await transaction
        .insert(project)
        .values({
          branch,
          name,
          organizationId: context.organization.id,
          repository,
          slug,
        })
        .returning({ id: project.id });
      if (!createdProject) throw new Error("Project creation did not return a record.");

      await transaction.insert(projectIngestToken).values({
        organizationId: context.organization.id,
        projectId: createdProject.id,
        tokenHash,
        tokenPrefix: token.slice(0, 12),
      });
    });
  } catch (error) {
    console.error("Unable to connect project", error);
    return {
      message: "That repository or project slug is already connected to this organization.",
      status: "error",
    };
  } finally {
    await connection.close();
  }

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  return {
    message: "Repository connected. Copy the token now; only its hash is stored.",
    projectSlug: slug,
    status: "success",
    token,
  };
}

export async function createContractAction(formData: FormData): Promise<void> {
  const context = await requireWorkspaceContext();
  const title = requiredField(formData, "title");
  const intent = requiredField(formData, "intent");
  const owner = requiredField(formData, "owner");
  const criticality = requiredField(formData, "criticality").toLowerCase();
  const contractKey = slugify(title);
  if (!contractKey) throw new Error("Contract title must contain a letter or number.");

  const connection = getDatabase();
  try {
    await connection.database.insert(qualityContract).values({
      contractKey,
      criticality,
      intent,
      organizationId: context.organization.id,
      owner,
      title,
    });
  } finally {
    await connection.close();
  }
  revalidatePath("/contracts");
  redirect("/contracts");
}

export async function createMemoryAction(formData: FormData): Promise<void> {
  const context = await requireWorkspaceContext();
  const title = requiredField(formData, "title");
  const summary = requiredField(formData, "summary");
  const rootCause = requiredField(formData, "rootCause");
  const severity = requiredField(formData, "severity").toLowerCase();
  const relatedContract = field(formData, "relatedContract");
  const tags = field(formData, "tags")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 20);

  const connection = getDatabase();
  try {
    await connection.database.insert(qaMemory).values({
      memoryKey: `MEM-${randomUUID().slice(0, 8).toUpperCase()}`,
      organizationId: context.organization.id,
      relatedContracts: relatedContract ? [relatedContract] : [],
      rootCause,
      severity: severity as "critical" | "high" | "low" | "medium",
      summary,
      tags,
      title,
    });
  } finally {
    await connection.close();
  }
  revalidatePath("/memory");
  redirect("/memory");
}

export async function rotateProjectTokenAction(
  _previousState: RotateProjectTokenState,
  formData: FormData,
): Promise<RotateProjectTokenState> {
  const context = await requireWorkspaceContext();
  if (context.viewer.role !== "Owner") {
    return { message: "Only organization owners can rotate project tokens.", status: "error" };
  }
  const slug = requiredField(formData, "slug");
  const token = `maru_${randomBytes(32).toString("base64url")}`;
  const connection = getDatabase();

  try {
    const rotated = await connection.database.transaction(async (transaction) => {
      const [targetProject] = await transaction
        .select({ id: project.id })
        .from(project)
        .where(
          and(eq(project.organizationId, context.organization.id), eq(project.slug, slug)),
        )
        .limit(1);
      if (!targetProject) return false;

      await transaction
        .update(projectIngestToken)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(projectIngestToken.organizationId, context.organization.id),
            eq(projectIngestToken.projectId, targetProject.id),
            isNull(projectIngestToken.revokedAt),
          ),
        );
      await transaction.insert(projectIngestToken).values({
        name: "CI",
        organizationId: context.organization.id,
        projectId: targetProject.id,
        tokenHash: hashProjectToken(token),
        tokenPrefix: token.slice(0, 12),
      });
      return true;
    });
    if (!rotated) return { message: "Project was not found in this organization.", status: "error" };
  } catch (error) {
    console.error("Unable to rotate project token", error);
    return { message: "The token could not be rotated. Try again.", status: "error" };
  } finally {
    await connection.close();
  }

  revalidatePath(`/projects/${slug}`);
  return {
    message: "The previous active token is revoked. Copy this replacement now.",
    status: "success",
    token,
  };
}

export async function revokeProjectTokenAction(formData: FormData): Promise<void> {
  const context = await requireWorkspaceContext();
  if (context.viewer.role !== "Owner") throw new Error("Only organization owners can revoke tokens.");
  const slug = requiredField(formData, "slug");
  const tokenId = requiredField(formData, "tokenId");
  const connection = getDatabase();
  try {
    const [targetProject] = await connection.database
      .select({ id: project.id })
      .from(project)
      .where(and(eq(project.organizationId, context.organization.id), eq(project.slug, slug)))
      .limit(1);
    if (!targetProject) throw new Error("Project was not found in this organization.");
    await connection.database
      .update(projectIngestToken)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(projectIngestToken.id, tokenId),
          eq(projectIngestToken.organizationId, context.organization.id),
          eq(projectIngestToken.projectId, targetProject.id),
          isNull(projectIngestToken.revokedAt),
        ),
      );
  } finally {
    await connection.close();
  }
  revalidatePath(`/projects/${slug}`);
}

function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required for hosted product writes.");
  return createTransactionalDatabase(databaseUrl);
}

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function requiredField(formData: FormData, name: string): string {
  const value = field(formData, name);
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
