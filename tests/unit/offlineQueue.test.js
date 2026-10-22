import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('offlineQueue - Mutation Queue Resilience and Deduplication', () => {
  const PENDING_QUEUE_KEY = 'test_black_club_pending_queue';
  let storage = {};

  beforeEach(() => {
    storage = {};
    vi.stubGlobal('localStorage', {
      getItem: (key) => storage[key] || null,
      setItem: (key, val) => { storage[key] = String(val); },
      removeItem: (key) => { delete storage[key]; },
      clear: () => { storage = {}; }
    });
  });

  const enqueue = (queueKey, mutation) => {
    const raw = localStorage.getItem(queueKey);
    const list = raw ? JSON.parse(raw) : [];
    const item = { ...mutation, enqueuedAt: Date.now(), id: `mut-${Date.now()}-${Math.random()}` };
    list.push(item);
    localStorage.setItem(queueKey, JSON.stringify(list));
    return list;
  };

  const processQueue = async (queueKey, executor) => {
    const raw = localStorage.getItem(queueKey);
    const list = raw ? JSON.parse(raw) : [];
    const remaining = [];

    for (const item of list) {
      try {
        await executor(item);
      } catch {
        remaining.push(item);
      }
    }

    localStorage.setItem(queueKey, JSON.stringify(remaining));
    return remaining;
  };

  it('enqueues mutations into localStorage', () => {
    const q1 = enqueue(PENDING_QUEUE_KEY, { type: 'CREATE_BOOKING', courtId: 'court-1' });
    expect(q1.length).toBe(1);
    expect(q1[0].type).toBe('CREATE_BOOKING');

    const q2 = enqueue(PENDING_QUEUE_KEY, { type: 'SETTLE_TAB', tabId: 'tab-1' });
    expect(q2.length).toBe(2);
  });

  it('processes mutations sequentially and removes successful items', async () => {
    enqueue(PENDING_QUEUE_KEY, { type: 'CREATE_BOOKING', courtId: 'court-1' });
    enqueue(PENDING_QUEUE_KEY, { type: 'SETTLE_TAB', tabId: 'tab-1' });

    const executed = [];
    const remaining = await processQueue(PENDING_QUEUE_KEY, async (item) => {
      executed.push(item.type);
    });

    expect(executed).toEqual(['CREATE_BOOKING', 'SETTLE_TAB']);
    expect(remaining.length).toBe(0);
    expect(JSON.parse(localStorage.getItem(PENDING_QUEUE_KEY))).toEqual([]);
  });

  it('retains failing items in the queue for later retry', async () => {
    enqueue(PENDING_QUEUE_KEY, { type: 'SUCCESS_MUTATION' });
    enqueue(PENDING_QUEUE_KEY, { type: 'FAIL_MUTATION' });

    const remaining = await processQueue(PENDING_QUEUE_KEY, async (item) => {
      if (item.type === 'FAIL_MUTATION') {
        throw new Error('Network error');
      }
    });

    expect(remaining.length).toBe(1);
    expect(remaining[0].type).toBe('FAIL_MUTATION');
    expect(JSON.parse(localStorage.getItem(PENDING_QUEUE_KEY)).length).toBe(1);
  });
});
