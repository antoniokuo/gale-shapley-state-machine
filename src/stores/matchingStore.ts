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

    // Automation & Speed Showcase States
    tickRate: 800,
    timerId: null as number | null,
    isPlaying: false,

    // Forces a hard visual pause on resolution events
    isResolutionPauseActive: false,

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
      const current = state.stateLedger[state.tickIndex]
      return current ? current.isComplete : false
    },
  },

  actions: {
    async hydrateAndPrecompute(payload: DatasetPayload) {
      this.clearPlaybackTimer()
      this.activeDataset = payload
      this.stateLedger = []
      this.tickIndex = 0
      this.isAwaitingUserInput = false
      this.isPlaying = false
      this.isResolutionPauseActive = false
      this.activeProposerId = null
      this.activeTargetReceiverId = null

      this.spatialProposerOrder = Object.keys(payload.proposerPreferences).sort(
        () => Math.random() - 0.5,
      )

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

      for await (const event of engine) {
        this.mutateFrame(proposers, receivers, freeProposers, event)

        this.stateLedger.push({
          tick: currentTick++,
          proposers: JSON.parse(JSON.stringify(proposers)),
          receivers: JSON.parse(JSON.stringify(receivers)),
          freeProposers: [...freeProposers],
          activeEvent: event,
          isComplete: event.type === 'COMPLETE',
        })
      }

      this.startPlaybackLoop()
    },

    mutateFrame(
      proposers: Record<string, ProposerState>,
      receivers: Record<string, ReceiverState>,
      freeProposers: string[],
      event: EngineEvent,
    ) {
      const { type, proposerId, receiverId, displacedId } = event

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
        d.match = null
        freeProposers.push(displacedId)
        const dIndex = r.matches.indexOf(displacedId)
        if (dIndex > -1) r.matches.splice(dIndex, 1)

        p.match = receiverId
        r.matches.push(proposerId)
        const pIndex = freeProposers.indexOf(proposerId)
        if (pIndex > -1) freeProposers.splice(pIndex, 1)
      }
    },

    startPlaybackLoop() {
      if (this.isAwaitingUserInput || this.isComplete || this.isResolutionPauseActive) return
      this.isPlaying = true
      this.clearPlaybackTimer()

      const runTick = () => {
        if (
          this.tickIndex < this.stateLedger.length - 1 &&
          !this.isAwaitingUserInput &&
          !this.isResolutionPauseActive
        ) {
          this.tickIndex++
          this.evaluateCurrentTickEvent()

          // If the tick we just hit is NOT a breakpoint, keep the loop running
          if (!this.isAwaitingUserInput && !this.isResolutionPauseActive && !this.isComplete) {
            this.timerId = window.setTimeout(runTick, this.tickRate)
          } else if (this.isComplete) {
            this.isPlaying = false
          }
        } else {
          this.isPlaying = false
        }
      }

      this.timerId = window.setTimeout(runTick, this.tickRate)
    },

    pausePlayback() {
      this.isPlaying = false
      this.clearPlaybackTimer()
    },

    clearPlaybackTimer() {
      if (this.timerId !== null) {
        window.clearTimeout(this.timerId)
        this.timerId = null
      }
    },

    stepForward() {
      this.pausePlayback()
      if (this.tickIndex < this.stateLedger.length - 1 && !this.isAwaitingUserInput) {
        this.tickIndex++
        this.evaluateCurrentTickEvent()
      }
    },

    stepBackward() {
      this.pausePlayback()
      if (this.tickIndex > 0) {
        this.tickIndex--
        this.isAwaitingUserInput = false
        this.isResolutionPauseActive = false
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
        this.clearPlaybackTimer()
      }
    },

    resumeFromBreakpoint() {
      this.isAwaitingUserInput = false
      // Do not clear the pointers yet; the visual formatters need them for the resolution frame.

      if (this.tickIndex < this.stateLedger.length - 1) {
        this.tickIndex++ // Move exactly one tick forward to the resolution event (ACCEPT/REJECT/DISPLACE)

        // Force a hard pause so the participant actually sees the visual consequences
        this.isResolutionPauseActive = true
        this.clearPlaybackTimer()

        // Wait 1500ms to guarantee visual processing, then automatically resume the loop
        window.setTimeout(() => {
          this.isResolutionPauseActive = false
          this.activeProposerId = null
          this.activeTargetReceiverId = null
          this.startPlaybackLoop()
        }, 1500)
      }
    },
  },
})
