import "server-only";
import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

/** Trả về client Gemini, hoặc null nếu chưa cấu hình khóa (chế độ demo). */
export function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}
