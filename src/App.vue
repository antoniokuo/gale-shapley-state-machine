<script setup lang="ts">
import { watch, computed } from 'vue'
import { useSessionStore } from './stores/sessionStore'
import { useMatchingStore } from './stores/matchingStore'

import PISView from './components/PISView.vue'
import ConsentGateway from './components/ConsentGateway.vue'
import DebriefView from './components/DebriefView.vue'
import MatchingGrid from './components/MatchingGrid.vue'
import SurveyInstrument from './components/SurveyInstrument.vue'
import Sandbox from './components/Sandbox.vue'

import taskA from './data/taskA.json'
import taskB from './data/taskB.json'
import type { DatasetPayload } from './types'

const session = useSessionStore()
const store = useMatchingStore()

// --------------------------------------------------
// PHASING & DATA INGESTION ORCHESTRATOR (SOP 1.3)
// --------------------------------------------------
watch(
  () => session.currentPhase,
  async (newPhase) => {
    if (newPhase === 'TASK_1') {
      // Sequence AB: Task 1 is Static (Dataset A). Sequence BA: Task 1 is Reactive (Dataset B)
      const dataset = session.sequenceGroup === 'AB' ? taskA : taskB
      await executeMarketPrecomputation(dataset as DatasetPayload)
    } else if (newPhase === 'TASK_2') {
      // Sequence AB: Task 2 is Reactive (Dataset B). Sequence BA: Task 2 is Static (Dataset A)
      const dataset = session.sequenceGroup === 'AB' ? taskB : taskA
      await executeMarketPrecomputation(dataset as DatasetPayload)
    }
  },
)

const executeMarketPrecomputation = async (dataset: DatasetPayload) => {
  // Exhaust generator asynchronously inside the store ledger boundary to establish O(1) time-travel states (ADR 0010)
  await store.hydrateAndPrecompute(dataset)
}

// --------------------------------------------------
// ACTIVE TASK PROPERTIES & TELEMETRY
// --------------------------------------------------
const isCurrentTaskStatic = computed(() => {
  if (session.currentPhase === 'TASK_1') return session.task1Type === 'STATIC'
  if (session.currentPhase === 'TASK_2') return session.task2Type === 'STATIC'
  return false
})

const handleTelemetryPayload = (payload: {
  predictedAction: string
  predictedTarget: string
  latencyMs: number
}) => {
  const currentCondition = isCurrentTaskStatic.value ? 'STATIC' : 'REACTIVE'
  const activeEvent = store.currentState?.activeEvent
  const breakpointId = activeEvent
    ? `${activeEvent.proposerId}-${activeEvent.receiverId}`
    : 'UNKNOWN'

  // Evaluate structural accuracy against pre-computed next transition record
  const nextFrameIndex = store.tickIndex + 1
  const logicalNextStateFrame = store.stateLedger[nextFrameIndex]
  const conceptualNextEvent = logicalNextStateFrame?.activeEvent.type

  const isCorrect = payload.predictedAction === conceptualNextEvent

  // Log payload through the filter pipeline to screen rapid motor jitter (<100ms) (SOP Section 5)
  session.logBreakpointTelemetry(breakpointId, currentCondition, payload.latencyMs, isCorrect)

  // Transition pointer frame instantly over checkpoint boundary
  store.resumeFromBreakpoint()
}

const handleTaskProgression = async () => {
  if (session.currentPhase === 'TASK_1') {
    await session.advanceTo('SURVEY_1')
  } else if (session.currentPhase === 'TASK_2') {
    await session.advanceTo('SURVEY_2')
  }
}

// --------------------------------------------------
// PSYCHOMETRIC SURVEY PIPELINE (SOP Section 2 & 3)
// --------------------------------------------------
const activeConditionLabel = computed(() => {
  if (session.currentPhase === 'SURVEY_1') {
    return session.task1Type === 'STATIC' ? 'Static View' : 'Interactive DAG View'
  }
  return session.task2Type === 'STATIC' ? 'Static View' : 'Interactive DAG View'
})

