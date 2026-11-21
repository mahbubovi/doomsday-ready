import test from "node:test";
import assert from "node:assert/strict";
import { wouldCreateCycle, rewatchOrder } from "../src/services/rewatch.js";
import { bookingQuote } from "../src/services/booking.js";

// Sample data from the brief
const graph = new Map([
  ["iron", []],
  ["first", []],
  ["avengers", ["iron", "first"]],
  ["civil", ["avengers"]],
  ["ragnarok", []],
  ["infinity", ["civil", "ragnarok"]],
  ["endgame", ["infinity"]],
  ["doomsday", ["endgame"]],
]);

function assertValidOrder(order) {
  assert.equal(new Set(order).size, order.length, "each movie exactly once");
  order.forEach((id, i) => {
    for (const p of graph.get(id)) assert.ok(order.indexOf(p) !== -1 && order.indexOf(p) < i, `${p} before ${id}`);
  });
}

test("rewatch order for Doomsday: all 7 others, valid order", () => {
  const order = rewatchOrder("doomsday", graph);
  assert.equal(order.length, 7);
  assert.ok(!order.includes("doomsday"));
  assertValidOrder(order);
});

test("rewatch order for Civil War", () => {
  const order = rewatchOrder("civil", graph);
  assert.deepEqual(new Set(order.slice(0, 2)), new Set(["iron", "first"]));
  assert.equal(order[2], "avengers");
  assert.equal(order.length, 3);
});

test("rewatch order for Ragnarok is empty", () => {
  assert.deepEqual(rewatchOrder("ragnarok", graph), []);
});

test("shared prerequisites appear only once (diamond)", () => {
  const g = new Map([["a", []], ["b", ["a"]], ["c", ["a"]], ["d", ["b", "c"]]]);
  const order = rewatchOrder("d", g);
  assert.equal(order.length, 3);
  assert.equal(order[0], "a");
});

test("Endgame as a prerequisite of Iron Man is circular", () => {
  assert.equal(wouldCreateCycle("iron", ["endgame"], graph), true);
});

test("self dependency is circular", () => {
  assert.equal(wouldCreateCycle("iron", ["iron"], graph), true);
});

test("valid new prerequisite is allowed", () => {
  assert.equal(wouldCreateCycle("ragnarok", ["iron"], graph), false);
});

test("booking quotes from the brief", () => {
  const q1 = bookingQuote([1, 3, 4], 6);
  assert.equal(q1.totalBundles, 2);
  assert.deepEqual(q1.bundles, [{ size: 3, count: 2 }]);

  const q2 = bookingQuote([2, 5], 11);
  assert.equal(q2.totalBundles, 4);
  assert.deepEqual(q2.bundles, [{ size: 5, count: 1 }, { size: 2, count: 3 }]);

  const q3 = bookingQuote([6, 9, 20], 44);
  assert.equal(q3.totalBundles, 4);
  assert.deepEqual(q3.bundles, [{ size: 20, count: 1 }, { size: 9, count: 2 }, { size: 6, count: 1 }]);

  assert.equal(bookingQuote([4, 6], 7), null);
});

test("booking handles the largest group size quickly", () => {
  const q = bookingQuote([7, 13, 499, 500, 1], 10000);
  assert.equal(q.bundles.reduce((s, b) => s + b.size * b.count, 0), 10000);
});

test("booking edge cases: group of 1, single bundle size, exact multiple", () => {
  assert.deepEqual(bookingQuote([1, 5], 1), { totalBundles: 1, bundles: [{ size: 1, count: 1 }] });
  assert.equal(bookingQuote([5], 12), null);
  assert.deepEqual(bookingQuote([5], 15), { totalBundles: 3, bundles: [{ size: 5, count: 3 }] });
});

test("indirect cycle through several movies is detected", () => {
  const g = new Map([["a", []], ["b", ["a"]], ["c", ["b"]]]);
  assert.equal(wouldCreateCycle("a", ["c"], g), true);
});
