import { test } from "node:test";
import assert from "node:assert/strict";
import { cycleView, assertPox } from "./zt_cycle.js";

// Mainnet geometry: 2100 blocks, the last 100 the prepare phase.
const LEN = 2100, END = 970550, PREP = END - 100, START = END - LEN;
const pox = (cur) => ({
  reward_cycle_length: LEN,
  current_burnchain_block_height: cur,
  current_cycle: { id: 144 },
  next_cycle: { reward_phase_start_block_height: END, prepare_phase_start_block_height: PREP },
});

test("mid-cycle control", () => {
  const v = cycleView(pox(START + 835));
  assert.equal(v.pct, 39);
  assert.equal(v.toGo, 1265);
  assert.equal(v.lastBlock, 970549);
  assert.equal(v.prepare, false);
  assert.equal(v.edge, null);
  assert.ok(Math.abs(v.prepPct - 95.238) < 0.01);
});

test("101 blocks from the end: last block before prepare", () => {
  const v = cycleView(pox(END - 101));
  assert.equal(v.prepare, false);
  assert.equal(v.pct, 95);
  assert.equal(v.edge, "right");
});

test("100 blocks from the end: first prepare block", () => {
  const v = cycleView(pox(END - 100));
  assert.equal(v.prepare, true);
  assert.equal(v.pct, 95);
});

test("50 blocks from the end", () => {
  const v = cycleView(pox(END - 50));
  assert.equal(v.pct, 97);
  assert.equal(v.toGo, 50);
  assert.equal(v.prepare, true);
});

test("3 blocks from the end holds at 99", () => {
  const v = cycleView(pox(END - 3));
  assert.equal(v.pct, 99);
  assert.equal(v.toGo, 3);
});

test("1 block from the end is the last block: 100", () => {
  const v = cycleView(pox(END - 1));
  assert.equal(v.pct, 100);
  assert.equal(v.toGo, 1);
  assert.equal(v.cur, v.lastBlock);
});

test("first block of the cycle pins the marker left", () => {
  const v = cycleView(pox(START));
  assert.equal(v.pct, 0);
  assert.equal(v.edge, "left");
  assert.equal(v.toGo, LEN);
});

test("marker sits at the exact position, not a clamped one", () => {
  const v = cycleView(pox(END - 1));
  assert.ok(v.exact > 99.9);
});

test("assertPox rejects a non-integer height", () => {
  assert.throws(() => assertPox({ ...pox(1), current_burnchain_block_height: "x" }), /current_burnchain_block_height/);
  assert.throws(() => assertPox({}), /reward_cycle_length/);
});

test("assertPox keeps only the fields the view uses", () => {
  const p = assertPox({ ...pox(START + 1), extra: 1, next_cycle: { ...pox(1).next_cycle, extra: 2 } });
  assert.deepEqual(Object.keys(p).sort(), ["current_burnchain_block_height", "current_cycle", "next_cycle", "reward_cycle_length"]);
});
