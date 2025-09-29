const globalLocks =
  globalThis.__SCAN_LOCKS__ || (globalThis.__SCAN_LOCKS__ = new Map());

export async function withBarcodeLock(key, fn) {
  while (globalLocks.has(key)) {
    await globalLocks.get(key);
  }
  let release;
  const waiter = new Promise((res) => (release = res));
  globalLocks.set(key, waiter);
  try {
    return await fn();
  } finally {
    release();
    globalLocks.delete(key);
  }
}
