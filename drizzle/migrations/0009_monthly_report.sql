CREATE TABLE "monthly_report" (
	"user_id" text NOT NULL,
	"period" text NOT NULL,
	"kind" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "monthly_report_user_id_period_pk" PRIMARY KEY("user_id","period")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "monthly_report_emails" boolean;--> statement-breakpoint
ALTER TABLE "monthly_report" ADD CONSTRAINT "monthly_report_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;