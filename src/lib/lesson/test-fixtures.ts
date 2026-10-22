import { demoNotes } from "@/lib/demo/data";
import type { LessonRequest } from "@/lib/lesson/types";

export function fixtureRequest(): LessonRequest {
  return {
    topic: "Căn bậc hai",
    subject: "Toán",
    grade: "Lớp 9",
    classId: "9A",
    className: "9A",
    minutes: 45,
    wishes: "",
    energy: "soi-noi",
    focus: "game",
    tone: "song-ngu",
  };
}

export const DEMO_NOTES_FOR_TEST = demoNotes("gv-mai-hoa", "2026-10-20");
