// src/stores/galeShapleyStore.ts
import { defineStore } from 'pinia'
import { createGaleShapleyIterator, type GSOutcome } from '../engine/galeShapleyGenerator'

// Define the reactive node state required for FLIP animations
export interface ProposerState {
  id: string
  status: 'FREE' | 'PROPOSING' | 'HELD' | 'REJECTED'
  activeTarget: string | null
}

export const useGaleShapleyStore = defineStore('galeShapley', {
  state: () => ({
    // Execution State
    iterator: null as AsyncGenerator<GSOutcome, void, unknown> | null,
    tickRate: 800, // Bound to CSS v-bind later
    isAwaitingUserInput: false,

    // UI Reactive State
    proposers: {} as Record<string, ProposerState>,
    receiverHolds: {} as Record<string, string[]>,

    // Static References
    receiverInvertedRanks: {} as Record<string, Record<string, number>>,
  }),

  actions: {
    initializeMarket(
      proposerIds: string[],
      receiverIds: string[],
      invertedRanks: Record<string, Record<string, number>>,
    ) {
      this.receiverInvertedRanks = invertedRanks

      proposerIds.forEach((id) => {
        this.proposers[id] = { id, status: 'FREE', activeTarget: null }
      })

      receiverIds.forEach((id) => {
        this.receiverHolds[id] = []
      })
    },

    async startExecution(
      proposers: string[],
      proposerPrefs: Record<string, string[]>,
      capacity: number,
      breakpoints: Set<string>,
    ) {
      this.iterator = createGaleShapleyIterator(
        proposers,
        proposerPrefs,
        this.receiverInvertedRanks,
        capacity,
        breakpoints,
      )
      await this.processNextTick()
    },

    async processNextTick() {
      if (!this.iterator) return

      const { value, done } = await this.iterator.next()
      if (done) return

      if (value.type === 'BREAKPOINT') {
        this.isAwaitingUserInput = true
        // Execution halts here. Yields control to Vue UI.
        return
      }

      this.applyEventToState(value)

      // Enforce the automation pace before requesting the next tick
      await new Promise((resolve) => setTimeout(resolve, this.tickRate))
      await this.processNextTick()
    },

    resumeFromBreakpoint(userPredictionPayload: any) {
      this.isAwaitingUserInput = false
      // Telemetry logging will be injected here in Phase 5
      console.log('Telemetry payload recorded:', userPredictionPayload)
      this.processNextTick()
    },

    applyEventToState(event: GSOutcome) {
      switch (event.type) {
        case 'PROPOSING':
          this.proposers[event.proposer]!.status = 'PROPOSING';
          this.proposers[event.proposer]!.activeTarget = event.receiver;
          break;
        case 'ACCEPTED':
          this.proposers[event.accepted]!.status = 'HELD';
          this.receiverHolds[event.receiver]!.push(event.accepted);
          break;
        case 'REJECTED':
          this.proposers[event.rejected]!.status = 'REJECTED';
          this.proposers[event.rejected]!.activeTarget = null;
          break;
        case 'DISPLACEMENT':
          this.proposers[event.accepted]!.status = 'HELD';
          this.proposers[event.accepted]!.activeTarget = event.receiver;
          this.receiverHolds[event.receiver]!.push(event.accepted);

          this.proposers[event.rejected]!.status = 'REJECTED';
          this.proposers[event.rejected]!.activeTarget = null;

          this.receiverHolds[event.receiver] = this.receiverHolds[event.receiver]!.filter(
            id => id !== event.rejected
          );
          break;
      }
    }
