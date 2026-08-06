// src/stores/sessionStore.ts
import { defineStore } from 'pinia'

// Strict literal types to prevent invalid routing states
export type SessionPhase =
  | 'PIS'
  | 'CONSENT'
  | 'TRAINING'
  | 'TASK_1'
  | 'SURVEY_1'
  | 'TASK_2'
  | 'SURVEY_2'
  | 'SANDBOX'
  | 'DEBRIEF'

export type SequenceGroup = 'AB' | 'BA'

export const useSessionStore = defineStore('session', {
  state: () => ({
    currentPhase: 'PIS' as SessionPhase,
    uuid: null as string | null,
    sequenceGroup: null as SequenceGroup | null,

    // Tracks which physical task (Static vs DAG) maps to Task 1 vs Task 2
    task1Type: null as 'STATIC' | 'REACTIVE' | null,
    task2Type: null as 'STATIC' | 'REACTIVE' | null,
  }),

  actions: {
    advanceTo(phase: SessionPhase) {
      this.currentPhase = phase
    },

    initializeSession() {
      // 1. Generate the anonymous session identifier
      this.uuid = crypto.randomUUID()

      // 2. Modulo-based Evaluation Load Balancer (O(1) allocation)
      // We check the first alphanumeric character of the UUID.
      // If its char code is even -> Group AB. If odd -> Group BA.
      const firstChar = this.uuid.charCodeAt(0)

      if (firstChar % 2 === 0) {
        this.sequenceGroup = 'AB'
        this.task1Type = 'STATIC'
        this.task2Type = 'REACTIVE'
      } else {
        this.sequenceGroup = 'BA'
        this.task1Type = 'REACTIVE'
        this.task2Type = 'STATIC'
      }

      // 3. Lock state and route to the first experimental period
      this.currentPhase = 'TASK_1'
    },

    abortSession() {
      // Emergency termination protocol (Participant Withdrawal)
      this.uuid = null
      this.sequenceGroup = null
      this.task1Type = null
      this.task2Type = null
      this.currentPhase = 'PIS' // Hard reset to landing
    },
  },
})
