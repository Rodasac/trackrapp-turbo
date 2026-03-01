CREATE TABLE "user_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"auto_renew_default" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "tracked_subscriptions" ADD COLUMN "auto_renew" boolean;--> statement-breakpoint
ALTER TABLE "tracked_subscriptions" ADD COLUMN "previous_renewal_date" date;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;