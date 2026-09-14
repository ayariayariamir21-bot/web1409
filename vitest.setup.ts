// In-memory storage stub for the node environment.
// Zustand v5 `persist` defaults to `createJSONStorage(() => window.localStorage)`
// and takes an early return (no `store.persist` API, writes disabled) when
// that getter throws. Node has no `window`, so the stub must provide
// `window.localStorage` before any store module loads (setupFiles run before
// test-file imports, hence before store creation).
const backingStore = new Map<string, string>();
const memoryStorage = {
  getItem: (key: string): string | null =>
    backingStore.has(key) ? backingStore.get(key)! : null,
  setItem: (key: string, value: string): void => {
    backingStore.set(key, String(value));
  },
  removeItem: (key: string): void => {
    backingStore.delete(key);
  },
  clear: (): void => {
    backingStore.clear();
  },
  get length(): number {
    return backingStore.size;
  },
  key: (index: number): string | null =>
    Array.from(backingStore.keys())[index] ?? null,
};

if (typeof (globalThis as Record<string, unknown>).window === "undefined") {
  (globalThis as Record<string, unknown>).window = {};
}
const win = globalThis.window as unknown as Record<string, unknown>;
if (typeof win.localStorage === "undefined") {
  win.localStorage = memoryStorage;
}
if (typeof globalThis.localStorage === "undefined") {
  (globalThis as Record<string, unknown>).localStorage = memoryStorage;
}

