import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
const source = readFileSync(
  new URL("../public/warmup.js", import.meta.url),
  "utf8",
);
function harness({
  store = new Map(),
  offline = false,
  deferred = false,
} = {}) {
  let now = 1000000,
    resolve;
  const events = {},
    intervals = [],
    calls = [];
  const ctx = {
    window: { addEventListener: (k, f) => (events[k] = f) },
    document: { hidden: false, addEventListener: (k, f) => (events[k] = f) },
    navigator: { onLine: !offline },
    location: { hostname: "utrzone.haking.tr" },
    localStorage: {
      getItem: (k) => store.get(k),
      setItem: (k, v) => store.set(k, v),
    },
    Date: { now: () => now },
    AbortSignal: { timeout: () => ({}) },
    setInterval: (f, n) => intervals.push({ f, n }),
    fetch: (url, opts) => {
      calls.push({ url, opts });
      return deferred
        ? new Promise((r) => (resolve = r))
        : Promise.resolve({ ok: true });
    },
  };
  vm.createContext(ctx);
  vm.runInContext(source, ctx);
  return {
    ctx,
    calls,
    events,
    intervals,
    advance: (ms) => (now += ms),
    done: () => resolve?.(),
    again: () => vm.runInContext(source, ctx),
  };
}
test("warms immediately, rechecks every five minutes and installs once", async () => {
  const h = harness();
  await new Promise(setImmediate);
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].opts.credentials, "omit");
  assert.equal(h.intervals[0].n, 300000);
  h.again();
  assert.equal(h.intervals.length, 1);
  h.events.pageshow();
  assert.equal(h.calls.length, 1);
  h.advance(300000);
  h.intervals[0].f();
  assert.equal(h.calls.length, 2);
});
test("shares recent health traffic across tabs without credentials", async () => {
  const store = new Map(),
    a = harness({ store }),
    b = harness({ store });
  await new Promise(setImmediate);
  assert.equal(a.calls.length, 1);
  assert.equal(b.calls.length, 0);
  b.advance(300000);
  b.intervals[0].f();
  assert.equal(b.calls.length, 1);
});
test("does not overlap a slow cold start and resumes after network recovery", async () => {
  const a = harness({ deferred: true });
  a.advance(300000);
  a.intervals[0].f();
  assert.equal(a.calls.length, 1);
  a.done();
  await new Promise(setImmediate);
  a.intervals[0].f();
  assert.equal(a.calls.length, 2);
  const b = harness({ offline: true });
  assert.equal(b.calls.length, 0);
  b.ctx.navigator.onLine = true;
  b.events.online();
  assert.equal(b.calls.length, 1);
});
