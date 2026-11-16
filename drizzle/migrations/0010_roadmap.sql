CREATE TABLE "roadmap" (
	"user_id" text PRIMARY KEY NOT NULL,
	"answers" jsonb NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"done" jsonb NOT NULL,
	"history" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "roadmap" ADD CONSTRAINT "roadmap_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;