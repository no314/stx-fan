import { useCallback, useRef, useState } from 'react';

import {
  type SignState,
  countRemaining,
  pendingState,
  runSignQueue,
  signQueueLabel,
} from './sign-queue';

export interface UseSignQueueOptions<Item> {
  items: readonly Item[];
  // Identifies exactly what the wallet would sign for an item. A submitted
  // transaction belongs to its key, so an edited item starts as pending.
  keyOf(item: Item): string;
  send(item: Item, index: number): Promise<unknown>;
  isRejection(error: unknown): boolean;
}

export interface SignQueue {
  states: SignState[];
  running: boolean;
  remaining: number;
  label: string;
  start(): Promise<void>;
  // Gives up on a wallet that does not answer. Ends the current run.
  stop(): void;
  reset(): void;
}

// React state around runSignQueue. Mount it above the screen that shows the
// queue, so leaving that screen does not drop the submitted list.
export function useSignQueue<Item>({
  items,
  keyOf,
  send,
  isRejection,
}: UseSignQueueOptions<Item>): SignQueue {
  const [byKey, setByKey] = useState<Record<string, SignState>>({});
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  const stopRef = useRef<(() => void) | null>(null);

  const states = items.map(item => byKey[keyOf(item)] ?? pendingState);

  const start = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setRunning(true);
    const stopped = new Promise<void>(resolve => {
      stopRef.current = resolve;
    });
    try {
      await runSignQueue({
        stopped,
        items,
        states: items.map(item => byKey[keyOf(item)] ?? pendingState),
        send,
        isRejection,
        onChange(index, state) {
          const item = items[index];
          if (item === undefined) return;
          setByKey(previous => ({ ...previous, [keyOf(item)]: state }));
        },
      });
    } finally {
      stopRef.current = null;
      runningRef.current = false;
      setRunning(false);
    }
  }, [items, byKey, keyOf, send, isRejection]);

  const stop = useCallback(() => {
    stopRef.current?.();
  }, []);

  const reset = useCallback(() => {
    setByKey(previous => {
      const next = { ...previous };
      for (const item of items) delete next[keyOf(item)];
      return next;
    });
  }, [items, keyOf]);

  return {
    states,
    running,
    remaining: countRemaining(states),
    label: signQueueLabel(states, running),
    start,
    stop,
    reset,
  };
}
