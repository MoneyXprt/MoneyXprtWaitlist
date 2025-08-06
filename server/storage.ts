import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { type User, type InsertUser, type Waitlist, type InsertWaitlist, users, waitlist } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createWaitlistEntry(entry: InsertWaitlist): Promise<Waitlist>;
  getWaitlistEntry(email: string): Promise<Waitlist | undefined>;
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

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async createWaitlistEntry(entry: InsertWaitlist): Promise<Waitlist> {
    const result = await this.db.insert(waitlist).values(entry).returning();
    return result[0];
  }

  async getWaitlistEntry(email: string): Promise<Waitlist | undefined> {
    const result = await this.db.select().from(waitlist).where(eq(waitlist.email, email)).limit(1);
    return result[0];
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private waitlistEntries: Map<string, Waitlist>;

  constructor() {
    this.users = new Map();
    this.waitlistEntries = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
}

// Use database storage if DATABASE_URL is provided, otherwise fall back to memory storage
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
