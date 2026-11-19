import { test } from "node:test";
import assert from "node:assert/strict";
import { gamePath, gameTitle, gameSchema } from "../src/game-url.js";
import { escapeHtml, safeJson } from "../worker/index.js";
test("readable game URLs and metadata remain safe for shared HTML", () => {
  const g = {
    id: "old-id",
    slug: "reclaiming-the-lost",
    title: "Reclaiming the Lost",
    description: "Details",
    has_tr_patch: true,
    has_mod: true,
    is_adult: true,
  };
  assert.equal(gamePath(g), "/oyun/reclaiming-the-lost");
  assert.equal(gamePath({ id: "old-id" }), "/game?id=old-id");
  assert.match(gameTitle(g), /Reclaiming the Lost TR Yama ve Mod/);
  assert.equal(gameSchema(g)["@graph"][0].isFamilyFriendly, false);
  const payload = { text: '</script><script>alert("x")</script> & ü' };
  assert.ok(!safeJson(payload).includes("</script>"));
  assert.deepEqual(JSON.parse(safeJson(payload)), payload);
  assert.equal(
    escapeHtml('<a href="x">&'),
    "&lt;a href=&quot;x&quot;&gt;&amp;",
  );
});
