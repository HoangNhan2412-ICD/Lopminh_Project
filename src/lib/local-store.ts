"use client";
import { useCallback, useSyncExternalStore } from "react";
import { StorageEngine } from "@/lib/storage/engine";

export const storage = new StorageEngine(() => localStorage);
export const readLocal = <T>(key: string, fallback: T) => storage.read(key, fallback);
export const writeLocal = <T>(key: string, value: T, epoch?: number) => storage.write(key, value, epoch);
export const removeLocal = (keys: string[], epoch?: number) => storage.remove(keys, epoch);

function subscribe(listener: () => void) {
  const off = storage.subscribe(listener);
  window.addEventListener("storage", storage.invalidate);
  return () => { off(); window.removeEventListener("storage", storage.invalidate); };
}
export function useStorageError() { return useSyncExternalStore(subscribe, () => storage.unsaved, () => false); }

/** Giữ API hook: demo đọc localStorage; tài khoản đọc snapshot Supabase đã nạp. */
export function useLocal<T>(key: string, fallback: T): [T, (next: T | ((prev: T) => T)) => void] {
  const epoch = storage.epoch;
  const value = useSyncExternalStore(subscribe, () => storage.read(key, fallback), () => fallback);
  const set = useCallback((next: T | ((prev: T) => T)) => {
    if (epoch !== storage.epoch) return;
    const prev = storage.read(key, fallback);
    storage.write(key, typeof next === "function" ? (next as (p: T) => T)(prev) : next, epoch);
  }, [key, fallback, epoch]);
  return [value, set];
}
