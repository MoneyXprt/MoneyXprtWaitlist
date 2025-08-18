import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import {
  type Waitlist,
  type Conversation,
  type InsertConversation,
  type Profile,
  type InsertProfile,
  waitlist,
  conversations,
  profiles,
} from "@/shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Waitlist operations
  getWaitlistEntry(address: string): Promise<Waitlist | undefined>;
  createWaitlistEntry(input: { address: string }): Promise<Waitlist>;

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

  async createWaitlistEntry({ address }: { address: string }): Promise<Waitlist> {
    const rows = await this.db
      .insert(waitlist)
      .values({ address: address.trim().toLowerCase() })
      .returning();
    return rows[0]!;
  }

  async getWaitlistEntry(address: string): Promise<Waitlist | undefined> {
    const rows = await this.db
      .select()
      .from(waitlist)
      .where(eq(waitlist.address, address.trim().toLowerCase()))
      .limit(1);
    return rows[0];
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const rows = await this.db
      .insert(conversations)
      .values(conversation)
      .returning();
    return rows[0]!;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const rows = await this.db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId));
    return rows;
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    const rows = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);
    return rows[0];
  }

  async upsertProfile(profile: InsertProfile): Promise<Profile> {
    const rows = await this.db
      .insert(profiles)
      .values({
        id: profile.id, // must be provided by caller
        fullName: profile.fullName ?? "",
        incomeRange: profile.incomeRange ?? "100k-250k",
        entityType: profile.entityType ?? "individual",
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          fullName: profile.fullName ?? "",
          incomeRange: profile.incomeRange ?? "100k-250k",
          entityType: profile.entityType ?? "individual",
        },
      })
      .returning();
    return rows[0]!;
  }
} // <— make sure this brace exists so the class is closed!

export class MemStorage implements IStorage {
  private waitlistEntries: Map<string, Waitlist>;
  private conversationsList: Conversation[];
  private profilesMap: Map<string, Profile>;

  constructor() {
    this.waitlistEntries = new Map();
    this.conversationsList = [];
    this.profilesMap = new Map();
  }

  async createWaitlistEntry({ address }: { address: string }): Promise<Waitlist> {
    const id = randomUUID();
    const normalized = address.trim().toLowerCase();

    const waitlistEntry: Waitlist = {
      id,
      address: normalized,
      createdAt: new Date(),
    };

    this.waitlistEntries.set(normalized, waitlistEntry);
    return waitlistEntry;
  }

  async getWaitlistEntry(address: string): Promise<Waitlist | undefined> {
    const normalized = address.trim().toLowerCase();
    return this.waitlistEntries.get(normalized);
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const newConversation: Conversation = {
      ...conversation, // must include userId, prompt, response, meta (per schema)
      id,
      createdAt: new Date(),
    };
    this.conversationsList.push(newConversation);
    return newConversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationsList.filter((c) => c.userId === userId);
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    return this.profilesMap.get(userId);
  }

  async upsertProfile(profile: InsertProfile): Promise<Profile> {
    const existing = this.profilesMap.get(profile.id);
    const newProfile: Profile = {
      id: profile.id,
      fullName: profile.fullName ?? existing?.fullName ?? "",
      incomeRange: profile.incomeRange ?? existing?.incomeRange ?? "100k-250k",
      entityType: profile.entityType ?? existing?.entityType ?? "individual",
      createdAt: existing?.createdAt ?? new Date(),
    };
    this.profilesMap.set(profile.id, newProfile);
    return newProfile;
  }
}

// Use database storage if DATABASE_URL is provided, otherwise fall back to memory storage
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
