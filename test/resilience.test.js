import { test } from "node:test";
import assert from "node:assert/strict";
import { requestWithRetry } from "../src/request.js";
import { reorderImages, promoteCover } from "../src/gallery-order.js";
import vm from "node:vm";
import { readFileSync } from "node:fs";

test("read-only transient failures retry once; permission and mutations never retry", async () => {
  for (const status of [502, 503, 504]) {
    let calls = 0;
    const res = await requestWithRetry(
      "/test",
      {},
      {
        fetcher: async () => ({ status: calls++ ? 200 : status }),
        sleep: async () => {},
      },
    );
    assert.equal(calls, 2);
    assert.equal(res.status, 200);
  }
  for (const [method, status] of [
    ["GET", 403],
    ["GET", 401],
    ["POST", 503],
    ["DELETE", 502],
  ]) {
    let calls = 0;
    await requestWithRetry(
      "/test",
      { method },
      {
        fetcher: async () => {
          calls++;
          return { status };
        },
        sleep: async () => {},
      },
    );
    assert.equal(calls, 1);
  }
});
test("aborted reads are not replayed and repeated network failure is bounded", async () => {
  let calls = 0;
  await assert.rejects(
    requestWithRetry(
      "/test",
      {},
      {
        fetcher: async () => {
          calls++;
          throw new TypeError("offline");
        },
        sleep: async () => {},
      },
    ),
  );
  assert.equal(calls, 2);
  const c = new AbortController();
  c.abort();
  calls = 0;
  await assert.rejects(
    requestWithRetry(
      "/test",
      { signal: c.signal },
      {
        fetcher: async () => {
          calls++;
          throw new DOMException("cancel", "AbortError");
        },
        sleep: async () => {},
      },
    ),
  );
  assert.equal(calls, 1);
});
test("gallery ordering preserves every image and promotion keeps the previous cover", () => {
  const original = ["one", "two", "three"];
  assert.deepEqual(reorderImages(original, 2, 0), ["three", "one", "two"]);
  assert.deepEqual(original, ["one", "two", "three"]);
  assert.deepEqual(reorderImages(original, 0, -1), original);
  assert.deepEqual(promoteCover("cover", original, 1), {
    cover_image_url: "two",
    gallery_images: ["one", "cover", "three"],
  });
});
test("release bundle recovery reloads at most once and ignores ordinary application errors", () => {
  const source = readFileSync(
    new URL("../public/recovery.js", import.meta.url),
    "utf8",
  );
  const handlers = {},
    storage = new Map();
  let reloads = 0;
  const ctx = {
    window: { addEventListener: (name, fn) => (handlers[name] = fn) },
    navigator: { onLine: true },
    location: {
      href: "https://utrzone.haking.tr/game?id=test",
      pathname: "/game",
      reload: () => reloads++,
    },
    sessionStorage: {
      getItem: (k) => storage.get(k),
      setItem: (k, v) => storage.set(k, v),
    },
    Date: { now: () => 1000000 },
    URL,
    setTimeout: (f) => f(),
  };
  vm.createContext(ctx);
  vm.runInContext(source, ctx);
  handlers.error({ target: { tagName: "DIV" } });
  assert.equal(reloads, 0);
  handlers.error({
    target: {
      tagName: "SCRIPT",
      type: "module",
      src: "https://utrzone.haking.tr/assets/missing.js",
    },
  });
  assert.equal(reloads, 1);
  vm.runInContext(source, ctx);
  handlers["vite:preloadError"]();
  assert.equal(reloads, 1);
});
