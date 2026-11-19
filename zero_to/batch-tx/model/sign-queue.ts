// A sign queue: one wallet request per item, the next one only after the
// previous one has answered. A rejection or a failure does not stop the queue.
// Items already submitted are not sent again, so calling the queue a second
// time is the retry.
//
// This module has no UI and no wallet import. Give it a `send` function and it
// runs anywhere, Node included. Ported from Zero to Claiming, src/steps.jsx,
// runSequential.

export type SignState =
  | { status: 'pending' }
  | { status: 'signing' }
  | { status: 'submitted'; txid: string }
  | { status: 'rejected' }
  | { status: 'failed'; message: string };

export interface RunSignQueueOptions<Item> {
  items: readonly Item[];
  // The state of each item before this run, same order as `items`.
  states: readonly SignState[];
  // Sends one request to the wallet and resolves with the wallet's answer.
  send(item: Item, index: number): Promise<unknown>;
  // True when the error means the user said no in the wallet.
  isRejection(error: unknown): boolean;
  // Called on every state change, in order.
  onChange(index: number, state: SignState): void;
  // Resolves when the user stops waiting for a wallet that does not answer.
  // The open request is marked failed and the queue ends there. If the wallet
  // answers later with a txid, onChange still reports it as submitted.
  stopped?: Promise<void>;
}

export const stoppedWaitingMessage = 'No answer from the wallet. Stopped waiting.';

export const pendingState: SignState = { status: 'pending' };

const txidPattern = /^[0-9a-f]{64}$/i;

// A request counts as submitted only when the wallet returns a 64-hex txid.
export function txidFromResult(result: unknown): string | null {
  if (typeof result !== 'object' || result === null || !('txid' in result)) return null;
  if (typeof result.txid !== 'string') return null;
  const txid = result.txid.replace(/^0x/i, '');
  return txidPattern.test(txid) ? txid.toLowerCase() : null;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') return error.message;
    if ('error' in error) return errorMessage(error.error);
  }
  return typeof error === 'string' ? error : 'The wallet returned an error.';
}

type Answer = { stopped: false; result: unknown } | { stopped: true };

function answered(result: unknown): Answer {
  return { stopped: false, result };
}

function gaveUp(): Answer {
  return { stopped: true };
}

interface SignOutcome {
  state: SignState;
  stopped: boolean;
}

async function signOne<Item>(
  options: RunSignQueueOptions<Item>,
  item: Item,
  index: number
): Promise<SignOutcome> {
  try {
    const sending = options.send(item, index);
    const answer = options.stopped
      ? await Promise.race([sending.then(answered), options.stopped.then(gaveUp)])
      : answered(await sending);
    if (answer.stopped) {
      // The request may still be open in the wallet. A late approval must not be lost.
      void sending.then(
        result => {
          const lateTxid = txidFromResult(result);
          if (lateTxid) options.onChange(index, { status: 'submitted', txid: lateTxid });
        },
        () => undefined
      );
      return { state: { status: 'failed', message: stoppedWaitingMessage }, stopped: true };
    }
    const txid = txidFromResult(answer.result);
    if (!txid)
      return { state: { status: 'failed', message: 'No usable txid returned.' }, stopped: false };
    return { state: { status: 'submitted', txid }, stopped: false };
  } catch (error) {
    if (options.isRejection(error)) return { state: { status: 'rejected' }, stopped: false };
    return { state: { status: 'failed', message: errorMessage(error) }, stopped: false };
  }
}

export async function runSignQueue<Item>(options: RunSignQueueOptions<Item>): Promise<SignState[]> {
  const states = options.items.map((_, index) => options.states[index] ?? pendingState);
  for (const [index, item] of options.items.entries()) {
    if (states[index]?.status === 'submitted') continue;
    options.onChange(index, { status: 'signing' });
    const outcome = await signOne(options, item, index);
    states[index] = outcome.state;
    options.onChange(index, outcome.state);
    if (outcome.stopped) break;
  }
  return states;
}

export function countRemaining(states: readonly SignState[]): number {
  return states.filter(state => state.status !== 'submitted').length;
}

// The button label. The number still to sign stays on the button.
export function signQueueLabel(states: readonly SignState[], running: boolean): string {
  const total = states.length;
  const remaining = countRemaining(states);
  if (running) {
    const signingIndex = states.findIndex(state => state.status === 'signing');
    const position = signingIndex < 0 ? total - remaining : signingIndex;
    return `Signing ${position + 1} of ${total}…`;
  }
  if (remaining === 0) return total === 2 ? 'Both Submitted' : 'All Submitted';
  const untouched = states.every(state => state.status === 'pending');
  if (!untouched) return `Sign ${remaining} Remaining`;
  return remaining === 1 ? 'Sign 1 Transaction' : `Sign ${remaining} Transactions`;
}
