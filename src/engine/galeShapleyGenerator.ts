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
    const p = freeProposers.shift()!;
    const r = proposerPrefs[p]![proposerNextIndex[p]!];

    if (!r) continue;

    proposerNextIndex[p]!++;

    yield { type: 'PROPOSING', proposer: p, receiver: r };

    if (breakpoints.has(`${p}-${r}`)) {
      yield { type: 'BREAKPOINT', proposer: p, receiver: r };
    }

    // Explicitly assert that the receiver holds array and the rank exist
    const holds = receiverHolds[r]!;
    const pRank = receiverRanks[r]![p]!;

    if (holds.length < capacity) {
      holds.push(p);
      yield { type: 'ACCEPTED', accepted: p, receiver: r };
    }
    else {
      let worstHold = holds[0]!;
      let worstRank = receiverRanks[r]![worstHold]!;

      for (let i = 1; i < holds.length; i++) {
        const currentRank = receiverRanks[r]![holds[i]!]!;
        if (currentRank > worstRank) {
          worstRank = currentRank;
          worstHold = holds[i]!;
        }
      }

      if (pRank < worstRank) {
        const worstIndex = holds.indexOf(worstHold);
        holds.splice(worstIndex, 1);
        holds.push(p);
        freeProposers.push(worstHold);
        yield { type: 'DISPLACEMENT', accepted: p, rejected: worstHold, receiver: r };
      } else {
        freeProposers.push(p);
        yield { type: 'REJECTED', rejected: p, receiver: r };
      }
    }
  }
