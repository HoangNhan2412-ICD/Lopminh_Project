"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEMO_CLASSES, DEMO_PROFILES, DEMO_STUDENTS, DEMO_TIMETABLES, demoNotes } from "@/lib/demo/data";
import type { ClassInfo, LoadLevel, Student, StudentNote, TeacherProfile, Timetable } from "@/lib/types";
import { vnNow } from "@/lib/time";

/*
  Kho dữ liệu phía trình duyệt cho CHẾ ĐỘ DEMO.
  Mọi thứ theo từng hồ sơ đều có khóa chứa profileId, nên đổi hồ sơ là đổi trọn bộ dữ liệu.
  Khi nối Supabase, thay phần đọc/ghi localStorage bằng truy vấn có RLS, giữ nguyên giao diện hàm.
*/

export type FontScale = "vua" | "lon" | "rat-lon";

interface AppState {
  ready: boolean;
  /** Ngày hôm nay theo giờ Việt Nam, YYYY-MM-DD (rỗng trước khi trang tải xong). */
  today: string;
  profiles: TeacherProfile[];
  profile: TeacherProfile;
  classes: ClassInfo[];
  students: Student[];
  timetable: Timetable;
  notes: StudentNote[];
  load: LoadLevel | null;
  fontScale: FontScale;
  switchProfile: (id: string) => void;
  updateProfile: (patch: Partial<TeacherProfile>) => void;
  addNotes: (notes: StudentNote[]) => void;
  removeNote: (id: string) => void;
  setLoad: (l: LoadLevel | null) => void;
  setFontScale: (s: FontScale) => void;
  resetDemo: () => void;
}

const Ctx = createContext<AppState | null>(null);

const K = {
  profiles: "lm:profiles",
  current: "lm:current",
  font: "lm:font",
  notes: (pid: string) => `lm:notes:${pid}`,
  load: (pid: string, date: string) => `lm:load:${pid}:${date}`,
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* trình duyệt chặn lưu trữ: vẫn chạy được, chỉ không nhớ */
  }
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profiles, setProfiles] = useState<TeacherProfile[]>(DEMO_PROFILES);
  const [currentId, setCurrentId] = useState<string>(DEMO_PROFILES[0].id);
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [load, setLoadState] = useState<LoadLevel | null>(null);
  const [fontScale, setFontScaleState] = useState<FontScale>("vua");

  // Ngày hôm nay chỉ tính trên trình duyệt, sau khi trang tải xong.
  const [today, setToday] = useState("");

  // Đọc dữ liệu đã lưu sau khi trang tải xong (tránh lệch giữa server và trình duyệt).
  useEffect(() => {
    const today = vnNow().date;
    setToday(today);
    const savedProfiles = read<TeacherProfile[]>(K.profiles, DEMO_PROFILES);
    const savedCurrent = read<string>(K.current, DEMO_PROFILES[0].id);
    const current = savedProfiles.some((p) => p.id === savedCurrent) ? savedCurrent : savedProfiles[0].id;
    setProfiles(savedProfiles);
    setCurrentId(current);
    setNotes(read<StudentNote[]>(K.notes(current), demoNotes(current, today)));
    setLoadState(read<LoadLevel | null>(K.load(current, today), null));
    setFontScaleState(read<FontScale>(K.font, "vua"));
    setReady(true);
  }, []);

  const profile = profiles.find((p) => p.id === currentId) ?? profiles[0];

  // Áp cỡ chữ và màu cá nhân lên thẻ <html>.
  useEffect(() => {
    const el = document.documentElement;
    if (fontScale === "vua") el.removeAttribute("data-scale");
    else el.setAttribute("data-scale", fontScale);
    if (profile.accent === "bang") el.removeAttribute("data-accent");
    else el.setAttribute("data-accent", profile.accent);
  }, [fontScale, profile.accent]);

  const switchProfile = useCallback(
    (id: string) => {
      // Đổi hồ sơ: nạp lại trọn bộ dữ liệu của hồ sơ mới, không giữ gì của hồ sơ cũ.
      setCurrentId(id);
      write(K.current, id);
      setNotes(read<StudentNote[]>(K.notes(id), demoNotes(id, today)));
      setLoadState(read<LoadLevel | null>(K.load(id, today), null));
    },
    [today],
  );

  const updateProfile = useCallback(
    (patch: Partial<TeacherProfile>) => {
      setProfiles((prev) => {
        const next = prev.map((p) => (p.id === currentId ? { ...p, ...patch } : p));
        write(K.profiles, next);
        return next;
      });
    },
    [currentId],
  );

  const addNotes = useCallback(
    (added: StudentNote[]) => {
      setNotes((prev) => {
        const next = [...added, ...prev];
        write(K.notes(currentId), next);
        return next;
      });
    },
    [currentId],
  );

  const removeNote = useCallback(
    (id: string) => {
      setNotes((prev) => {
        const next = prev.filter((n) => n.id !== id);
        write(K.notes(currentId), next);
        return next;
      });
    },
    [currentId],
  );

  const setLoad = useCallback(
    (l: LoadLevel | null) => {
      setLoadState(l);
      write(K.load(currentId, today), l);
    },
    [currentId, today],
  );

  const setFontScale = useCallback((s: FontScale) => {
    setFontScaleState(s);
    write(K.font, s);
  }, []);

  const resetDemo = useCallback(() => {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("lm:"))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* bỏ qua */
    }
    setProfiles(DEMO_PROFILES);
    setCurrentId(DEMO_PROFILES[0].id);
    setNotes(demoNotes(DEMO_PROFILES[0].id, today));
    setLoadState(null);
  }, [today]);

  const value = useMemo<AppState>(() => {
    const classes = DEMO_CLASSES[profile.id] ?? [];
    const classIds = new Set(classes.map((c) => c.id));
    return {
      ready,
      today,
      profiles,
      profile,
      classes,
      students: DEMO_STUDENTS.filter((s) => classIds.has(s.classId)),
      timetable: DEMO_TIMETABLES[profile.id] ?? {},
      notes,
      load,
      fontScale,
      switchProfile,
      updateProfile,
      addNotes,
      removeNote,
      setLoad,
      setFontScale,
      resetDemo,
    };
  }, [ready, today, profiles, profile, notes, load, fontScale, switchProfile, updateProfile, addNotes, removeNote, setLoad, setFontScale, resetDemo]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp phải nằm trong <AppStoreProvider>");
  return v;
}
