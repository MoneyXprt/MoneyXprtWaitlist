import type { Express } from "express";
import { createServer, type Server } from "http";
import OpenAI from "openai";
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

  // AI Assistant route
  app.post("/api/ask", async (req, res) => {
    try {
      const { prompt } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({
          error: 'Prompt is required and must be a string'
        });
      }

      // Check if OpenAI API key is valid and has quota
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
        return res.json({
          response: "Hello! I'm MoneyXprt, your AI financial co-pilot. To provide personalized financial advice, please add a valid OpenAI API key with available credits to your environment variables. Once configured, I'll be ready to help with tax optimization, investment strategies, and wealth preservation for high-income earners."
        });
      }

      try {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: 'system',
              content: 'You are MoneyXprt, an AI-powered financial co-pilot designed specifically for high-income earners. Provide helpful, professional financial advice while maintaining your identity as MoneyXprt. Keep responses concise but informative, focusing on tax optimization, wealth preservation, investment strategies, and financial planning relevant to affluent individuals.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        });

        const response = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';
        res.json({ response });

      } catch (openaiError: any) {
        // Handle OpenAI specific errors (quota, invalid key, etc.)
        if (openaiError.status === 429 || openaiError.code === 'insufficient_quota') {
          return res.json({
            response: "Hello! I'm MoneyXprt, your AI financial co-pilot. It appears your OpenAI API key has exceeded its quota. Please add credits to your OpenAI account at https://platform.openai.com/account/billing to continue receiving personalized financial advice for high-income earners."
          });
        } else if (openaiError.status === 401) {
          return res.json({
            response: "Hello! I'm MoneyXprt, your AI financial co-pilot. Your OpenAI API key appears to be invalid. Please check your API key at https://platform.openai.com/api-keys and ensure it's correctly set in your environment variables."
          });
        } else {
          throw openaiError; // Re-throw other errors
        }
      }

    } catch (error) {
      console.error('AI Assistant error:', error);
      res.status(500).json({
        error: 'Failed to get AI response. Please try again.'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
