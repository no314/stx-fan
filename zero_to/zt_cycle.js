// Cycle position derived from /v2/pox. Ported unchanged from Zero to Signing src/steps.jsx.
// The current cycle spans [end - reward_cycle_length, end) where end is the next cycle's
// reward phase start. The prepare phase is the tail of the cycle; its last block is end - 1.
// Pure: no DOM, no network. Runs in Node tests and in the page.

export function assertPox(pox) {
  const n = (v, k) => { if (!Number.isInteger(v)) throw new Error("pox: " + k + " is not an integer"); return v; };
  return {
    reward_cycle_length: n(pox.reward_cycle_length, "reward_cycle_length"),
    current_burnchain_block_height: n(pox.current_burnchain_block_height, "current_burnchain_block_height"),
    current_cycle: { id: n(pox.current_cycle && pox.current_cycle.id, "current_cycle.id") },
    next_cycle: {
      reward_phase_start_block_height: n(pox.next_cycle && pox.next_cycle.reward_phase_start_block_height, "next_cycle.reward_phase_start_block_height"),
      prepare_phase_start_block_height: n(pox.next_cycle && pox.next_cycle.prepare_phase_start_block_height, "next_cycle.prepare_phase_start_block_height"),
    },
  };
}

export function cycleView(pox) {
  const len = pox.reward_cycle_length;
  const end = pox.next_cycle.reward_phase_start_block_height;
  const start = end - len;
  const cur = pox.current_burnchain_block_height;
  const toGo = Math.max(0, end - cur);
  const exact = Math.max(0, Math.min(100, (cur - start) / len * 100));
  // Floor, never round up: 99% until the cycle's last block, 100% only on it.
  const pct = cur >= end - 1 ? 100 : Math.min(99, Math.floor(exact));
  const prepStart = pox.next_cycle.prepare_phase_start_block_height;
  const prepPct = Math.max(0, Math.min(100, (prepStart - start) / len * 100));
  const edge = exact > 88 ? "right" : exact < 12 ? "left" : null;
  return { start, end, lastBlock: end - 1, cur, toGo, exact, pct, prepStart, prepPct, cycleId: pox.current_cycle.id, prepare: cur >= prepStart, edge };
}
