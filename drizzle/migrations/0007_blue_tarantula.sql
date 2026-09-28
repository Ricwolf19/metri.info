CREATE TABLE "app_release" (
	"id" text PRIMARY KEY NOT NULL,
	"version" text NOT NULL,
	"tag" text NOT NULL,
	"runtime_version" text NOT NULL,
	"apk_url" text NOT NULL,
	"sha256" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"release_url" text NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"notified_at" timestamp with time zone,
	"notify_cursor" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_release_version_unique" UNIQUE("version"),
	CONSTRAINT "app_release_tag_unique" UNIQUE("tag")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "release_emails" boolean DEFAULT true NOT NULL;