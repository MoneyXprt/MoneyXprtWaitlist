import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWaitlistSchema } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Waitlist routes
  app.post("/api/waitlist", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertWaitlistSchema.parse(req.body);
      
      // Check if email already exists
      const existingEntry = await storage.getWaitlistEntry(validatedData.email);
      if (existingEntry) {
        return res.status(409).json({ 
          message: "Email already registered for waitlist" 
        });
      }
      
      // Create waitlist entry
      const entry = await storage.createWaitlistEntry(validatedData);
      
      res.status(201).json({ 
        message: "Successfully joined waitlist",
        id: entry.id 
      });
    } catch (error: any) {
      if (error.errors) {
        // Zod validation error
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors 
        });
      }
      
      console.error("Waitlist creation error:", error);
      res.status(500).json({ 
        message: "Failed to join waitlist" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
