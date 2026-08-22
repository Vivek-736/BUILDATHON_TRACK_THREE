import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  
  // Clerk Auth
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "Clerk publishable key is required"),
  CLERK_SECRET_KEY: z.string().min(1, "Clerk secret key is required"),
  
  // OpenRouter / AI
  OPENROUTER_API_KEY: z.string().min(1, "OpenRouter API key is required"),
  OPENROUTER_MODEL_ID: z.string().default("nvidia/llama-3.1-nemotron-70b-instruct"),
  
  // Razorpay Test Mode
  RAZORPAY_KEY_ID: z.string().min(1, "Razorpay Key ID is required"),
  RAZORPAY_KEY_SECRET: z.string().min(1, "Razorpay Key Secret is required"),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
  
  // Trigger.dev
  TRIGGER_SECRET_KEY: z.string().optional(),
  TRIGGER_API_KEY: z.string().optional(),
  TRIGGER_PROJECT_REF: z.string().optional(),
  TRIGGER_PROJECT_ID: z.string().optional(),
});

function getEnv() {
  const envValues = {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENROUTER_MODEL_ID: process.env.OPENROUTER_MODEL_ID || "nvidia/llama-3.1-nemotron-70b-instruct",
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    TRIGGER_SECRET_KEY: process.env.TRIGGER_SECRET_KEY || process.env.TRIGGER_API_KEY,
    TRIGGER_API_KEY: process.env.TRIGGER_API_KEY || process.env.TRIGGER_SECRET_KEY,
    TRIGGER_PROJECT_REF: process.env.TRIGGER_PROJECT_REF || process.env.TRIGGER_PROJECT_ID,
    TRIGGER_PROJECT_ID: process.env.TRIGGER_PROJECT_ID || process.env.TRIGGER_PROJECT_REF,
  };

  const parsed = envSchema.safeParse(envValues);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    throw new Error("Invalid environment configuration. Check server logs for details.");
  }

  return parsed.data;
}

export const env = getEnv();
