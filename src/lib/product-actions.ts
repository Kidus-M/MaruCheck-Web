"use server";

import { randomBytes, randomUUID } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createTransactionalDatabase } from "@/db";
import {
  project,
  projectIngestToken,
  qaMemory,
  qaMemoryCandidate,
  qualityContract,
} from "@/db/schema";
import { FeedbackValidationError, parseFeedbackReviewInput } from "@/lib/production-feedback";
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

export interface ReviewFeedbackState {
  readonly message: string;
  readonly status: "error" | "idle" | "success";
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

export async function reviewProductionFeedbackAction(
  _previousState: ReviewFeedbackState,
  formData: FormData,
): Promise<ReviewFeedbackState> {
  const context = await requireWorkspaceContext();
  const candidateId = field(formData, "candidateId");
  if (
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/iu.test(candidateId)
  ) {
    return { message: "The feedback candidate identifier is invalid.", status: "error" };
  }

  let review: ReturnType<typeof parseFeedbackReviewInput>;
  try {
    review = parseFeedbackReviewInput({
      decision: field(formData, "decision"),
      regressionAdapter: field(formData, "regressionAdapter") || undefined,
      regressionId: field(formData, "regressionId") || undefined,
      regressionPath: field(formData, "regressionPath") || undefined,
      rootCause: field(formData, "rootCause") || undefined,
    });
  } catch (error) {
    return {
      message:
        error instanceof FeedbackValidationError
          ? error.message
          : "The feedback review could not be validated.",
      status: "error",
    };
  }

  const connection = getDatabase();
  try {
    const result = await connection.database.transaction(async (transaction) => {
      const [candidate] = await transaction
        .select({
          projectId: qaMemoryCandidate.projectId,
          regressionProposal: qaMemoryCandidate.regressionProposal,
          relatedContracts: qaMemoryCandidate.relatedContracts,
          relatedFiles: qaMemoryCandidate.relatedFiles,
          severity: qaMemoryCandidate.severity,
          status: qaMemoryCandidate.status,
          summary: qaMemoryCandidate.summary,
          title: qaMemoryCandidate.title,
        })
        .from(qaMemoryCandidate)
        .where(
          and(
            eq(qaMemoryCandidate.id, candidateId),
            eq(qaMemoryCandidate.organizationId, context.organization.id),
          ),
        )
        .limit(1)
        .for("update");
      if (!candidate) return "not-found" as const;
      if (candidate.status !== "pending") return "already-reviewed" as const;

      if (review.decision === "reject") {
        const reviewedAt = new Date();
        await transaction
          .update(qaMemoryCandidate)
          .set({
            reviewedAt,
            reviewedBy: context.viewer.email,
            status: "rejected",
            updatedAt: reviewedAt,
          })
          .where(eq(qaMemoryCandidate.id, candidateId));
        return "rejected" as const;
      }

      const [memory] = await transaction
        .insert(qaMemory)
        .values({
          memoryKey: `MEM-${randomUUID().slice(0, 8).toUpperCase()}`,
          organizationId: context.organization.id,
          projectId: candidate.projectId,
          regressionCount: 1,
          regressionTests: [
            {
              adapter: review.regression.adapter,
              id: review.regression.id,
              path: review.regression.path,
              requirementRefs: candidate.regressionProposal.requirementRefs,
            },
          ],
          relatedContracts: candidate.relatedContracts,
          relatedFiles: candidate.relatedFiles,
          rootCause: review.rootCause,
          severity: candidate.severity,
          source: "production-feedback",
          summary: candidate.summary,
          tags: ["production-feedback", "reviewed"],
          title: candidate.title,
          type: "production-regression",
        })
        .returning({ id: qaMemory.id });
      if (!memory) throw new Error("QA memory creation returned no record.");
      const reviewedAt = new Date();
      await transaction
        .update(qaMemoryCandidate)
        .set({
          memoryId: memory.id,
          reviewedAt,
          reviewedBy: context.viewer.email,
          rootCause: review.rootCause,
          status: "approved",
          updatedAt: reviewedAt,
        })
        .where(eq(qaMemoryCandidate.id, candidateId));
      return "approved" as const;
    });

    if (result === "not-found") {
      return { message: "Feedback was not found in this organization.", status: "error" };
    }
    if (result === "already-reviewed") {
      return { message: "This feedback proposal was already reviewed.", status: "error" };
    }
    revalidatePath("/feedback");
    revalidatePath("/memory");
    return {
      message:
        result === "approved"
          ? "QA memory and its reviewed regression link are now active."
          : "The proposal was rejected without creating QA memory.",
      status: "success",
    };
  } catch (error) {
    console.error("Unable to review production feedback", error);
    return { message: "The feedback review could not be saved. Try again.", status: "error" };
  } finally {
    await connection.close();
  }
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
        .where(and(eq(project.organizationId, context.organization.id), eq(project.slug, slug)))
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
    if (!rotated)
      return { message: "Project was not found in this organization.", status: "error" };
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
  if (context.viewer.role !== "Owner")
    throw new Error("Only organization owners can revoke tokens.");
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