const handleSurveySubmission = async (payload: {
  nasaTlx: Record<string, number>
  sus: Record<number, number>
}) => {
  // Extract configuration parameters of the condition evaluated
  const completedCondition =
    session.currentPhase === 'SURVEY_1' ? session.task1Type : session.task2Type

  if (!session.uuid || !completedCondition) return

  try {
    const formattedPayload = {
      session_uuid: session.uuid,
      condition_type: completedCondition,
      phase_context: session.currentPhase,
      // Flatten dimensions directly into table fields to maximize indexing signal
      ...payload.nasaTlx,
      ...Object.fromEntries(Object.entries(payload.sus).map(([k, v]) => [`sus_item_${k}`, v])),
    }

    // Database push hook - log locally for dev mode
    console.table(formattedPayload)
  } catch (e) {
    console.error('Failed to dispatch snapshot survey values:', e)
  }

  // Advance state pointers downstream to toggle subsequent block phases
  if (session.currentPhase === 'SURVEY_1') {
    await session.advanceTo('TASK_2')
  } else {
    await session.advanceTo('SANDBOX')
  }
}
</script>

<template>
  <main
    class="min-h-screen bg-neutral-50 p-6 flex flex-col items-center justify-center text-black font-mono"
  >
    <PISView v-if="session.currentPhase === 'PIS'" @continue="session.advanceTo('CONSENT')" />

    <ConsentGateway
      v-else-if="session.currentPhase === 'CONSENT'"
      @consented="session.advanceTo('TRAINING')"
    />

    <div
      v-else-if="session.currentPhase === 'TRAINING'"
      class="max-w-4xl w-full border-4 border-neutral-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
    >
      <div class="border-b-4 border-neutral-900 pb-3 mb-6 font-mono">
        <span
          class="text-xs font-black uppercase tracking-widest text-black bg-neutral-100 px-2 py-1 border-2 border-neutral-900"
        >
          Pre-Task Orientation Protocol
        </span>
        <h2 class="text-3xl font-black text-black tracking-tight mt-2 uppercase">
          Gale-Shapley Asymmetric Quota Engine
        </h2>
      </div>

      <div class="space-y-8 font-sans text-base text-black leading-relaxed">
        <section class="space-y-3">
          <h3
            class="text-lg font-black uppercase tracking-wide text-black font-mono border-b-2 border-neutral-900 pb-1"
          >
            0. System Mechanics: Many-to-One Stable Matching
          </h3>
          <p>
            This application houses a high-fidelity rendering loop running the
            <strong>Gale-Shapley Deferred Acceptance Algorithm</strong>, calibrated specifically to
            execute Many-to-One resource structures.
          </p>
          <p class="font-bold text-neutral-950">System Parameters:</p>
          <ul class="list-disc pl-6 space-y-2 text-sm font-semibold text-neutral-800">
            <li>
              <strong>Proposers Pool (N=16):</strong> Act as autonomous individual elements issuing
              directional matching requests sequentially down a prioritized ranking list.
            </li>
            <li>
              <strong>Receivers Hub (M=4):</strong> Accept incoming proposals concurrently up to a
              rigid quota capacity boundary ($C=3$), yielding a global saturation matrix profile of
              exactly 12 total allocations.
            </li>
          </ul>
        </section>

        <section class="space-y-3">
          <h3
            class="text-lg font-black uppercase tracking-wide border-b-2 border-neutral-900 pb-1 text-black font-mono"
          >
            1. Core Verification Interface States
          </h3>
          <p class="text-sm font-medium text-neutral-700">
            Familiarize yourself with the system node structural states. In the upcoming test
            sequence, visual properties will adapt conditionally to isolate interface usability
            metrics:
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 font-mono">
            <div class="flex flex-col items-center p-4 border-2 border-neutral-200 bg-neutral-50">
              <div
                class="border-4 px-2 py-3 flex flex-col items-center justify-center font-black w-24 bg-white text-neutral-950 border-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
              >
                <span class="text-sm font-black">P01</span>
                <span
                  class="text-[9px] font-black uppercase border-t border-neutral-950 pt-1 w-full text-center mt-1 block tracking-tighter"
                  >PROPOSING</span
                >
              </div>
              <p
                class="text-xs font-bold text-center mt-3 font-sans leading-tight text-neutral-600"
              >
                Active Traversal State. Proposer is issuing a request directly to their highest
                ranked remaining destination target.
              </p>
            </div>

            <div class="flex flex-col items-center p-4 border-2 border-neutral-200 bg-neutral-50">
              <div
                class="border-4 px-2 py-3 flex flex-col items-center justify-center font-black w-24 bg-white text-neutral-950 border-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
              >
                <span class="text-sm font-black">P01</span>
                <span
                  class="text-[9px] font-black uppercase border-t border-neutral-950 pt-1 w-full text-center mt-1 block tracking-tighter"
                  >MATCH</span
                >
              </div>
              <p
                class="text-xs font-bold text-center mt-3 font-sans leading-tight text-neutral-600"
              >
                Deferred Security State. The request has been provisionally parked within a target
                receiver's capacity array.
              </p>
            </div>

            <div class="flex flex-col items-center p-4 border-2 border-neutral-200 bg-neutral-50">
              <div
                class="border-4 px-2 py-3 flex flex-col items-center justify-center font-black w-24 bg-white text-neutral-950 border-neutral-950 opacity-40 text-xs"
              >
                <span class="text-sm font-black">P01</span>
                <span
                  class="text-[9px] font-black uppercase border-t border-neutral-950 pt-1 w-full text-center mt-1 block tracking-tighter"
                  >IDLE</span
                >
              </div>
              <p
                class="text-xs font-bold text-center mt-3 font-sans leading-tight text-neutral-600"
              >
                Eviction State. Node has been displaced by a dominant preference applicant or is
                awaiting an execution frame step.
              </p>
            </div>
          </div>
        </section>
      </div>

      <div class="mt-10 pt-6 border-t-4 border-neutral-900 flex justify-end font-mono">
        <button
          @click="session.initializeSession()"
          class="bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase py-3 px-6 border-2 border-neutral-900 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          Initialize Experimental Core &rarr;
        </button>
      </div>
    </div>

    <div
      v-else-if="session.currentPhase === 'TASK_1' || session.currentPhase === 'TASK_2'"
      class="w-full flex flex-col items-center"
    >
      <div
        class="w-full max-w-7xl flex justify-between items-end border-b-4 border-neutral-900 pb-4 mb-6"
      >
        <div>
          <span
            class="text-xs font-bold uppercase tracking-widest text-neutral-900 bg-neutral-100 px-2 py-1 border-2 border-neutral-900"
          >
            RECORD ID: {{ session.uuid }} | SYSTEM BLOCK: {{ session.sequenceGroup }} | CYCLE:
            {{ session.currentPhase }}
          </span>
          <h1 class="text-3xl font-black tracking-tight mt-3 text-neutral-950">
            Asymmetric Bipartite Pipeline Ledger
          </h1>
        </div>

        <button
          v-if="store.isComplete"
          @click="handleTaskProgression"
          class="bg-neutral-950 text-white font-black text-sm uppercase py-3 px-6 border-4 border-neutral-950 hover:bg-neutral-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse"
        >
          Verify & Conclude Condition Sequence &rarr;
        </button>
      </div>

      <div
        class="w-full max-w-7xl flex justify-start space-x-3 mb-4"
        v-if="!store.isAwaitingUserInput && !store.isComplete"
      >
        <button
          @click="store.stepBackward"
          class="border-2 border-neutral-900 bg-white px-4 py-1.5 text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-100"
        >
          &larr; Step Back
        </button>
        <button
          @click="store.stepForward"
          class="border-2 border-neutral-900 bg-neutral-950 text-white px-4 py-1.5 text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800"
        >
          Advance Step &rarr;
        </button>
      </div>

      <MatchingGrid :isStatic="isCurrentTaskStatic" @submit-prediction="handleTelemetryPayload" />
    </div>

    <div
      v-else-if="session.currentPhase === 'SURVEY_1' || session.currentPhase === 'SURVEY_2'"
      class="w-full"
    >
      <SurveyInstrument
        :conditionLabel="activeConditionLabel"
        @submit-survey="handleSurveySubmission"
      />
    </div>

    <Sandbox v-else-if="session.currentPhase === 'SANDBOX'" />

    <DebriefView v-else-if="session.currentPhase === 'DEBRIEF'" />
  </main>
</template>
