import { defineStore } from 'pinia'
// import { supabase } from '../supabaseClient' // Uncomment when client is instantiated

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
  isMotorNoise: boolean
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
    // SESSION PERSISTENCE (Step 2)
    // --------------------------------------------------
    restoreSession() {
      // Intercept accidental page refreshes to prevent abandoned sequence tokens
      const cachedUuid = sessionStorage.getItem('bipartite_uuid')
      const cachedSequence = sessionStorage.getItem('bipartite_sequence') as SequenceGroup | null

      if (cachedUuid && cachedSequence) {
        this.uuid = cachedUuid
        this.sequenceGroup = cachedSequence

        // Remap conditions
        if (this.sequenceGroup === 'AB') {
          this.task1Type = 'STATIC'
          this.task2Type = 'REACTIVE'
        } else {
          this.task1Type = 'REACTIVE'
          this.task2Type = 'STATIC'
        }

        // Safely route refreshed users back to the orientation block
        this.currentPhase = 'TRAINING'
        console.info('Restored active session from cache to prevent sequence corruption.')
      }
    },

    async advanceTo(phase: SessionPhase) {
      const precedingPhase = this.currentPhase

      if (
        (precedingPhase === 'TASK_1' || precedingPhase === 'TASK_2') &&
        this.telemetryBuffer.length > 0
      ) {
        await this.flushTelemetryBuffer(precedingPhase)
      }

      this.currentPhase = phase
    },

    async initializeSession() {
      this.uuid = crypto.randomUUID()

      // Step 1: The Environment Gatekeeper
      const appMode = import.meta.env.VITE_APP_MODE || 'portfolio'

      if (appMode === 'study') {
        try {
          // 2. Query Supabase RPC for a stateful, balanced sequence assignment block
          // const { data, error } = await supabase.rpc('get_balanced_sequence_assignment')
          // if (error) throw error
          // this.sequenceGroup = data.assigned_sequence as SequenceGroup
          this.sequenceGroup = 'AB' // Fallback
        } catch (e) {
          console.warn('Database connection failed. Falling back to default block assignment.', e)
          this.sequenceGroup = 'AB'
        }
      } else {
        // Portfolio Mode: Bypass DB, simulate random sequence assignment (50/50 split)
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

      // Lock tokens into browser session storage to survive F5/Refreshes
      sessionStorage.setItem('bipartite_uuid', this.uuid)
      sessionStorage.setItem('bipartite_sequence', this.sequenceGroup)

      // ROUTING FIX: Push the user into the orientation phase AFTER generating the UUID
      this.currentPhase = 'TRAINING'
    },

    logBreakpointTelemetry(
      breakpointId: string,
      condition: 'STATIC' | 'REACTIVE',
      rawDelta: number,
      isCorrect: boolean,
    ) {
      const processedDelta = Math.max(1, Math.round(rawDelta))
      const isMotorNoise = processedDelta < 100

      this.telemetryBuffer.push({
        breakpointId,
        taskCondition: condition,
        latencyMs: processedDelta,
        isCorrect: !isMotorNoise && isCorrect,
        isMotorNoise,
      })
    },

    async flushTelemetryBuffer(phaseContext: SessionPhase) {
      if (!this.uuid || this.telemetryBuffer.length === 0) return

      const payload = this.telemetryBuffer.map((record) => ({
        session_uuid: this.uuid,
        phase_context: phaseContext,
        ...record,
      }))

      const appMode = import.meta.env.VITE_APP_MODE || 'portfolio'

      if (appMode === 'study') {
        try {
          // const { error } = await supabase.from('telemetry_logs').insert(payload)
          // if (error) throw error
          this.telemetryBuffer = []
        } catch (e) {
          console.error('Failed to commit network telemetry batch payload:', e)
        }
      } else {
        // Portfolio Mode: Do not pollute database. Log payload to console to showcase pipeline.
        console.table(payload)
        this.telemetryBuffer = []
      }
    },

    abortSession() {
      this.uuid = null
      this.sequenceGroup = null
      this.task1Type = null
      this.task2Type = null
      this.telemetryBuffer = []
      this.currentPhase = 'PIS'

      // Purge cached tokens on explicit abort
      sessionStorage.removeItem('bipartite_uuid')
      sessionStorage.removeItem('bipartite_sequence')
    },
  },
})
