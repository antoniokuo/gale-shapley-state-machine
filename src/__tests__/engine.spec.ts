// src/__tests__/engine.spec.ts
import { describe, expect, it } from 'vitest'
import { createGaleShapleyIterator } from '../engine/galeShapleyGenerator'

describe('Gale-Shapley Queued Tick Engine', () => {
  it('yields the correct chronological sequence for capacity limits and cascading displacement', async () => {
    const proposers = ['P1', 'P2', 'P3']
    const proposerPrefs = {
      P1: ['R1'],
      P2: ['R1'],
      P3: ['R1'],
    }
    // R1 ranks P3 as best (1), P1 as middle (2), P2 as worst (3)
    const receiverRanks = {
      R1: { P3: 1, P1: 2, P2: 3 },
    }
    const breakpoints = new Set<string>() // Ignored for this test

    // Initialize with a Capacity of 2
    const iterator = createGaleShapleyIterator(
      proposers,
      proposerPrefs,
      receiverRanks,
      2,
      breakpoints,
    )

    // Tick 1: P1 proposes to R1 (Capacity 0/2)
    expect(await iterator.next()).toEqual({
      value: { type: 'PROPOSING', proposer: 'P1', receiver: 'R1' },
      done: false,
    })
    expect(await iterator.next()).toEqual({
      value: { type: 'ACCEPTED', accepted: 'P1', receiver: 'R1' },
      done: false,
    })

    // Tick 2: P2 proposes to R1 (Capacity 1/2)
    expect(await iterator.next()).toEqual({
      value: { type: 'PROPOSING', proposer: 'P2', receiver: 'R1' },
      done: false,
    })
    expect(await iterator.next()).toEqual({
      value: { type: 'ACCEPTED', accepted: 'P2', receiver: 'R1' },
      done: false,
    })

    // Tick 3: P3 proposes to R1 (Capacity 2/2).
    // R1 is full (holds P1 and P2). Worst hold is P2 (Rank 3). P3 is Rank 1.
    // Expected Outcome: P3 displaces P2.
    expect(await iterator.next()).toEqual({
      value: { type: 'PROPOSING', proposer: 'P3', receiver: 'R1' },
      done: false,
    })
    expect(await iterator.next()).toEqual({
      value: { type: 'DISPLACEMENT', accepted: 'P3', rejected: 'P2', receiver: 'R1' },
      done: false,
    })
  })
})
