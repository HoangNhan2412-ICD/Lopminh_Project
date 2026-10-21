import { DEMO_CLASSES, DEMO_PROFILES, DEMO_STUDENTS, DEMO_TIMETABLES } from "@/lib/demo/data";
import { profileInput, stateKey } from "./schema";
import type { ClassInfo, TeacherProfile } from "@/lib/types";

/** Chỉ gọi sau lựa chọn Có. Không đọc cookie, khóa OAuth hay xóa localStorage. */
export function accountSeed(profile: TeacherProfile, local: Record<string, unknown> | null, firstClass?: string) {
  const state: Record<string, unknown> = {};
  const imported: TeacherProfile[] = [];
  if (local) {
    for (const [key, value] of Object.entries(local)) if (stateKey.safeParse(key).success && !["lm:account-setup", "lm:current", "lm:profiles"].includes(key)) state[key] = value;
    const candidates = Array.isArray(local["lm:profiles"]) ? local["lm:profiles"] : DEMO_PROFILES;
    for (const candidate of candidates) {
      const parsed = profileInput.safeParse(candidate);
      if (!parsed.success || parsed.data.id === profile.id) continue;
      const p = parsed.data; imported.push(p);
      state[`lm:classes:${p.id}`] ??= DEMO_CLASSES[p.id] ?? [];
      state[`lm:timetable:${p.id}`] ??= DEMO_TIMETABLES[p.id] ?? {};
      state[`lm:rosters:${p.id}`] ??= Object.fromEntries((DEMO_CLASSES[p.id] ?? []).map(c => [c.id, DEMO_STUDENTS.filter(s => s.classId === c.id)]));
    }
  }
  const classId = `${profile.id}-lop-1`;
  const classes: ClassInfo[] = firstClass?.trim() ? [{ id: classId, name: firstClass.trim().normalize("NFC"), subject: profile.subject, role: "chu-nhiem", studentIds: [] }] : [];
  state[`lm:classes:${profile.id}`] = classes;
  state[`lm:timetable:${profile.id}`] = {};
  state[`lm:notes:${profile.id}`] = [];
  state[`lm:rosters:${profile.id}`] = {};
  state["lm:profiles"] = [profile, ...imported];
  state["lm:current"] = profile.id;
  return state;
}
