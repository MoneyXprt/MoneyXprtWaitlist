import { sql } from "drizzle-orm";
import { pgTable, text, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const waitlist = pgTable("waitlist", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id"),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  meta: jsonb("meta"),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  fullName: text("full_name"),
  incomeRange: text("income_range"),
  entityType: text("entity_type"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const usageDaily = pgTable(
  "usage_daily",
  {
    userId: uuid("user_id").notNull(),
    day: text("day").notNull().default(sql`current_date`),
    prompts: text("prompts").default("0"),
    tokensIn: text("tokens_in").default("0"),
    tokensOut: text("tokens_out").default("0"),
  },
  (table) => ({
    pk: sql`PRIMARY KEY (${table.userId}, ${table.day})`,
  })
);

export const billing = pgTable("billing", {
  userId: uuid("user_id").primaryKey(),
  isActive: text("is_active").default("false"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  kind: text("kind").notNull(),
  sha256Hex: text("sha256_hex"),
  inputSummary: jsonb("input_summary"),
  outputSummary: jsonb("output_summary"),
  rawOutput: text("raw_output"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/**
 * Define insertWaitlistSchema explicitly to avoid drizzle-zod omit inference issues.
 * We only accept a valid email address; id/createdAt are generated.
 */
export const insertWaitlistSchema = z.object({
  address: z.string().email("Please enter a valid email address"),
});

export const insertConversationSchema = createInsertSchema(conversations)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    userId: z.string().uuid().optional(),
    prompt: z.string().min(1),
    response: z.string().min(1),
    meta: z.record(z.any()).optional(),
  });

export const insertProfileSchema = createInsertSchema(profiles)
  .omit({
    createdAt: true,
  })
  .extend({
    id: z.string().uuid(),
    fullName: z.string().min(1, "Full name is required"),
    incomeRange: z.enum(["100k-250k", "250k-500k", "500k-1m", "1m-plus"], {
      required_error: "Please select an income range",
    }),
    entityType: z.enum(["individual", "sole-proprietor", "llc", "s-corp", "c-corp"], {
      required_error: "Please select an entity type",
    }),
  });

export const insertUsageDailySchema = createInsertSchema(usageDaily).extend({
  userId: z.string().uuid(),
  day: z.string().optional(),
  prompts: z.string().optional(),
  tokensIn: z.string().optional(),
  tokensOut: z.string().optional(),
});

export const insertBillingSchema = createInsertSchema(billing).extend({
  userId: z.string().uuid(),
  isActive: z.string().optional(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
});

export const insertReportSchema = createInsertSchema(reports)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    userId: z.string().uuid(),
    kind: z.string().min(1),
    sha256Hex: z.string().optional(),
    inputSummary: z.record(z.any()).optional(),
    outputSummary: z.record(z.any()).optional(),
    rawOutput: z.string().optional(),
  });

// Types
export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type Waitlist = typeof waitlist.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type InsertUsageDaily = z.infer<typeof insertUsageDailySchema>;
export type UsageDaily = typeof usageDaily.$inferSelect;

export type InsertBilling = z.infer<typeof insertBillingSchema>;
export type Billing = typeof billing.$inferSelect;

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
