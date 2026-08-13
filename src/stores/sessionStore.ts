import { defineStore } from 'pinia'
import { supabase } from '../supabase'

export type SessionPhase =
  | 'PIS'
  | 'CONSENT'
  | 'TRAINING'
  | 'TASK_1'
  | 'SURVEY_1'
  | 'TRAINING_2'
  | 'TASK_2'
  | 'SURVEY_2'
  | 'SANDBOX'
  | 'DEBRIEF'

export type SequenceGroup = 'AB' | 'BA'

export interface TelemetryRecord {
  breakpointId: string
  taskCondition: 'STATIC' | 'REACTIVE'
  latencyMs: number
  isCorrect: boolean
}

export const useSessionStore = defineStore('session', {
  state: () => ({
    currentPhase: 'PIS' as SessionPhase,
    uuid: null as string | null,
    sequenceGroup: null as SequenceGroup | null,
    task1Type: null as 'STATIC' | 'REACTIVE' | null,
    task2Type: null as 'STATIC' | 'REACTIVE' | null,
    telemetryBuffer: [] as TelemetryRecord[],
  }),

  actions: {
    // --------------------------------------------------
    // SESSION PERSISTENCE & FAULT TOLERANCE
    // --------------------------------------------------
    restoreSession() {
      const cachedUuid = sessionStorage.getItem('bipartite_uuid')
      const cachedSequence = sessionStorage.getItem('bipartite_sequence') as SequenceGroup | null

      if (cachedUuid && cachedSequence) {
        this.uuid = cachedUuid
        this.sequenceGroup = cachedSequence

        if (this.sequenceGroup === 'AB') {
          this.task1Type = 'STATIC'
          this.task2Type = 'REACTIVE'
        } else {
          this.task1Type = 'REACTIVE'
          this.task2Type = 'STATIC'
        }

        this.currentPhase = 'TRAINING'
        console.info('Restored active session from cache to prevent sequence corruption.')

        // Asynchronously check and attempt to flush the client-side Dead-Letter Queue
        this.flushDeadLetterQueue()
      }
    },

    async initializeSession() {
      this.uuid = crypto.randomUUID()
      const appMode = import.meta.env.VITE_APP_MODE || 'portfolio'

      if (appMode === 'study') {
        try {
          // Stateful crossover block allocation request executed via cloud database RPC layer
          const { data, error } = await supabase.rpc('get_balanced_sequence_assignment')
          if (error) throw error
          this.sequenceGroup = data as SequenceGroup
        } catch (e) {
          console.warn(
            'Database allocation failed. Invoking client fallback sequence balancing.',
            e,
          )
          this.sequenceGroup = Math.random() > 0.5 ? 'AB' : 'BA'
        }
      } else {
        this.sequenceGroup = Math.random() > 0.5 ? 'AB' : 'BA'
        console.info(`Portfolio Mode Active: Assigned random sequence ${this.sequenceGroup}`)
      }

      if (this.sequenceGroup === 'AB') {
        this.task1Type = 'STATIC'
        this.task2Type = 'REACTIVE'
      } else {
        this.task1Type = 'REACTIVE'
        this.task2Type = 'STATIC'
      }

      sessionStorage.setItem('bipartite_uuid', this.uuid)
      sessionStorage.setItem('bipartite_sequence', this.sequenceGroup)
      this.currentPhase = 'TRAINING'
    },

    async advanceTo(phase: SessionPhase) {
      const precedingPhase = this.currentPhase

      if (
        (precedingPhase === 'TASK_1' || precedingPhase === 'TASK_2') &&
        this.telemetryBuffer.length > 0
      ) {
        await this.flushTelemetryBuffer()
      }

      this.currentPhase = phase
    },

    // --------------------------------------------------
    // TELEMETRY INGESTION & MATHEMATICAL SANITISATION
    // --------------------------------------------------
    logBreakpointTelemetry(
      breakpointId: string,
      condition: 'STATIC' | 'REACTIVE',
      rawDelta: number,
      isCorrect: boolean,
    ) {
      // SOP Section 5.2 Floor Constraint Enforcement
      const processedDelta = Math.max(1, Math.round(rawDelta))

      // Strict lower-bound human motor-response filter (150ms boundary)
      if (processedDelta < 150) {
        console.warn(
          `Outlier Truncation: Breakpoint ${breakpointId} dropped as hardware double-click noise (${processedDelta}ms).`,
        )
        return // Dropped cleanly from payload stream to protect data model integrity
      }

      this.telemetryBuffer.push({
        breakpointId,
        taskCondition: condition,
        latencyMs: processedDelta,
        isCorrect,
      })
    },

    async flushTelemetryBuffer() {
      if (!this.uuid || this.telemetryBuffer.length === 0) return

      const payload = this.telemetryBuffer.map((record) => ({
        session_uuid: this.uuid,
        breakpoint_id: record.breakpointId,
        condition_type: record.taskCondition,
        latency_ms: record.latencyMs,
        is_correct: record.isCorrect,
      }))

      const appMode = import.meta.env.VITE_APP_MODE || 'portfolio'

      if (appMode === 'study') {
        try {
          const { error } = await supabase.from('session_telemetry').insert(payload)
          if (error) throw error
          this.telemetryBuffer = []
        } catch (e) {
          console.error(
            'Network drop detected. Serialising batch logs to client-side Dead-Letter Queue:',
            e,
          )
          this.preserveToDeadLetterQueue('telemetry_dlq', payload)
          this.telemetryBuffer = [] // Clear memory buffer to prevent infinite loops
        }
      } else {
        console.info('Portfolio Simulation Mode: Telemetry Ledger Payload')
        console.table(payload)
        this.telemetryBuffer = []
      }
    },

    // --------------------------------------------------
    // DISTRIBUTED FAULT-TOLERANCE HOOKS (Industry Showcase)
    // --------------------------------------------------
    preserveToDeadLetterQueue(storageKey: string, freshPayload: any[]) {
      try {
        const existingDataString = localStorage.getItem(storageKey)
        const existingData = existingDataString ? JSON.parse(existingDataString) : []
        const combinedPayload = [...existingData, ...freshPayload]
        localStorage.setItem(storageKey, JSON.stringify(combinedPayload))
      } catch (err) {
        console.error('Catastrophic failure writing to client local storage buffer:', err)
      }
    },

    async flushDeadLetterQueue() {
      const appMode = import.meta.env.VITE_APP_MODE || 'portfolio'
      if (appMode !== 'study') return

      const cachedTelemetry = localStorage.getItem('telemetry_dlq')
      if (cachedTelemetry) {
        try {
          const parsedPayload = JSON.parse(cachedTelemetry)
          const { error } = await supabase.from('session_telemetry').insert(parsedPayload)
          if (!error) {
            localStorage.removeItem('telemetry_dlq')
            console.info(
              'Successfully recovered and flushed cached telemetry queue logs to cloud storage.',
            )
          }
        } catch (e) {
          console.warn('Network transmission retry failed. Retaining queue cache.', e)
        }
      }
    },

    abortSession() {
      this.uuid = null
      this.sequenceGroup = null
      this.task1Type = null
      this.task2Type = null
      this.telemetryBuffer = []
      this.currentPhase = 'PIS'

      sessionStorage.removeItem('bipartite_uuid')
      sessionStorage.removeItem('bipartite_sequence')
    },
  },
})
