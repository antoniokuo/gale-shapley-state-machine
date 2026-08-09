// src/stores/matchingStore.ts
import { defineStore } from 'pinia'
import { createGaleShapleyEngine } from '../engine/galeShapleyEngine'
import type {
  DatasetPayload,
  MarketStateSnapshot,
  ProposerState,
  ReceiverState,
  EngineEvent,
} from '../types'

export const useMatchingStore = defineStore('matching', {
  state: () => ({
    // The Deterministic Ledger (ADR 0010)
    stateLedger: [] as MarketStateSnapshot[],
    tickIndex: 0,
    isAwaitingUserInput: false,

    // Spatial Anchors preventing layout recognition (ADR 0011)
    spatialProposerOrder: [] as string[],

    // Spotlight Pointers for Dynamic Context Isolation (ADR 0008)
    activeProposerId: null as string | null,
    activeTargetReceiverId: null as string | null,

    // Loaded Dataset Metadata
    activeDataset: null as DatasetPayload | null,
  }),

  getters: {
    currentState(state): MarketStateSnapshot | null {
      return state.stateLedger[state.tickIndex] || null
    },

    isComplete(state): boolean {
      // Use the explicit state argument to completely decouple recursive state resolution errors
      const current = state.stateLedger[state.tickIndex]
      return current ? current.isComplete : false
    },
  },

  actions: {
    /**
     * Compiles the full deterministic execution path into deep-cloned immutable states
     * to enable instant bidirectional time-travel with zero visual layout shifts.
     */
    async hydrateAndPrecompute(payload: DatasetPayload) {
      this.activeDataset = payload
      this.stateLedger = []
      this.tickIndex = 0
      this.isAwaitingUserInput = false
      this.activeProposerId = null
      this.activeTargetReceiverId = null

      // Enforce random visual spatial geometry on initialization to mitigate layout memorization (ADR 0011)
      this.spatialProposerOrder = Object.keys(payload.proposerPreferences).sort(
        () => Math.random() - 0.5,
      )

      // Instantiate initial baseline tracking frames
      const proposers: Record<string, ProposerState> = {}
      Object.keys(payload.proposerPreferences).forEach((p) => {
        proposers[p] = {
          id: p,
          preferences: payload.proposerPreferences[p]!,
          match: null,
          nextProposalIndex: 0,
        }
      })

      const receivers: Record<string, ReceiverState> = {}
      Object.keys(payload.receiverInvertedRanks).forEach((r) => {
        receivers[r] = {
          id: r,
          preferences: payload.receiverPreferences[r] || [],
          matches: [],
          capacity: 3,
        }
      })

      const freeProposers = Object.keys(payload.proposerPreferences)

      const engine = createGaleShapleyEngine(payload)
      let currentTick = 0

      // Exhaust the generator in the background to log all state mutations deterministically
      for await (const event of engine) {
        // Apply mutative transitions to the tracking frame
        this.mutateFrame(proposers, receivers, freeProposers, event)

        // Push a fully decoupled deep-clone snapshot to the history ledger array
        this.stateLedger.push({
          tick: currentTick++,
          proposers: JSON.parse(JSON.stringify(proposers)),
          receivers: JSON.parse(JSON.stringify(receivers)),
          freeProposers: [...freeProposers],
          activeEvent: event,
          isComplete: event.type === 'COMPLETE',
        })
      }
    },

    mutateFrame(
      proposers: Record<string, ProposerState>,
      receivers: Record<string, ReceiverState>,
      freeProposers: string[],
      event: EngineEvent,
    ) {
      const { type, proposerId, receiverId, displacedId } = event

      // Extract and explicitly narrow object scopes to satisfy strict type assertions
      const p = proposerId ? proposers[proposerId] : undefined
      const r = receiverId ? receivers[receiverId] : undefined
      const d = displacedId ? proposers[displacedId] : undefined

      if (p) {
        if (type === 'PROPOSE' || type === 'BREAKPOINT') {
          p.nextProposalIndex++
        }
      }

      if (type === 'ACCEPT' && p && r && proposerId && receiverId) {
        p.match = receiverId
        r.matches.push(proposerId)
        const pIndex = freeProposers.indexOf(proposerId)
        if (pIndex > -1) freeProposers.splice(pIndex, 1)
      }

      if (type === 'REJECT' && p && r && proposerId) {
        p.match = null
        const pIndex = freeProposers.indexOf(proposerId)
        if (pIndex === -1) freeProposers.push(proposerId)
      }

      if (type === 'DISPLACE' && p && r && d && proposerId && receiverId && displacedId) {
        // Safe eviction operation inside the isolated framing array
        d.match = null
        freeProposers.push(displacedId)
        const dIndex = r.matches.indexOf(displacedId)
        if (dIndex > -1) r.matches.splice(dIndex, 1)

        // Bind incoming tracking structures safely
        p.match = receiverId
        r.matches.push(proposerId)
        const pIndex = freeProposers.indexOf(proposerId)
        if (pIndex > -1) freeProposers.splice(pIndex, 1)
      }
    },

    // --------------------------------------------------
    // BI-DIRECTIONAL LEDGER CONTROLS (SOP Section 1.4)
    // --------------------------------------------------
    stepForward() {
      if (this.tickIndex < this.stateLedger.length - 1 && !this.isAwaitingUserInput) {
        this.tickIndex++
        this.evaluateCurrentTickEvent()
      }
    },

    stepBackward() {
      if (this.tickIndex > 0 && !this.isAwaitingUserInput) {
        this.tickIndex--
        // Clear active spotlight masks upon regression events
        this.activeProposerId = null
        this.activeTargetReceiverId = null
      }
    },

    evaluateCurrentTickEvent() {
      const current = this.currentState
      if (!current) return

      if (current.activeEvent.type === 'BREAKPOINT') {
        this.isAwaitingUserInput = true
        this.activeProposerId = current.activeEvent.proposerId
        this.activeTargetReceiverId = current.activeEvent.receiverId
      }
    },

    resumeFromBreakpoint() {
      this.isAwaitingUserInput = false
      this.activeProposerId = null
      this.activeTargetReceiverId = null
      this.tickIndex++ // Step directly over the intercepted barrier frame
    },
  },
})
