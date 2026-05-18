// Patches the broken localStorage injected by --localstorage-file with an invalid path.
// This must run before Next.js starts so it is loaded via --require in the dev/start scripts.
;(function () {
  function needsFix(obj) {
    return typeof obj !== 'undefined' && obj !== null && typeof obj.getItem !== 'function'
  }

  function makeStore() {
    const _s = Object.create(null)
    return {
      getItem(k) { return Object.prototype.hasOwnProperty.call(_s, String(k)) ? _s[String(k)] : null },
      setItem(k, v) { _s[String(k)] = String(v) },
      removeItem(k) { delete _s[String(k)] },
      clear() { for (const k of Object.keys(_s)) delete _s[k] },
      key(i) { return Object.keys(_s)[i] ?? null },
      get length() { return Object.keys(_s).length },
    }
  }

  function patchOrReplace(name) {
    try {
      const existing = global[name]
      if (!needsFix(existing)) return
      const store = makeStore()
      // Try patching the existing object's methods in place
      try {
        existing.getItem = store.getItem
        existing.setItem = store.setItem
        existing.removeItem = store.removeItem
        existing.clear = store.clear
        existing.key = store.key
        Object.defineProperty(existing, 'length', { get: store.__lookupGetter__?.('length') || (() => 0), configurable: true })
        if (typeof existing.getItem === 'function') return // patch worked
      } catch (_) {}
      // Fall back: replace the whole global
      Object.defineProperty(global, name, { value: store, writable: true, configurable: true })
    } catch (_) {}
  }

  patchOrReplace('localStorage')
  patchOrReplace('sessionStorage')
})()
