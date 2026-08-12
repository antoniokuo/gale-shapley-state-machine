import type { DatasetPayload, EngineEvent } from '../types'

/**
 * PHASE 2: ASYNCHRONOUS GENERATOR ENGINE
 * Executes the Gale-Shapley Many-to-One algorithm.
 * Yields discrete micro-events to be captured by the Deterministic State Ledger (ADR 0010).
 */
export async function* createGaleShapleyEngine(
  payload: DatasetPayload,
  capacity: number = 3, // Hardcoded to 3 as per ADR 0006 (16:4 capacity quota)
): AsyncGenerator<EngineEvent, void, unknown> {
  const { proposerPreferences, receiverInvertedRanks, milestoneBreakpoints, executionQueue } =
    payload

  // CRITICAL FIX: Enforce deterministic isomorphic entry points.
  // Fallback to Object.keys only if the strict queue is missing.
  const proposers = executionQueue || Object.keys(proposerPreferences)
  const freeProposers = [...proposers]

  // Track the next index in the preference array for each proposer
  const proposerNextIndex: Record<string, number> = {}
  proposers.forEach((p) => (proposerNextIndex[p] = 0))

  // Track the current occupants for each receiver
  const receiverHolds: Record<string, string[]> = {}
  Object.keys(receiverInvertedRanks).forEach((r) => (receiverHolds[r] = []))

  yield {
    type: 'INITIALIZE',
    proposerId: null,
    receiverId: null,
    displacedId: null,
    message: 'Algorithm initialized. Market capacity set to 12 slots.',
  }

  while (freeProposers.length > 0) {
    const p = freeProposers.shift()!
    const prefs = proposerPreferences[p]!
    const r = prefs[proposerNextIndex[p]!]

    if (!r) continue // Safety boundary: Proposer exhausted list (should not happen in our 16:4 skew)

    proposerNextIndex[p]!++

    yield {
      type: 'PROPOSE',
      proposerId: p,
      receiverId: r,
      displacedId: null,
      message: `${p} proposes to ${r}`,
    }

    // BREAKPOINT INTERCEPTION (ADR 0002 & ADR 0005)
    if (milestoneBreakpoints.includes(`${p}-${r}`)) {
      yield {
        type: 'BREAKPOINT',
        proposerId: p,
        receiverId: r,
        displacedId: null,
        message: `Execution paused at deterministic milestone: ${p}-${r}`,
      }
    }

    const holds = receiverHolds[r]!
    const ranks = receiverInvertedRanks[r]!
    const pRank = ranks[p]!

    if (holds.length < capacity) {
      holds.push(p)
      yield {
        type: 'ACCEPT',
        proposerId: p,
        receiverId: r,
        displacedId: null,
        message: `${r} tentatively accepts ${p} (Capacity: ${holds.length}/${capacity})`,
      }
    } else {
      // Receiver is at capacity: evaluate displacement
      let worstHold = holds[0]!
      let worstRank = ranks[worstHold]!

      for (let i = 1; i < holds.length; i++) {
        const currentRank = ranks[holds[i]!]!
        if (currentRank > worstRank) {
          worstRank = currentRank
          worstHold = holds[i]!
        }
      }

      if (pRank < worstRank) {
        // Successful displacement
        const worstIndex = holds.indexOf(worstHold)
        holds.splice(worstIndex, 1)
        holds.push(p)
        freeProposers.push(worstHold)

        yield {
          type: 'DISPLACE',
          proposerId: p,
          receiverId: r,
          displacedId: worstHold,
          message: `${p} displaces ${worstHold} at ${r}`,
        }
      } else {
        // Proposal rejected
        freeProposers.push(p)

        yield {
          type: 'REJECT',
          proposerId: p,
          receiverId: r,
          displacedId: null,
          message: `${r} rejects ${p}`,
        }
      }
    }
  }

  yield {
    type: 'COMPLETE',
    proposerId: null,
    receiverId: null,
    displacedId: null,
    message: 'Algorithm execution complete. Market is stable.',
  }
}
