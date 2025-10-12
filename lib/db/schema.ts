import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  uuid,
  timestamp,
  jsonb,
  integer,
  boolean,
  numeric,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

// ========== Core app tables ==========

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
  }
);

// Keep underlying table name as "billing" while exporting canonical name `subscription`
export const subscription = pgTable("billing", {
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

export const aiNarrativeCache = pgTable("ai_narrative_cache", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: uuid("profile_id").notNull(),
  inputHash: text("input_hash").notNull(),
  narrative: jsonb("narrative").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Household (new canonical table; safe to generate later)
export const household = pgTable("household", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: uuid("owner_id"), // references profiles.id logically
  name: text("name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Plan aggregates map to existing recommendations tables to avoid destructive renames
export const plan = pgTable("recommendations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  snapshot: jsonb("snapshot"),
  totalSavingsEst: numeric("total_savings_est", { precision: 14, scale: 2 }).default("0"),
  riskScore: integer("risk_score").default(0),
  complexity: integer("complexity").default(0),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const planItem = pgTable("recommendation_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  recoId: uuid("reco_id").notNull(),
  strategyId: uuid("strategy_id").notNull(),
  savingsEst: numeric("savings_est", { precision: 14, scale: 2 }).notNull(),
  cashOutlayEst: numeric("cash_outlay_est", { precision: 14, scale: 2 }),
  stateAddbacks: jsonb("state_addbacks"),
  flags: jsonb("flags"),
  steps: jsonb("steps"),
});

// Calculation snapshot (new canonical table)
export const calcSnapshot = pgTable("calc_snapshot", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  kind: text("kind").notNull(), // e.g., 'engine_input' | 'engine_output'
  payload: jsonb("payload"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ========== Strategy engine params (enums + tables) ==========

export const filingStatusEnum = pgEnum("filing_status", [
  "single",
  "married_joint",
  "married_separate",
  "head",
]);

export const entityTypeEnum = pgEnum("entity_type", [
  "sole_prop",
  "s_corp",
  "partnership",
  "c_corp",
  "disregarded_llc",
]);

export const incomeSourceEnum = pgEnum("income_source", [
  "w2",
  "k1",
  "1099",
  "schc",
  "passive_re",
  "interest",
  "div",
  "capg",
]);

export const propertyUseEnum = pgEnum("property_use", [
  "rental_res",
  "rental_comm",
  "STR",
  "primary",
]);

export const materialParticipationEnum = pgEnum("material_participation", [
  "none",
  "100",
  "500",
  "MBP",
]);

export const agiBandEnum = pgEnum("agi_band", ["lt-200", "200-500", "500-1M", "1M-5M", "5M+"]);

export const taxProfiles = pgTable("tax_profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id"),
  filingStatus: filingStatusEnum("filing_status").notNull(),
  primaryState: text("primary_state").notNull(),
  residencyDays: jsonb("residency_days"),
  dependents: integer("dependents").default(0),
  ages: jsonb("ages"),
  agiBand: agiBandEnum("agi_band"),
  itemize: boolean("itemize").default(false),
  year: integer("year").notNull(),
});

export const entitiesTable = pgTable("entities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id"),
  type: entityTypeEnum("type").notNull(),
  ownershipPct: numeric("ownership_pct", { precision: 7, scale: 4 }),
  reasonableCompEst: numeric("reasonable_comp_est", { precision: 14, scale: 2 }),
});

export const incomeStreams = pgTable("income_streams", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: uuid("profile_id").notNull(),
  source: incomeSourceEnum("source").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  qbiFlag: boolean("qbi_flag").default(false),
});

export const propertiesTable = pgTable("properties", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  entityId: uuid("entity_id"),
  use: propertyUseEnum("use").notNull(),
  placedInService: date("placed_in_service"),
  costBasis: numeric("cost_basis", { precision: 14, scale: 2 }),
  landAllocPct: numeric("land_alloc_pct", { precision: 5, scale: 2 }),
  bonusEligible: boolean("bonus_eligible").default(true),
  materialParticipation: materialParticipationEnum("material_participation"),
});

export const strategies = pgTable("strategies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  active: boolean("active").default(true),
  requiredInputs: jsonb("required_inputs"),
});

