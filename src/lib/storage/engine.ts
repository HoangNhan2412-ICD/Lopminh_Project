import { nfcJson } from "@/lib/text";
export interface CloudStorage {
  save: (key: string, value: unknown) => Promise<void>;
  remove: (keys: string[]) => Promise<void>;
}
export class StorageEngine {
  private cloud: CloudStorage | null = null;
  private values = new Map<string, unknown>();
  private rawCache = new Map<string, { raw: string | null; value: unknown }>();
  private queue = new Map<string, unknown>();
  private running: Promise<void> | null = null;
  private errors = false;
  private generation = 0;
  private deleting = new Set<string>();
  private listeners = new Set<() => void>();
  constructor(private disk: () => Pick<Storage, "getItem" | "setItem" | "removeItem">) {}
  get epoch() { return this.generation; }
  get remote() { return this.cloud !== null; }
  get unsaved() { return this.errors; }
  get pending() { return this.queue.size > 0 || this.running !== null; }
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private notify() { this.listeners.forEach(fn => fn()); }
  activate(data: Record<string, unknown> | null, cloud: CloudStorage | null) {
    this.generation++; this.cloud = cloud; this.values = new Map(Object.entries(data ?? {}));
    this.rawCache.clear(); this.queue.clear(); this.deleting.clear(); this.running = null; this.errors = false; this.notify();
  }
  invalidate = () => { this.rawCache.clear(); this.notify(); };
  read<T>(key: string, fallback: T): T {
    if (this.cloud) return this.values.has(key) ? this.values.get(key) as T : fallback;
    let raw: string | null = null; try { raw = this.disk().getItem(key); } catch { /* blocked storage */ }
    const hit = this.rawCache.get(key); if (hit && hit.raw === raw) return hit.value as T;
    let value = fallback; try { if (raw !== null) value = JSON.parse(raw) as T; } catch { /* malformed local value */ }
    this.rawCache.set(key, { raw, value }); return value;
  }
  write(key: string, value: unknown, epoch = this.generation) {
    if (epoch !== this.generation || this.deleting.has(key)) return;
    value = nfcJson(value);
    if (this.cloud) {
      this.values.set(key, value); this.queue.set(key, value); this.notify(); void this.flush();
    } else {
      try { this.disk().setItem(key, JSON.stringify(value)); this.rawCache.delete(key); }
      catch { this.errors = true; }
      this.notify();
    }
  }
  async flush(): Promise<void> {
    if (this.running) return this.running;
    const cloud = this.cloud, epoch = this.generation;
    if (!cloud) return;
    this.running = (async () => {
      this.errors = false;
      while (this.queue.size && epoch === this.generation) {
        const entry = [...this.queue.entries()].find(([key]) => !this.deleting.has(key));
        if (!entry) break;
        const [key, value] = entry;
        try { await cloud.save(key, value); }
        catch { if (epoch === this.generation) { this.errors = true; this.notify(); } break; }
        if (epoch !== this.generation) break;
        if (this.queue.get(key) === value) this.queue.delete(key);
      }
    })();
    await this.running;
    if (epoch === this.generation) { this.running = null; this.notify(); }
  }
  async remove(keys: string[], epoch = this.generation) {
    if (epoch !== this.generation) return;
    const cloud = this.cloud;
    keys.forEach(key => this.deleting.add(key));
    try {
      await this.running;
      if (epoch !== this.generation) return;
      if (cloud) await cloud.remove(keys);
      else keys.forEach(key => this.disk().removeItem(key));
      if (epoch !== this.generation) return;
      keys.forEach(key => { this.queue.delete(key); this.values.delete(key); this.rawCache.delete(key); });
    } finally {
      if (epoch === this.generation) { keys.forEach(key => this.deleting.delete(key)); this.notify(); }
    }
  }
}
