import { z } from "zod";
export const stateKey = z.string().max(240).regex(/^lm:(profiles|current|font|theme|account-setup|(?:notes|rosters|lessons|quiz|quizurl|mail|docs|filestore|chat|chatmem|load|kynang|songngu-days|workflows|classes|timetable|mail-seeded):[\w:.-]+)$/);
export const profileInput = z.object({
  theme: z.enum(["auto", "light", "dark"]).optional(),
  id: z.string().min(1).max(100), fullName: z.string().trim().min(1).max(150), callName: z.string().trim().min(1).max(60),
  gender: z.enum(["nam", "nu"]), school: z.string().max(200), team: z.string().max(100), subject: z.string().max(60),
  yearsTeaching: z.number().int().min(0).max(80), teachingStyle: z.object({ summary: z.string().max(3000), tags: z.array(z.string()).max(30) }),
  interests: z.array(z.string()).max(30), kpis: z.array(z.object({ id: z.string(), title: z.string(), current: z.number(), target: z.number(), unit: z.enum(["%", "tiết", "em"]), note: z.string().optional() })),
  accent: z.enum(["bang", "phan", "sen", "troi", "la"]), honorificOverride: z.string().max(40).optional(), homeroomClassId: z.string().optional(),
});
