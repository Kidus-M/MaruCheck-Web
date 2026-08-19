"use server";

import { randomBytes, randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createDatabase } from "@/db";
import { project, projectIngestToken, qaMemory, qualityContract } from "@/db/schema";
import { requireWorkspaceContext } from "@/lib/session";
import { hashProjectToken } from "@/lib/project-tokens";

export interface ConnectProjectState {
  readonly message: string;
  readonly projectSlug?: string;
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
  const database = getDatabase();

  try {
    const [createdProject] = await database
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

    await database.insert(projectIngestToken).values({
      organizationId: context.organization.id,
      projectId: createdProject.id,
      tokenHash,
      tokenPrefix: token.slice(0, 12),
    });
  } catch (error) {
    console.error("Unable to connect project", error);
    return {
      message: "That repository or project slug is already connected to this organization.",
      status: "error",
    };
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

  await getDatabase().insert(qualityContract).values({
    contractKey,
    criticality,
    intent,
    organizationId: context.organization.id,
    owner,
    title,
  });
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

  await getDatabase()
    .insert(qaMemory)
    .values({
      memoryKey: `MEM-${randomUUID().slice(0, 8).toUpperCase()}`,
      organizationId: context.organization.id,
      relatedContracts: relatedContract ? [relatedContract] : [],
      rootCause,
      severity: severity as "critical" | "high" | "low" | "medium",
      summary,
      tags,
      title,
    });
  revalidatePath("/memory");
  redirect("/memory");
}

function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required for hosted product writes.");
  return createDatabase(databaseUrl);
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
