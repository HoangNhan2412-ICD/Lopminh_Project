"use client";

import { useCallback, useSyncExternalStore } from "react";

/*
  Kho nhỏ trên localStorage cho chế độ demo, đọc qua useSyncExternalStore
  (không cần setState trong effect, đổi hồ sơ là đổi khóa, dữ liệu tự nạp đúng người).
  Khi nối Supabase, thay hàm read/write ở đây bằng truy vấn có RLS.
*/

const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function snapshot<T>(key: string, fallback: T): T {
  const raw = readRaw(key);
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

export function writeLocal<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* hết chỗ hoặc bị chặn: vẫn chạy, chỉ không nhớ */
  }
  cache.delete(key);
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = () => {
    cache.clear();
    l();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

/** Giá trị lưu ở localStorage theo khóa, kèm hàm ghi. Ở server trả về fallback. */
export function useLocal<T>(key: string, fallback: T): [T, (next: T | ((prev: T) => T)) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => snapshot(key, fallback),
    () => fallback,
  );
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = snapshot(key, fallback);
      writeLocal(key, typeof next === "function" ? (next as (p: T) => T)(prev) : next);
    },
    [key, fallback],
  );
  return [value, set];
}
