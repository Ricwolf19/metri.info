CREATE TABLE "sync_row" (
	"user_id" text NOT NULL,
	"table_name" text NOT NULL,
	"row_id" text NOT NULL,
	"data" jsonb,
	"deleted" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp NOT NULL,
	"server_updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sync_row_user_id_table_name_row_id_pk" PRIMARY KEY("user_id","table_name","row_id")
);
--> statement-breakpoint
ALTER TABLE "sync_row" ADD CONSTRAINT "sync_row_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sync_row_pull_idx" ON "sync_row" USING btree ("user_id","server_updated_at");