export const strategyRules = pgTable("strategy_rules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  strategyId: uuid("strategy_id").notNull(),
  version: text("version").default("v1"),
  eligibilityDsl: text("eligibility_dsl").notNull(),
  calcFn: text("calc_fn").notNull(),
  reqDocs: jsonb("req_docs"),
  deadlines: jsonb("deadlines"),
  riskLevel: integer("risk_level").default(2),
  stateOverrides: jsonb("state_overrides"),
});

export const lawParameters = pgTable("law_parameters", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  codeRef: text("code_ref").notNull(),
  effStart: date("eff_start").notNull(),
  effEnd: date("eff_end"),
  params: jsonb("params"),
  version: text("version").default("2025"),
});

export const stateParameters = pgTable("state_parameters", {
  state: text("state").primaryKey(),
  ptetAvailable: boolean("ptet_available").default(false),
  ptetRate: numeric("ptet_rate", { precision: 6, scale: 4 }).default("0"),
  conformity: jsonb("conformity"),
  lastReviewed: date("last_reviewed"),
});

// ========== Zod insert schemas and exported types ==========

export const insertWaitlistSchema = z.object({
  address: z.string().email("Please enter a valid email address"),
});

export const insertConversationSchema = z.object({
  userId: z.string().uuid().optional(),
  prompt: z.string().min(1),
  response: z.string().min(1),
  meta: z.record(z.any()).optional(),
});

export const insertProfileSchema = z.object({
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

export const insertSubscriptionSchema = createInsertSchema(subscription).extend({
  userId: z.string().uuid(),
  isActive: z.string().optional(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
});

export const insertReportSchema = z.object({
  userId: z.string().uuid(),
  kind: z.string().min(1),
  sha256Hex: z.string().optional(),
  inputSummary: z.record(z.any()).optional(),
  outputSummary: z.record(z.any()).optional(),
  rawOutput: z.string().optional(),
});

// Drizzle model types
export type Profile = InferSelectModel<typeof profiles>;
export type InsertProfile = InferInsertModel<typeof profiles>;

export type Subscription = InferSelectModel<typeof subscription>;
export type InsertSubscription = InferInsertModel<typeof subscription>;

export type UsageDaily = InferSelectModel<typeof usageDaily>;
export type InsertUsageDaily = InferInsertModel<typeof usageDaily>;

export type Waitlist = InferSelectModel<typeof waitlist>;
export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;

export type Conversation = InferSelectModel<typeof conversations>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Report = InferSelectModel<typeof reports>;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type Household = InferSelectModel<typeof household>;
export type InsertHousehold = InferInsertModel<typeof household>;

export type Plan = InferSelectModel<typeof plan>;
export type InsertPlan = InferInsertModel<typeof plan>;

export type PlanItem = InferSelectModel<typeof planItem>;
export type InsertPlanItem = InferInsertModel<typeof planItem>;

export type CalcSnapshot = InferSelectModel<typeof calcSnapshot>;
export type InsertCalcSnapshot = InferInsertModel<typeof calcSnapshot>;

// Supabase Database typing (preserve existing consumer expectations)
export type Database = {
  public: {
    Tables: {
      waitlist: typeof waitlist;
      conversations: typeof conversations;
      profiles: typeof profiles;
      usage_daily: typeof usageDaily;
      billing: typeof subscription;
      reports: typeof reports;
      ai_narrative_cache: typeof aiNarrativeCache;
      recommendations: typeof plan;
      recommendation_items: typeof planItem;
      tax_profiles: typeof taxProfiles;
      income_streams: typeof incomeStreams;
      properties: typeof propertiesTable;
      law_parameters: typeof lawParameters;
      state_parameters: typeof stateParameters;
    };
    Views: { [key: string]: never };
    Functions: { [key: string]: never };
    Enums: { [key: string]: never };
  };
};
