// Runs on Next.js server startup — patches broken localStorage before any SSR rendering.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const g = globalThis as Record<string, unknown>
    const names = ['localStorage', 'sessionStorage']

    for (const name of names) {
      const existing = g[name]
      if (typeof existing === 'undefined' || existing === null) continue
      const ls = existing as Record<string, unknown>
      if (typeof ls.getItem === 'function') continue

      const _store: Record<string, string> = Object.create(null)
      const patch: Record<string, unknown> = {
        getItem(k: string) { return Object.prototype.hasOwnProperty.call(_store, String(k)) ? _store[String(k)] : null },
        setItem(k: string, v: string) { _store[String(k)] = String(v) },
        removeItem(k: string) { delete _store[String(k)] },
        clear() { for (const k of Object.keys(_store)) delete _store[k] },
        key(i: number) { return Object.keys(_store)[i] ?? null },
      }

      for (const [method, fn] of Object.entries(patch)) {
        try { ls[method] = fn } catch (_) {}
      }

      try {
        Object.defineProperty(ls, 'length', {
          get() { return Object.keys(_store).length },
          configurable: true,
        })
      } catch (_) {}

      if (typeof ls.getItem !== 'function') {
        try {
          Object.defineProperty(g, name, { value: { ...patch, get length() { return Object.keys(_store).length } }, writable: true, configurable: true })
        } catch (_) {}
      }
    }
  }
}
