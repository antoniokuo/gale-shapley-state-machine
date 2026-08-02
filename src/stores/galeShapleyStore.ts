// src/stores/galeShapleyStore.ts

import { defineStore } from 'pinia'
import type { MatchState, LogEntry, Entity } from '../types'

export const useGaleShapleyStore = defineStore('galeShapley', {
  // 1. STATE: The exact current memory snapshot (like Python class attributes)
  state: (): {
    currentState: MatchState
    historyLogs: LogEntry[]
  } => ({
    currentState: {
      proposers: {},
      receivers: {},
      freeProposers: [],
      roundCount: 0,
      isComplete: false,
    },
    historyLogs: [],
  }),

  // 2. GETTERS: Derived, read-only data (like Python @property)
  getters: {
    totalProposers: (state) => Object.keys(state.currentState.proposers).length,
    totalReceivers: (state) => Object.keys(state.currentState.receivers).length,
  },

  // 3. ACTIONS: Methods that mutate the state (like Python class methods)
  actions: {
    initializeData(proposersData: Record<string, Entity>, receiversData: Record<string, Entity>) {
      this.currentState.proposers = proposersData
      this.currentState.receivers = receiversData
      // Initialize queue with all proposers
      this.currentState.freeProposers = Object.keys(proposersData)
      this.currentState.roundCount = 0
      this.currentState.isComplete = false
      this.historyLogs = []
    },

    // The core execution logic will be injected here next
    executeNextStep() {
      // TODO: Gale-Shapley micro-step logic
    },
  },
})
