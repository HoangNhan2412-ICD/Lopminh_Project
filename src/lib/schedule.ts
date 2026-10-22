import type { Period, Timetable } from "@/lib/types";
import { toMinutes, type VnNow } from "@/lib/time";

export type PeriodState = "da-qua" | "dang-day" | "sap-toi";

export function periodsToday(tt: Timetable, now: VnNow): Period[] {
  return tt[now.weekday] ?? [];
}

export function periodState(p: Period, now: VnNow): PeriodState {
  if (now.minutes >= toMinutes(p.end)) return "da-qua";
  if (now.minutes >= toMinutes(p.start)) return "dang-day";
  return "sap-toi";
}

export function currentPeriod(periods: Period[], now: VnNow): Period | null {
  return periods.find((p) => periodState(p, now) === "dang-day") ?? null;
}

export function nextPeriod(periods: Period[], now: VnNow): Period | null {
  return periods.find((p) => periodState(p, now) === "sap-toi") ?? null;
}

/** Đang trong giờ dạy hay không: từ 15 phút trước tiết đầu đến hết tiết cuối. */
export function isTeachingHours(periods: Period[], now: VnNow): boolean {
  if (periods.length === 0) return false;
  const first = toMinutes(periods[0].start) - 15;
  const last = toMinutes(periods[periods.length - 1].end);
  return now.minutes >= first && now.minutes < last;
}

export function minutesLeft(p: Period, now: VnNow): number {
  return Math.max(0, toMinutes(p.end) - now.minutes);
}
