CREATE TABLE "feedback_ingestion_rate_window" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_id" uuid NOT NULL,
	"organization_id" text NOT NULL,
	"window_started_at" timestamp with time zone NOT NULL,
	"request_count" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "feedback_rate_count_positive" CHECK ("feedback_ingestion_rate_window"."request_count" > 0)
);
--> statement-breakpoint
CREATE TABLE "production_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" uuid NOT NULL,
	"token_id" uuid,
	"verification_run_id" uuid,
	"source" text NOT NULL,
	"event_type" text NOT NULL,
	"fingerprint" text NOT NULL,
	"severity" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"exception_type" text NOT NULL,
	"environment" text NOT NULL,
	"release" text,
	"commit_sha" text,
	"branch" text,
	"frames" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"related_files" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"requirement_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"reproduction_proposal" jsonb NOT NULL,
	"regression_proposal" jsonb NOT NULL,
	"occurrence_count" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"first_received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"retention_until" timestamp with time zone NOT NULL,
	"resolved_at" timestamp with time zone,
	CONSTRAINT "production_feedback_occurrence_positive" CHECK ("production_feedback"."occurrence_count" > 0)
);
--> statement-breakpoint
CREATE TABLE "production_feedback_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" uuid NOT NULL,
	"feedback_id" uuid,
	"token_id" uuid,
	"event_key" text NOT NULL,
	"payload_hash" text NOT NULL,
	"action" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "production_feedback_contract" (
	"feedback_id" uuid NOT NULL,
	"contract_id" uuid NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "production_feedback_delivery" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" uuid NOT NULL,
	"feedback_id" uuid NOT NULL,
	"token_id" uuid,
	"source" text NOT NULL,
	"event_key" text NOT NULL,
	"payload_hash" text NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qa_memory_candidate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" uuid NOT NULL,
	"feedback_id" uuid NOT NULL,
	"memory_id" uuid,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"root_cause" text,
	"severity" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"related_contracts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"related_files" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reproduction_proposal" jsonb NOT NULL,
	"regression_proposal" jsonb NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feedback_ingestion_rate_window" ADD CONSTRAINT "feedback_ingestion_rate_window_token_id_project_ingest_token_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."project_ingest_token"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_ingestion_rate_window" ADD CONSTRAINT "feedback_ingestion_rate_window_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_feedback" ADD CONSTRAINT "production_feedback_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_feedback" ADD CONSTRAINT "production_feedback_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_feedback" ADD CONSTRAINT "production_feedback_token_id_project_ingest_token_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."project_ingest_token"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_feedback" ADD CONSTRAINT "production_feedback_verification_run_id_verification_run_id_fk" FOREIGN KEY ("verification_run_id") REFERENCES "public"."verification_run"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_feedback_audit" ADD CONSTRAINT "production_feedback_audit_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_feedback_audit" ADD CONSTRAINT "production_feedback_audit_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_feedback_audit" ADD CONSTRAINT "production_feedback_audit_feedback_id_production_feedback_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."production_feedback"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_feedback_audit" ADD CONSTRAINT "production_feedback_audit_token_id_project_ingest_token_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."project_ingest_token"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_feedback_contract" ADD CONSTRAINT "production_feedback_contract_feedback_id_production_feedback_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."production_feedback"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_feedback_contract" ADD CONSTRAINT "production_feedback_contract_contract_id_quality_contract_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."quality_contract"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_feedback_contract" ADD CONSTRAINT "production_feedback_contract_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_feedback_contract" ADD CONSTRAINT "production_feedback_contract_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_feedback_delivery" ADD CONSTRAINT "production_feedback_delivery_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_feedback_delivery" ADD CONSTRAINT "production_feedback_delivery_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_feedback_delivery" ADD CONSTRAINT "production_feedback_delivery_feedback_id_production_feedback_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."production_feedback"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_feedback_delivery" ADD CONSTRAINT "production_feedback_delivery_token_id_project_ingest_token_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."project_ingest_token"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qa_memory_candidate" ADD CONSTRAINT "qa_memory_candidate_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qa_memory_candidate" ADD CONSTRAINT "qa_memory_candidate_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qa_memory_candidate" ADD CONSTRAINT "qa_memory_candidate_feedback_id_production_feedback_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."production_feedback"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qa_memory_candidate" ADD CONSTRAINT "qa_memory_candidate_memory_id_qa_memory_id_fk" FOREIGN KEY ("memory_id") REFERENCES "public"."qa_memory"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "feedback_rate_token_window_unique" ON "feedback_ingestion_rate_window" USING btree ("token_id","window_started_at");--> statement-breakpoint
CREATE INDEX "feedback_rate_window_idx" ON "feedback_ingestion_rate_window" USING btree ("window_started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "production_feedback_project_fingerprint_unique" ON "production_feedback" USING btree ("project_id","source","fingerprint");--> statement-breakpoint
CREATE INDEX "production_feedback_organization_received_idx" ON "production_feedback" USING btree ("organization_id","last_received_at");--> statement-breakpoint
CREATE INDEX "production_feedback_project_commit_idx" ON "production_feedback" USING btree ("project_id","commit_sha");--> statement-breakpoint
CREATE INDEX "production_feedback_retention_idx" ON "production_feedback" USING btree ("retention_until");--> statement-breakpoint
CREATE INDEX "production_feedback_audit_project_created_idx" ON "production_feedback_audit" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "production_feedback_audit_feedback_idx" ON "production_feedback_audit" USING btree ("feedback_id");--> statement-breakpoint
CREATE UNIQUE INDEX "production_feedback_contract_unique" ON "production_feedback_contract" USING btree ("feedback_id","contract_id");--> statement-breakpoint
CREATE INDEX "production_feedback_contract_contract_idx" ON "production_feedback_contract" USING btree ("contract_id");--> statement-breakpoint
CREATE UNIQUE INDEX "production_feedback_delivery_project_event_unique" ON "production_feedback_delivery" USING btree ("project_id","source","event_key");--> statement-breakpoint
CREATE INDEX "production_feedback_delivery_feedback_idx" ON "production_feedback_delivery" USING btree ("feedback_id");--> statement-breakpoint
CREATE INDEX "production_feedback_delivery_received_idx" ON "production_feedback_delivery" USING btree ("received_at");--> statement-breakpoint
CREATE UNIQUE INDEX "qa_memory_candidate_feedback_unique" ON "qa_memory_candidate" USING btree ("feedback_id");--> statement-breakpoint
CREATE INDEX "qa_memory_candidate_organization_status_idx" ON "qa_memory_candidate" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "qa_memory_candidate_project_idx" ON "qa_memory_candidate" USING btree ("project_id");