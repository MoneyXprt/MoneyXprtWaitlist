import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import {
  type Waitlist,
  type InsertWaitlist,
  type Conversation,
  type InsertConversation,
  type Profile,
  type InsertProfile,
  waitlist,
  conversations,
  profiles,
} from "@/shared/schema"; // switched to "@/..."
import { randomUUID } from "crypto";

export interface IStorage {
  // Waitlist operations
  getWaitlistEntry(address: string): Promise<Waitlist | undefined>;
  createWaitlistEntry(entry: InsertWaitlist): Promise<Waitlist>;

  // Conversation operations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getUserConversations(userId: string): Promise<Conversation[]>;

  // Profile operations
  getProfile(userId: string): Promise<Profile | undefined>;
  upsertProfile(profile: InsertProfile): Promise<Profile>;
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

  async getWaitlistEntry(address: string): Promise<Waitlist | undefined> {
    const result = await this.db
      .select()
      .from(waitlist)
      .where(eq(waitlist.address, address))
      .limit(1);
    return result[0];
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const result = await this.db.insert(conversations).values(conversation).returning();
    return result[0];
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const result = await this.db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId));
    return result;
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    const result = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);
    return result[0];
  }

  async upsertProfile(profile: InsertProfile): Promise<Profile> {
    const result = await this.db
      .insert(profiles)
      .values(profile)
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          fullName: profile.fullName,
          incomeRange: profile.incomeRange,
          entityType: profile.entityType,
        },
      })
      .returning();
    return result[0];
  }
}

export class MemStorage implements IStorage {
  private waitlistEntries: Map<string, Waitlist>;
  private conversationsList: Conversation[];
  private profilesMap: Map<string, Profile>;

  constructor() {
    this.waitlistEntries = new Map();
    this.conversationsList = [];
    this.profilesMap = new Map();
  }

  async createWaitlistEntry(entry: InsertWaitlist): Promise<Waitlist> {
    const id = randomUUID();
    const waitlistEntry: Waitlist = {
      ...entry,
      id,
      createdAt: new Date(),
    };
    // key by normalized address
    this.waitlistEntries.set(entry.address, waitlistEntry);
    return waitlistEntry;
  }

  async getWaitlistEntry(address: string): Promise<Waitlist | undefined> {
    return this.waitlistEntries.get(address);
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const newConversation: Conversation = {
      ...conversation,
      id,
      createdAt: new Date(),
    };
    this.conversationsList.push(newConversation);
    return newConversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationsList.filter((conv) => conv.userId === userId);
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    return this.profilesMap.get(userId);
  }

  async upsertProfile(profile: InsertProfile): Promise<Profile> {
    const newProfile: Profile = {
      ...profile,
      createdAt: new Date(),
    };
    this.profilesMap.set(profile.id, newProfile);
    return newProfile;
  }
}

// Use database storage if DATABASE_URL is provided, otherwise fall back to memory storage
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
