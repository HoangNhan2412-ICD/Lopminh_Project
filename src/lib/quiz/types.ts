import { z } from "zod";

export const quizQuestionSchema = z.object({
  q: z.string(),
  options: z.array(z.string()).length(4),
  answer: z.number().int().min(0).max(3),
  explain: z.string().default(""),
  seconds: z.number().int().min(5).max(240).default(30),
});
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

export const quizSetSchema = z.object({
  title: z.string(),
  questions: z.array(quizQuestionSchema).min(1).max(30),
});

export interface QuizSet {
  id: string;
  title: string;
  questions: QuizQuestion[];
  sourceLessonId?: string;
  createdAt: string;
}

/** Thời gian Kahoot cho phép (giây). */
export const KAHOOT_TIMES = [5, 10, 20, 30, 60, 90, 120, 240] as const;

export function nearestKahootTime(s: number): number {
  return KAHOOT_TIMES.reduce((best, t) => (Math.abs(t - s) < Math.abs(best - s) ? t : best), 30);
}
