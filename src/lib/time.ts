/** Giờ Việt Nam (GMT+7), không phụ thuộc múi giờ máy của người dùng. */
export const VN_TZ = "Asia/Ho_Chi_Minh";

export interface VnNow {
  date: string; // YYYY-MM-DD
  weekday: number; // 0 = Chủ nhật … 6 = Thứ Bảy
  hh: number;
  mm: number;
  ss: number;
  minutes: number; // phút kể từ 0h
}

export function vnNow(d: Date = new Date()): VnNow {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: VN_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  const hh = Number(get("hour"));
  const mm = Number(get("minute"));
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    weekday: wd,
    hh,
    mm,
    ss: Number(get("second")),
    minutes: hh * 60 + mm,
  };
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

const WEEKDAYS = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

export function weekdayName(weekday: number): string {
  return WEEKDAYS[weekday] ?? "";
}

export function vnDateLabel(now: VnNow): string {
  const [y, m, d] = now.date.split("-");
  return `${weekdayName(now.weekday)}, ${Number(d)}/${Number(m)}/${y}`;
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
