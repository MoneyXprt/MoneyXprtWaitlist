import { sql } from "drizzle-orm";
import { pgTable, text, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const waitlist = pgTable("waitlist", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id"), // references auth.users(id)
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  meta: jsonb("meta"),
});

export const insertWaitlistSchema = createInsertSchema(waitlist).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email("Please enter a valid email address"),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
}).extend({
  userId: z.string().uuid().optional(),
  prompt: z.string().min(1),
  response: z.string().min(1),
  meta: z.record(z.any()).optional(),
});

export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type Waitlist = typeof waitlist.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
