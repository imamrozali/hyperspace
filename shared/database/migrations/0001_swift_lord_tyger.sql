DROP INDEX "user_identifiers_type_value_index";--> statement-breakpoint
CREATE UNIQUE INDEX "user_identifiers_email_unique" ON "user_identifiers" USING btree ("value") WHERE "user_identifiers"."type" = 'email';--> statement-breakpoint
CREATE UNIQUE INDEX "user_identifiers_username_unique" ON "user_identifiers" USING btree ("value") WHERE "user_identifiers"."type" = 'username';