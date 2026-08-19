CREATE TABLE "contract_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"contract_id" uuid NOT NULL,
	"version" text NOT NULL,
	"content_hash" text NOT NULL,
	"content" jsonb NOT NULL,
	"approval" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" uuid NOT NULL,
	"run_id" uuid NOT NULL,
	"evidence_key" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"adapter" text NOT NULL,
	"tool" text NOT NULL,
	"diagnostic" text DEFAULT '' NOT NULL,
	"duration_ms" integer DEFAULT 0 NOT NULL,
	"requirement_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"artifact_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" uuid NOT NULL,
	"run_id" uuid NOT NULL,
	"contract_id" uuid,
	"finding_key" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"severity" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"blocking" boolean DEFAULT false NOT NULL,
	"owner" text DEFAULT 'Unassigned' NOT NULL,
	"requirement_ref" text,
	"expected" text DEFAULT '' NOT NULL,
	"actual" text NOT NULL,
	"explanation" text DEFAULT '' NOT NULL,
	"reproduction" jsonb NOT NULL,
	"evidence_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"artifact_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"occurrence_count" integer DEFAULT 1 NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"repository" text NOT NULL,
	"branch" text DEFAULT 'main' NOT NULL,
	"status" text DEFAULT 'running' NOT NULL,
	"risk" integer DEFAULT 0 NOT NULL,
	"coverage" integer DEFAULT 0 NOT NULL,
	"finding_count" integer DEFAULT 0 NOT NULL,
	"active_contracts" integer DEFAULT 0 NOT NULL,
	"last_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_risk_range" CHECK ("project"."risk" between 0 and 100),
	CONSTRAINT "project_coverage_range" CHECK ("project"."coverage" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "project_ingest_token" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text DEFAULT 'CI' NOT NULL,
	"token_prefix" text NOT NULL,
	"token_hash" text NOT NULL,
	"last_used_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qa_memory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" uuid,
	"memory_key" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"root_cause" text NOT NULL,
	"severity" text NOT NULL,
	"type" text DEFAULT 'bug' NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"related_contracts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"related_files" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"regression_tests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"regression_count" integer DEFAULT 0 NOT NULL,
	"last_matched_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quality_contract" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" uuid,
	"contract_key" text NOT NULL,
	"title" text NOT NULL,
	"intent" text DEFAULT '' NOT NULL,
	"owner" text DEFAULT 'Unassigned' NOT NULL,
	"criticality" text DEFAULT 'high' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"current_version" text DEFAULT 'draft' NOT NULL,
	"requirements" integer DEFAULT 0 NOT NULL,
	"coverage" integer DEFAULT 0 NOT NULL,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quality_contract_coverage_range" CHECK ("quality_contract"."coverage" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "requirement_coverage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" uuid,
	"contract_id" uuid,
	"area_key" text NOT NULL,
	"label" text NOT NULL,
	"color" text NOT NULL,
	"covered" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"evidence_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_run" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" uuid NOT NULL,
	"run_key" text NOT NULL,
	"title" text NOT NULL,
	"commit_sha" text NOT NULL,
	"branch" text NOT NULL,
	"status" text NOT NULL,
	"risk" integer NOT NULL,
	"risk_level" text NOT NULL,
	"evidence_count" integer DEFAULT 0 NOT NULL,
	"duration_ms" integer,
	"gate_reasons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "verification_run_risk_range" CHECK ("verification_run"."risk" between 0 and 100)
);
--> statement-breakpoint
ALTER TABLE "contract_version" ADD CONSTRAINT "contract_version_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_version" ADD CONSTRAINT "contract_version_contract_id_quality_contract_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."quality_contract"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_run_id_verification_run_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."verification_run"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finding" ADD CONSTRAINT "finding_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finding" ADD CONSTRAINT "finding_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finding" ADD CONSTRAINT "finding_run_id_verification_run_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."verification_run"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finding" ADD CONSTRAINT "finding_contract_id_quality_contract_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."quality_contract"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_ingest_token" ADD CONSTRAINT "project_ingest_token_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_ingest_token" ADD CONSTRAINT "project_ingest_token_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qa_memory" ADD CONSTRAINT "qa_memory_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qa_memory" ADD CONSTRAINT "qa_memory_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_contract" ADD CONSTRAINT "quality_contract_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_contract" ADD CONSTRAINT "quality_contract_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requirement_coverage" ADD CONSTRAINT "requirement_coverage_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requirement_coverage" ADD CONSTRAINT "requirement_coverage_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requirement_coverage" ADD CONSTRAINT "requirement_coverage_contract_id_quality_contract_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."quality_contract"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_run" ADD CONSTRAINT "verification_run_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_run" ADD CONSTRAINT "verification_run_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "contract_version_contract_version_unique" ON "contract_version" USING btree ("contract_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "contract_version_contract_hash_unique" ON "contract_version" USING btree ("contract_id","content_hash");--> statement-breakpoint
CREATE INDEX "contract_version_organization_idx" ON "contract_version" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "evidence_run_key_unique" ON "evidence" USING btree ("run_id","evidence_key");--> statement-breakpoint
CREATE INDEX "evidence_organization_created_idx" ON "evidence" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "evidence_project_idx" ON "evidence" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "finding_run_key_unique" ON "finding" USING btree ("run_id","finding_key");--> statement-breakpoint
CREATE INDEX "finding_organization_status_idx" ON "finding" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "finding_project_status_idx" ON "finding" USING btree ("project_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "project_organization_slug_unique" ON "project" USING btree ("organization_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "project_organization_repository_unique" ON "project" USING btree ("organization_id","repository");--> statement-breakpoint
CREATE INDEX "project_organization_updated_idx" ON "project" USING btree ("organization_id","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "project_ingest_token_hash_unique" ON "project_ingest_token" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "project_ingest_token_project_idx" ON "project_ingest_token" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_ingest_token_organization_idx" ON "project_ingest_token" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "qa_memory_organization_key_unique" ON "qa_memory" USING btree ("organization_id","memory_key");--> statement-breakpoint
CREATE INDEX "qa_memory_organization_matched_idx" ON "qa_memory" USING btree ("organization_id","last_matched_at");--> statement-breakpoint
CREATE INDEX "qa_memory_project_idx" ON "qa_memory" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "quality_contract_organization_key_unique" ON "quality_contract" USING btree ("organization_id","contract_key");--> statement-breakpoint
CREATE INDEX "quality_contract_project_idx" ON "quality_contract" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "quality_contract_organization_updated_idx" ON "quality_contract" USING btree ("organization_id","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "requirement_coverage_organization_area_unique" ON "requirement_coverage" USING btree ("organization_id","area_key");--> statement-breakpoint
CREATE INDEX "requirement_coverage_project_idx" ON "requirement_coverage" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "verification_run_project_key_unique" ON "verification_run" USING btree ("project_id","run_key");--> statement-breakpoint
CREATE INDEX "verification_run_organization_completed_idx" ON "verification_run" USING btree ("organization_id","completed_at");--> statement-breakpoint
CREATE INDEX "verification_run_project_completed_idx" ON "verification_run" USING btree ("project_id","completed_at");