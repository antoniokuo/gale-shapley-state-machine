// src/__tests__/engine.spec.ts
import { describe, expect, it } from 'vitest'
import { createGaleShapleyEngine } from '../engine/galeShapleyEngine'
import type { DatasetPayload } from '../types'

describe('Gale-Shapley Queued Tick Engine', () => {
  it('yields the correct chronological sequence for capacity limits and cascading displacement', async () => {
    // Construct mock dataset satisfying the strict DatasetPayload interface
    const mockPayload: DatasetPayload = {
      milestoneBreakpoints: [],
      proposerPreferences: {
        P1: ['R1'],
        P2: ['R1'],
        P3: ['R1'],
      },
      receiverPreferences: {
        R1: ['P3', 'P1', 'P2'],
      },
      // R1 ranks P3 as best (1), P1 as middle (2), P2 as worst (3)
      receiverInvertedRanks: {
        R1: { P3: 1, P1: 2, P2: 3 },
      },
    }

    // Initialize with a Capacity of 2 to explicitly trigger displacement on the 3rd proposal
    const iterator = createGaleShapleyEngine(mockPayload, 2)

    // Tick 0: Engine Initialization
    expect((await iterator.next()).value).toEqual(expect.objectContaining({ type: 'INITIALIZE' }))

    // Tick 1: P1 proposes to R1 (Capacity 0/2)
    expect((await iterator.next()).value).toEqual(
      expect.objectContaining({ type: 'PROPOSE', proposerId: 'P1', receiverId: 'R1' }),
    )
    expect((await iterator.next()).value).toEqual(
      expect.objectContaining({ type: 'ACCEPT', proposerId: 'P1', receiverId: 'R1' }),
    )

    // Tick 2: P2 proposes to R1 (Capacity 1/2)
    expect((await iterator.next()).value).toEqual(
      expect.objectContaining({ type: 'PROPOSE', proposerId: 'P2', receiverId: 'R1' }),
    )
    expect((await iterator.next()).value).toEqual(
      expect.objectContaining({ type: 'ACCEPT', proposerId: 'P2', receiverId: 'R1' }),
    )

    // Tick 3: P3 proposes to R1 (Capacity 2/2).
    // R1 is full (holds P1 and P2). Worst hold is P2 (Rank 3). P3 is Rank 1.
    // Expected Outcome: P3 displaces P2.
    expect((await iterator.next()).value).toEqual(
      expect.objectContaining({ type: 'PROPOSE', proposerId: 'P3', receiverId: 'R1' }),
    )
    expect((await iterator.next()).value).toEqual(
      expect.objectContaining({
        type: 'DISPLACE',
        proposerId: 'P3',
        displacedId: 'P2',
        receiverId: 'R1',
      }),
    )
  })
})
