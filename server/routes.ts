import type { Express } from "express";
import { createServer, type Server } from "http";
import OpenAI from "openai";
import { env } from "@/lib/config/env";
import log from "@/lib/logger";
import { storage } from "./storage";
import { insertWaitlistSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Waitlist routes
  app.post("/api/waitlist", async (req, res) => {
    try {
      // Validate request body -> { address }
      const validated = insertWaitlistSchema.parse(req.body);
      const address = validated.address.trim().toLowerCase();

      // Check if address already exists
      const existingEntry = await storage.getWaitlistEntry(address);
      if (existingEntry) {
        return res.status(409).json({
          message: "Email already registered for waitlist",
        });
      }

      // Create waitlist entry
      const entry = await storage.createWaitlistEntry({ address });

      return res.status(201).json({
        message: "Successfully joined waitlist",
        id: entry.id,
      });
    } catch (error: any) {
      // Zod validation error shape
      if (error?.name === "ZodError" || Array.isArray(error?.issues) || Array.isArray(error?.errors)) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.issues ?? error.errors ?? [],
        });
      }

      log.error("Waitlist creation error", { error: (error as any)?.message || String(error) });
      return res.status(500).json({ message: "Failed to join waitlist" });
    }
  });

  // AI Assistant route
  app.post("/api/ask", async (req, res) => {
    try {
      const { prompt } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({
          error: "Prompt is required and must be a string",
        });
      }

      // Check if OpenAI API key is present
      if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY.trim() === "") {
        return res.json({
          response:
            "Hello! I'm MoneyXprt, your AI financial co-pilot. To provide personalized financial advice, please add a valid OpenAI API key with available credits to your environment variables. Once configured, I'll be ready to help with tax optimization, investment strategies, and wealth preservation for high-income earners.",
        });
      }

      try {
        const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are MoneyXprt, an AI-powered financial co-pilot designed specifically for high-income earners. Provide helpful, professional financial advice while maintaining your identity as MoneyXprt. Keep responses concise but informative, focusing on tax optimization, wealth preservation, investment strategies, and financial planning relevant to affluent individuals.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 500,
          temperature: 0.7,
        });

        const response =
          completion.choices[0]?.message?.content ||
          "I apologize, but I couldn't generate a response. Please try again.";

        return res.json({ response });
      } catch (openaiError: any) {
        if (openaiError.status === 429 || openaiError.code === "insufficient_quota") {
          return res.json({
            response:
              "Hello! I'm MoneyXprt, your AI financial co-pilot. It appears your OpenAI API key has exceeded its quota. Please add credits to your OpenAI account at https://platform.openai.com/account/billing to continue receiving personalized financial advice for high-income earners.",
          });
        } else if (openaiError.status === 401) {
          return res.json({
            response:
              "Hello! I'm MoneyXprt, your AI financial co-pilot. Your OpenAI API key appears to be invalid. Please check your API key at https://platform.openai.com/api-keys and ensure it's correctly set in your environment variables.",
          });
        }
        throw openaiError;
      }
    } catch (error) {
      log.error("AI Assistant error", { error: (error as any)?.message || String(error) });
      return res.status(500).json({ error: "Failed to get AI response. Please try again." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
