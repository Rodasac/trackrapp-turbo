CREATE TYPE "public"."ai_tip_category" AS ENUM('savings', 'warning', 'info', 'comparison');--> statement-breakpoint
CREATE TABLE "ai_tips" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"category" "ai_tip_category" NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_tips" ADD CONSTRAINT "ai_tips_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_tips_userId_idx" ON "ai_tips" USING btree ("user_id");