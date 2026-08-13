<script setup lang="ts">
import { watch, computed, onMounted } from 'vue'
import { useSessionStore } from './stores/sessionStore'
import { useMatchingStore } from './stores/matchingStore'

import PISView from './components/PISView.vue'
import ConsentGateway from './components/ConsentGateway.vue'
import DebriefView from './components/DebriefView.vue'
import MatchingGrid from './components/MatchingGrid.vue'
import SurveyInstrument from './components/SurveyInstrument.vue'
import Sandbox from './components/Sandbox.vue'
import TutorialInteractive from './components/TutorialInteractive.vue'
import TutorialStatic from './components/TutorialStatic.vue'

import taskA from './data/taskA.json'
import taskB from './data/taskB.json'
import type { DatasetPayload } from './types'

const session = useSessionStore()
const store = useMatchingStore()

onMounted(() => {
  session.restoreSession()
})

// --------------------------------------------------
// PHASING & DATA INGESTION ORCHESTRATOR
// --------------------------------------------------
watch(
  () => session.currentPhase,
  async (newPhase) => {
    if (newPhase === 'TASK_1') {
      const dataset = session.sequenceGroup === 'AB' ? taskA : taskB
      await executeMarketPrecomputation(dataset as DatasetPayload)
    } else if (newPhase === 'TASK_2') {
      const dataset = session.sequenceGroup === 'AB' ? taskB : taskA
      await executeMarketPrecomputation(dataset as DatasetPayload)
    }
  },
)

const executeMarketPrecomputation = async (dataset: DatasetPayload) => {
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

  // Extract the ground truth from the precomputed ledger (Tick + 1)
  const nextFrameIndex = store.tickIndex + 1
  const logicalNextStateFrame = store.stateLedger[nextFrameIndex]
  const expectedEvent = logicalNextStateFrame?.activeEvent

  // 1. Evaluate Action Identity
  const isActionCorrect = payload.predictedAction === expectedEvent?.type

  // 2. Evaluate Target Identity Context
  let isTargetCorrect = false
  if (expectedEvent) {
    if (expectedEvent.type === 'ACCEPT') {
      isTargetCorrect = payload.predictedTarget === expectedEvent.receiverId
    } else if (expectedEvent.type === 'REJECT') {
      isTargetCorrect = payload.predictedTarget === expectedEvent.proposerId
    } else if (expectedEvent.type === 'DISPLACE') {
      isTargetCorrect = payload.predictedTarget === expectedEvent.displacedId
    }
  }

  // Strict Conjunctive Validation (Both must be explicitly true)
  const isCorrect = isActionCorrect && isTargetCorrect

  session.logBreakpointTelemetry(breakpointId, currentCondition, payload.latencyMs, isCorrect)

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
// PSYCHOMETRIC SURVEY PIPELINE
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
  const completedCondition =
    session.currentPhase === 'SURVEY_1' ? session.task1Type : session.task2Type

  if (!session.uuid || !completedCondition) return

  try {
    const formattedPayload = {
      session_uuid: session.uuid,
      condition_type: completedCondition,
      phase_context: session.currentPhase,
      ...payload.nasaTlx,
      ...Object.fromEntries(Object.entries(payload.sus).map(([k, v]) => [`sus_item_${k}`, v])),
    }

    console.table(formattedPayload)
  } catch (e) {
    console.error('Failed to dispatch snapshot survey values:', e)
  }

  if (session.currentPhase === 'SURVEY_1') {
    await session.advanceTo('TRAINING_2')
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
      @consented="session.initializeSession()"
    />

    <template v-else-if="session.currentPhase === 'TRAINING'">
      <TutorialStatic
        v-if="session.task1Type === 'STATIC'"
        @acknowledge="session.advanceTo('TASK_1')"
      />
      <TutorialInteractive
        v-if="session.task1Type === 'REACTIVE'"
        @acknowledge="session.advanceTo('TASK_1')"
      />
    </template>

    <template v-else-if="session.currentPhase === 'TRAINING_2'">
      <TutorialStatic
        v-if="session.task2Type === 'STATIC'"
        @acknowledge="session.advanceTo('TASK_2')"
      />
      <TutorialInteractive
        v-if="session.task2Type === 'REACTIVE'"
        @acknowledge="session.advanceTo('TASK_2')"
      />
    </template>

    <div
      v-else-if="session.currentPhase === 'TASK_1' || session.currentPhase === 'TASK_2'"
      class="w-full flex flex-col items-center"
    >
      <div class="w-full max-w-7xl border-b-4 border-neutral-900 pb-4 mb-6">
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
      </div>

      <MatchingGrid :isStatic="isCurrentTaskStatic" @submit-prediction="handleTelemetryPayload" />

      <div v-if="store.isComplete" class="fixed bottom-10 right-10 z-50 animate-fade-in">
        <button
          @click="handleTaskProgression"
          class="bg-blue-600 text-white text-xl font-black uppercase py-5 px-10 border-4 border-blue-950 hover:bg-blue-700 transition-all shadow-[8px_8px_0px_0px_rgba(30,58,138,1)] active:translate-x-1 active:translate-y-1 active:shadow-[4px_4px_0px_0px_rgba(30,58,138,1)]"
        >
          Execution Complete: Proceed to Survey &rarr;
        </button>
      </div>
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

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}
</style>
