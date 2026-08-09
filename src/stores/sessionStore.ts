import { defineStore } from 'pinia'
// import { supabase } from '../supabaseClient' // Uncomment when client is instantiated

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
    async advanceTo(phase: SessionPhase) {
      const precedingPhase = this.currentPhase
      this.currentPhase = phase

      // Batch-dispatch accumulated telemetry at Phase boundaries to shield matching loops from I/O jitter
      if (
        (precedingPhase === 'TASK_1' || precedingPhase === 'TASK_2') &&
        this.telemetryBuffer.length > 0
      ) {
        await this.flushTelemetryBuffer()
      }
    },

    async initializeSession() {
      // 1. Generate clean UUIDv4 unlinked to persistent PII identifiers
      this.uuid = crypto.randomUUID()

      try {
        // 2. Query Supabase RPC for an stateful, balanced sequence assignment block
        // const { data, error } = await supabase.rpc('get_balanced_sequence_assignment')
        // if (error) throw error
        // this.sequenceGroup = data.assigned_sequence as SequenceGroup

        // Fallback placeholder maintaining exact structural shape for local offline execution loops
        this.sequenceGroup = 'AB'
      } catch (e) {
        console.warn('Database connection failed. Falling back to default block assignment.', e)
        this.sequenceGroup = 'AB'
      }

      // 3. Map experimental phase conditions explicitly based on the validated block sequence
      if (this.sequenceGroup === 'AB') {
        this.task1Type = 'STATIC'
        this.task2Type = 'REACTIVE'
      } else {
        this.task1Type = 'REACTIVE'
        this.task2Type = 'STATIC'
      }

      this.currentPhase = 'CONSENT'
    },

    logBreakpointTelemetry(
      breakpointId: string,
      condition: 'STATIC' | 'REACTIVE',
      rawDelta: number,
      isCorrect: boolean,
    ) {
      // Apply strict client-side lower-bound floor constraint to protect downstream transformations
      const processedDelta = Math.max(1, Math.round(rawDelta))

      // Evaluate if duration falls below human motor limits, flagging it as noise
      const isMotorNoise = processedDelta < 100

      this.telemetryBuffer.push({
        breakpointId,
        taskCondition: condition,
        latencyMs: processedDelta,
        isCorrect: !isMotorNoise && isCorrect, // Automatically suppress precision accuracy data if motor noise
        isMotorNoise,
      })
    },

    async flushTelemetryBuffer() {
      if (!this.uuid || this.telemetryBuffer.length === 0) return

      try {
        const payload = this.telemetryBuffer.map((record) => ({
          session_uuid: this.uuid,
          phase_context: this.currentPhase,
          ...record,
        }))

        // const { error } = await supabase.from('telemetry_logs').insert(payload)
        // if (error) throw error

        // Clear localized memory buffer following a verified transaction layer push
        this.telemetryBuffer = []
      } catch (e) {
        console.error('Failed to commit network telemetry batch payload:', e)
      }
    },

    abortSession() {
      this.uuid = null
      this.sequenceGroup = null
      this.task1Type = null
      this.task2Type = null
      this.telemetryBuffer = []
      this.currentPhase = 'PIS'
    },
  },
})
