CREATE TABLE "clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"short_code" varchar(10) NOT NULL,
	"clicked_at" timestamp DEFAULT now() NOT NULL,
	"ip" varchar(45),
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"short_code" varchar(10) NOT NULL,
	"original_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"click_count" integer DEFAULT 0,
	"last_accessed" timestamp,
	CONSTRAINT "links_shortCode_unique" UNIQUE("short_code")
);
