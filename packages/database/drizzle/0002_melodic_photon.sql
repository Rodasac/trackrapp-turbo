CREATE TABLE "platform_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"total_subscriptions" integer DEFAULT 0 NOT NULL,
	"total_users" integer DEFAULT 0 NOT NULL,
	"total_reminders" integer DEFAULT 0 NOT NULL,
	"total_saved" numeric(12, 2) DEFAULT '0' NOT NULL,
	"computed_at" timestamp DEFAULT now() NOT NULL
);
