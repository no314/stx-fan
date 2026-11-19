import { describe, expect, test } from 'vitest';

import {
  type SignState,
  countRemaining,
  pendingState,
  runSignQueue,
  signQueueLabel,
  stoppedWaitingMessage,
  txidFromResult,
} from './sign-queue';

const txidA = 'a'.repeat(64);
const txidB = 'b'.repeat(64);
const items = ['first', 'second'];
const fresh: SignState[] = [pendingState, pendingState];

class Rejection extends Error {}

function isRejection(error: unknown) {
  return error instanceof Rejection;
}

function ignoreChange() {
  return undefined;
}

function wait(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

describe(txidFromResult.name, () => {
  test('accepts 64 hex and strips 0x', () => {
    expect(txidFromResult({ txid: `0x${txidA}` })).toBe(txidA);
    expect(txidFromResult({ txid: txidA.toUpperCase() })).toBe(txidA);
  });

  test('refuses anything else', () => {
    expect(txidFromResult({ txid: 'abc' })).toBeNull();
    expect(txidFromResult({ transaction: '00' })).toBeNull();
    expect(txidFromResult({ txid: 7 })).toBeNull();
    expect(txidFromResult(null)).toBeNull();
  });
});

describe(runSignQueue.name, () => {
  test('signs strictly one after the other', async () => {
    const log: string[] = [];
    let open = 0;
    let maxOpen = 0;
    const states = await runSignQueue({
      items,
      states: fresh,
      isRejection,
      onChange(index, state) {
        log.push(`${index}:${state.status}`);
      },
      async send(item) {
        open += 1;
        maxOpen = Math.max(maxOpen, open);
        await wait(5);
        open -= 1;
        return { txid: item === 'first' ? txidA : txidB };
      },
    });
    expect(maxOpen).toBe(1);
    expect(log).toEqual(['0:signing', '0:submitted', '1:signing', '1:submitted']);
    expect(states).toEqual([
      { status: 'submitted', txid: txidA },
      { status: 'submitted', txid: txidB },
    ]);
  });

  test('keeps going past a rejection, and a second run sends only what is left', async () => {
    const sent: string[] = [];
    const afterFirstRun = await runSignQueue({
      items,
      states: fresh,
      isRejection,
      onChange: ignoreChange,
      send(item) {
        sent.push(item);
        if (item === 'first') return Promise.reject(new Rejection());
        return Promise.resolve({ txid: txidB });
      },
    });
    expect(sent).toEqual(['first', 'second']);
    expect(afterFirstRun).toEqual([{ status: 'rejected' }, { status: 'submitted', txid: txidB }]);
    expect(signQueueLabel(afterFirstRun, false)).toBe('Sign 1 Remaining');

    sent.length = 0;
    const afterRetry = await runSignQueue({
      items,
      states: afterFirstRun,
      isRejection,
      onChange: ignoreChange,
      send(item) {
        sent.push(item);
        return Promise.resolve({ txid: txidA });
      },
    });
    expect(sent).toEqual(['first']);
    expect(countRemaining(afterRetry)).toBe(0);
    expect(afterRetry[1]).toEqual({ status: 'submitted', txid: txidB });
  });

  test('reports a failure with the wallet message, flat or nested', async () => {
    const states = await runSignQueue({
      items,
      states: fresh,
      isRejection,
      onChange: ignoreChange,
      send(item) {
        if (item === 'first') return Promise.reject(new Error('Insufficient funds'));
        // Wallets reject with a JSON-RPC error object, not an Error.
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        return Promise.reject({
          jsonrpc: '2.0',
          error: { code: -32000, message: 'Nonce conflict' },
        });
      },
    });
    expect(states).toEqual([
      { status: 'failed', message: 'Insufficient funds' },
      { status: 'failed', message: 'Nonce conflict' },
    ]);
  });

  test('treats an answer without a usable txid as a failure that stays in the count', async () => {
    const states = await runSignQueue({
      items,
      states: fresh,
      isRejection,
      onChange: ignoreChange,
      send(item) {
        return Promise.resolve(item === 'first' ? { transaction: '0011' } : { txid: txidB });
      },
    });
    expect(states[0]).toEqual({ status: 'failed', message: 'No usable txid returned.' });
    expect(countRemaining(states)).toBe(1);
  });
});

describe('stopping the wait', () => {
  test('marks the open request failed, ends the queue, and keeps a late txid', async () => {
    const log: string[] = [];
    const sent: string[] = [];
    let answerWallet: (result: unknown) => void = ignoreChange;
    let stopWaiting: () => void = ignoreChange;
    const stopped = new Promise<void>(resolve => {
      stopWaiting = resolve;
    });

    const running = runSignQueue({
      items,
      states: fresh,
      isRejection,
      stopped,
      onChange(index, state) {
        log.push(`${index}:${state.status}`);
      },
      send(item) {
        sent.push(item);
        return new Promise(resolve => {
          answerWallet = resolve;
        });
      },
    });
    await wait(5);
    stopWaiting();
    const states = await running;

    expect(sent).toEqual(['first']);
    expect(states).toEqual([{ status: 'failed', message: stoppedWaitingMessage }, pendingState]);
    expect(signQueueLabel(states, false)).toBe('Sign 2 Remaining');

    // The wallet answers after all. The transaction is not lost.
    answerWallet({ txid: txidA });
    await wait(5);
    expect(log).toEqual(['0:signing', '0:failed', '0:submitted']);
  });

  test('a queue that is never stopped behaves as before', async () => {
    const states = await runSignQueue({
      items,
      states: fresh,
      isRejection,
      stopped: new Promise<void>(ignoreChange),
      onChange: ignoreChange,
      send() {
        return Promise.resolve({ txid: txidA });
      },
    });
    expect(countRemaining(states)).toBe(0);
  });
});

describe(signQueueLabel.name, () => {
  const submitted: SignState = { status: 'submitted', txid: txidA };
  const rejected: SignState = { status: 'rejected' };
  const signing: SignState = { status: 'signing' };

  test('keeps the count on the button', () => {
    expect(signQueueLabel([pendingState, pendingState], false)).toBe('Sign 2 Transactions');
    expect(signQueueLabel([signing, pendingState], true)).toBe('Signing 1 of 2…');
    expect(signQueueLabel([submitted, signing], true)).toBe('Signing 2 of 2…');
    expect(signQueueLabel([submitted, rejected], false)).toBe('Sign 1 Remaining');
    expect(signQueueLabel([rejected, rejected], false)).toBe('Sign 2 Remaining');
    expect(signQueueLabel([rejected, pendingState], false)).toBe('Sign 2 Remaining');
    expect(signQueueLabel([submitted, submitted], false)).toBe('Both Submitted');
    expect(signQueueLabel([pendingState], false)).toBe('Sign 1 Transaction');
    expect(signQueueLabel([submitted, submitted, submitted], false)).toBe('All Submitted');
  });
});
