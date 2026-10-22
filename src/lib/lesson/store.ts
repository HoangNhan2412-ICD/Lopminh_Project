"use client";

import { useLocal } from "@/lib/local-store";
import type { LessonPlan } from "@/lib/lesson/types";

const EMPTY: LessonPlan[] = [];

/** Giáo án đã soạn, tách riêng theo từng hồ sơ giáo viên. */
export function useLessons(profileId: string) {
  return useLocal<LessonPlan[]>(`lm:lessons:${profileId}`, EMPTY);
}

/** Link phòng quiz in lên slide, theo từng giáo án. */
export function useQuizUrl(lessonId: string) {
  return useLocal<string | null>(`lm:quizurl:${lessonId}`, null);
}
