import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { type Waitlist, type InsertWaitlist, type Conversation, type InsertConversation, waitlist, conversations } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Waitlist operations
  getWaitlistEntry(email: string): Promise<Waitlist | undefined>
  createWaitlistEntry(entry: InsertWaitlist): Promise<Waitlist>
  
  // Conversation operations
  createConversation(conversation: InsertConversation): Promise<Conversation>
  getUserConversations(userId: string): Promise<Conversation[]>
}

export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  async createWaitlistEntry(entry: InsertWaitlist): Promise<Waitlist> {
    const result = await this.db.insert(waitlist).values(entry).returning();
    return result[0];
  }

  async getWaitlistEntry(email: string): Promise<Waitlist | undefined> {
    const result = await this.db.select().from(waitlist).where(eq(waitlist.email, email)).limit(1);
    return result[0];
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const result = await this.db.insert(conversations).values(conversation).returning();
    return result[0];
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const result = await this.db.select().from(conversations).where(eq(conversations.userId, userId));
    return result;
  }
}

export class MemStorage implements IStorage {
  private waitlistEntries: Map<string, Waitlist>;
  private conversationsList: Conversation[];

  constructor() {
    this.waitlistEntries = new Map();
    this.conversationsList = [];
  }

  async createWaitlistEntry(entry: InsertWaitlist): Promise<Waitlist> {
    const id = randomUUID();
    const waitlistEntry: Waitlist = { 
      ...entry, 
      id, 
      createdAt: new Date()
    };
    this.waitlistEntries.set(entry.email, waitlistEntry);
    return waitlistEntry;
  }

  async getWaitlistEntry(email: string): Promise<Waitlist | undefined> {
    return this.waitlistEntries.get(email);
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const newConversation: Conversation = {
      ...conversation,
      id,
      createdAt: new Date()
    };
    this.conversationsList.push(newConversation);
    return newConversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationsList.filter(conv => conv.userId === userId);
  }
}

// Use database storage if DATABASE_URL is provided, otherwise fall back to memory storage
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();