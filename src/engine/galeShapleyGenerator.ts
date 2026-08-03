// src/engine/galeShapleyGenerator.ts

export type GSOutcome =
  | { type: 'PROPOSING'; proposer: string; receiver: string }
  | { type: 'BREAKPOINT'; proposer: string; receiver: string }
  | { type: 'ACCEPTED'; accepted: string; receiver: string }
  | { type: 'REJECTED'; rejected: string; receiver: string }
  | { type: 'DISPLACEMENT'; accepted: string; rejected: string; receiver: string }
  | { type: 'TERMINATED' }

export async function* createGaleShapleyIterator(
  proposers: string[],
  proposerPrefs: Record<string, string[]>,
  receiverRanks: Record<string, Record<string, number>>,
  capacity: number,
  breakpoints: Set<string>,
): AsyncGenerator<GSOutcome, void, unknown> {
  const freeProposers = [...proposers]
  const proposerNextIndex: Record<string, number> = {}
  proposers.forEach((p) => (proposerNextIndex[p] = 0))

  const receiverHolds: Record<string, string[]> = {}
  Object.keys(receiverRanks).forEach((r) => (receiverHolds[r] = []))

  while (freeProposers.length > 0) {
    const p = freeProposers.shift()!
    const r = proposerPrefs[p][proposerNextIndex[p]]

    // Proposer has exhausted their preference list (Market Surplus)
    if (!r) continue

    proposerNextIndex[p]++ // Increment for the next loop iteration if rejected/displaced

    yield { type: 'PROPOSING', proposer: p, receiver: r }

    // The HCI Breakpoint Interception
    if (breakpoints.has(`${p}-${r}`)) {
      yield { type: 'BREAKPOINT', proposer: p, receiver: r }
    }

    const holds = receiverHolds[r]
    const pRank = receiverRanks[r][p]

    // Case A: Receiver has open capacity
    if (holds.length < capacity) {
      holds.push(p)
      yield { type: 'ACCEPTED', accepted: p, receiver: r }
    }
    // Case B: Receiver is at capacity, evaluate displacement
    else {
      // Find the worst hold (highest integer rank) using O(C) traversal
      let worstHold = holds[0]
      let worstRank = receiverRanks[r][worstHold]

      for (let i = 1; i < holds.length; i++) {
        const currentRank = receiverRanks[r][holds[i]]
        if (currentRank > worstRank) {
          worstRank = currentRank
          worstHold = holds[i]
        }
      }

      if (pRank < worstRank) {
        // Displacement: Incoming proposer has a better (lower) rank
        const worstIndex = holds.indexOf(worstHold)
        holds.splice(worstIndex, 1)
        holds.push(p)
        freeProposers.push(worstHold) // Displaced proposer re-enters the market
        yield { type: 'DISPLACEMENT', accepted: p, rejected: worstHold, receiver: r }
      } else {
        // Rejection: Incoming proposer is worse than current holds
        freeProposers.push(p) // Proposer re-enters the market to try their next choice
        yield { type: 'REJECTED', rejected: p, receiver: r }
      }
    }
  }

  yield { type: 'TERMINATED' }
}
