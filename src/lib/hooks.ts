"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { vnNow, type VnNow } from "@/lib/time";

/* Đồng hồ dùng chung: mỗi chu kỳ một bộ đếm, nhiều component cùng đọc. */
interface Clock {
  value: VnNow | null;
  subs: Set<() => void>;
  timer?: ReturnType<typeof setInterval>;
}
const clocks = new Map<number, Clock>();
function clockFor(ms: number): Clock {
  let c = clocks.get(ms);
  if (!c) {
    c = { value: null, subs: new Set() };
    clocks.set(ms, c);
  }
  return c;
}

/** Đồng hồ giờ Việt Nam, mặc định cập nhật mỗi giây. Trả về null khi render ở server. */
export function useVnClock(intervalMs = 1000): VnNow | null {
  return useSyncExternalStore(
    (onChange) => {
      const c = clockFor(intervalMs);
      c.subs.add(onChange);
      if (!c.timer) {
        c.timer = setInterval(() => {
          c.value = vnNow();
          c.subs.forEach((f) => f());
        }, intervalMs);
      }
      return () => {
        c.subs.delete(onChange);
        if (c.subs.size === 0 && c.timer) {
          clearInterval(c.timer);
          c.timer = undefined;
        }
      };
    },
    () => {
      const c = clockFor(intervalMs);
      c.value ??= vnNow();
      return c.value;
    },
    () => null,
  );
}

/* ---------- Nhận dạng giọng nói tiếng Việt (Web Speech API) ---------- */

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

type Ctor = new () => SpeechRecognitionLike;

function getCtor(): Ctor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: Ctor; webkitSpeechRecognition?: Ctor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const ERROR_TEXT: Record<string, string> = {
  "not-allowed": "Trình duyệt chưa cho phép dùng micro. Bấm vào biểu tượng ổ khóa cạnh địa chỉ web để cho phép nhé.",
  "no-speech": "Bé Bảng chưa nghe thấy gì. Mình thử nói lại gần micro hơn nhé.",
  network: "Nhận giọng nói cần mạng internet. Mình kiểm tra kết nối rồi thử lại nhé.",
};

export function useSpeechToText(onFinal: (text: string) => void, lang = "vi-VN") {
  const supported = useSyncExternalStore(
    () => () => {},
    () => getCtor() !== null,
    () => false,
  );
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalRef = useRef(onFinal);

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  useEffect(() => () => recRef.current?.stop(), []);

  const start = useCallback(() => {
    const C = getCtor();
    if (!C) return;
    setError(null);
    setInterim("");
    const rec = new C();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = true;
    rec.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) onFinalRef.current(r[0].transcript.normalize("NFC").trim());
        else live += r[0].transcript;
      }
      setInterim(live.normalize("NFC"));
    };
    rec.onerror = (e) => setError(ERROR_TEXT[e.error] ?? `Micro gặp lỗi (${e.error}). Mình có thể gõ tay thay nhé.`);
    rec.onend = () => {
      setListening(false);
      setInterim("");
    };
    recRef.current = rec;
    rec.start();
    setListening(true);
  }, [lang]);

  const stop = useCallback(() => recRef.current?.stop(), []);

  return { supported, listening, interim, error, start, stop };
}
